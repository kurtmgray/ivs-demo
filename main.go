package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ivs"
	"github.com/joho/godotenv"
)

type StreamStats struct {
	State       string        `json:"state"`
	StartTime   *string       `json:"startTime,omitempty"`
	ViewerCount int64         `json:"viewerCount"`
	Health      string        `json:"health"`
	StreamId    string        `json:"streamId,omitempty"`
	PlaybackUrl string        `json:"playbackUrl,omitempty"`
	ChannelArn  string        `json:"channelArn,omitempty"`
	Ingest      *IngestConfig `json:"ingest,omitempty"`
}

type IngestConfig struct {
	VideoCodec      string  `json:"videoCodec,omitempty"`
	AudioCodec      string  `json:"audioCodec,omitempty"`
	VideoWidth      int32   `json:"videoWidth,omitempty"`
	VideoHeight     int32   `json:"videoHeight,omitempty"`
	VideoFramerate  float64 `json:"videoFramerate,omitempty"`
	VideoBitrate    int64   `json:"videoBitrate,omitempty"`
	AudioBitrate    int64   `json:"audioBitrate,omitempty"`
	AudioChannels   int32   `json:"audioChannels,omitempty"`
	AudioSampleRate int64   `json:"audioSampleRate,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

var ivsClient *ivs.Client
var channelArn string

func init() {
	godotenv.Load()

	channelArn = os.Getenv("CHANNEL_ARN")
	region := os.Getenv("AWS_REGION")

	cfg, err := config.LoadDefaultConfig(context.Background(),
		config.WithRegion(region),
	)
	if err != nil {
		log.Fatal("Failed to load SDK config:", err)
	}

	ivsClient = ivs.NewFromConfig(cfg)
}

func setupCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func getStreamMetadata(w http.ResponseWriter, r *http.Request) {
	setupCORS(w)
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	ctx := context.Background()
	input := &ivs.GetStreamInput{
		ChannelArn: aws.String(channelArn),
	}

	result, err := ivsClient.GetStream(ctx, input)

	if err != nil {
		stats := StreamStats{
			State:       "OFFLINE",
			StartTime:   nil,
			ViewerCount: 0,
			Health:      "UNKNOWN",
		}
		json.NewEncoder(w).Encode(stats)
		return
	}

	stream := result.Stream
	stats := StreamStats{
		State:       string(stream.State),
		ViewerCount: stream.ViewerCount,
		Health:      string(stream.Health),
		StreamId:    aws.ToString(stream.StreamId),
		PlaybackUrl: aws.ToString(stream.PlaybackUrl),
		ChannelArn:  aws.ToString(stream.ChannelArn),
	}

	if stream.StartTime != nil {
		timeStr := stream.StartTime.Format("2006-01-02T15:04:05.000Z")
		stats.StartTime = &timeStr
	}

	if stream.StreamId != nil && *stream.StreamId != "" {
		sessionInput := &ivs.GetStreamSessionInput{
			ChannelArn: aws.String(channelArn),
			StreamId:   stream.StreamId,
		}

		sessionResult, err := ivsClient.GetStreamSession(ctx,
			sessionInput)
		if err == nil && sessionResult.StreamSession != nil {
			session := sessionResult.StreamSession
			if session.IngestConfiguration != nil {
				ingest := &IngestConfig{}

				if session.IngestConfiguration.Video != nil {
					video := session.IngestConfiguration.Video
					ingest.VideoCodec = aws.ToString(video.Codec)
					ingest.VideoWidth = int32(video.VideoWidth)
					ingest.VideoHeight = int32(video.VideoHeight)
					ingest.VideoFramerate = float64(video.TargetFramerate)
					ingest.VideoBitrate = video.TargetBitrate
				}

				if session.IngestConfiguration.Audio != nil {
					audio := session.IngestConfiguration.Audio
					ingest.AudioCodec = aws.ToString(audio.Codec)
					ingest.AudioBitrate = audio.TargetBitrate
					ingest.AudioChannels = int32(audio.Channels)
					ingest.AudioSampleRate = audio.SampleRate
				}

				stats.Ingest = ingest
			}
		}
	}

	json.NewEncoder(w).Encode(stats)
}

func spaHandler(staticPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(staticPath, r.URL.Path)

		// Check if file exists
		_, err := os.Stat(path)
		if os.IsNotExist(err) {
			// Serve index.html for SPA routing
			http.ServeFile(w, r, filepath.Join(staticPath, "index.html"))
			return
		}

		// Serve the file
		http.FileServer(http.Dir(staticPath)).ServeHTTP(w, r)
	}
}

func main() {
	http.HandleFunc("/api/stream/metadata", getStreamMetadata)

	staticPath := "./frontend/dist"
	http.HandleFunc("/", spaHandler(staticPath))
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	fmt.Printf("Backend server running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
