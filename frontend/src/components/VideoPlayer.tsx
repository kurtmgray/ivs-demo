import { useEffect, useRef, useState } from 'react';
import {
  PlayerState as AppPlayerState,
  StreamState,
  type PlayerError as AppPlayerError,
} from '../types/stream';
import type {
  MediaPlayer,
  Quality,
  PlayerError as IVSPlayerError,
  PlayerState as IVSPlayerState,
  PlayerEventType as IVSPlayerEventType,
} from 'amazon-ivs-player';
import './VideoPlayer.scss';

declare global {
  interface Window {
    IVSPlayer: {
      create(): MediaPlayer;
      isPlayerSupported: boolean;
      PlayerState: typeof IVSPlayerState;
      PlayerEventType: typeof IVSPlayerEventType;
    };
  }
}

interface VideoPlayerProps {
  playbackUrl: string;
  autoplay?: boolean;
}

export function VideoPlayer({
  playbackUrl,
  autoplay = true,
}: VideoPlayerProps) {
  const videoEl = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<MediaPlayer | null>(null);

  const [playerState, setPlayerState] = useState<AppPlayerState>(
    AppPlayerState.IDLE
  );
  const [streamState, setStreamState] = useState<StreamState>(
    StreamState.UNKNOWN
  );
  const [muted, setMuted] = useState<boolean>(true);
  const [playerError, setPlayerError] = useState<AppPlayerError | null>(null);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<Quality | null>(null);

  useEffect(() => {
    if (!videoEl.current || !window.IVSPlayer) {
      console.log('Waiting for IVS Player to load...');
      return;
    }

    const { PlayerState, PlayerEventType, isPlayerSupported } =
      window.IVSPlayer;

    if (!isPlayerSupported) {
      setPlayerError({
        type: 'UNSUPPORTED',
        message: 'IVS Player not supported',
      });
      return;
    }

    console.log('Creating IVS Player...');
    const player = window.IVSPlayer.create();
    playerRef.current = player;

    player.attachHTMLVideoElement(videoEl.current);

    // Event listeners
    player.addEventListener(PlayerState.IDLE, () => {
      console.log('IDLE');
      setPlayerState(AppPlayerState.IDLE);
    });

    player.addEventListener(PlayerState.READY, () => {
      console.log('READY');
      setPlayerState(AppPlayerState.READY);
      setStreamState(StreamState.LIVE);
      const availableQualities = player.getQualities();
      console.log('Stream qualities:', availableQualities);
      setQualities(availableQualities);
      setSelectedQuality(player.getQuality());
    });

    player.addEventListener(PlayerState.PLAYING, () => {
      console.log('PLAYING');
      setPlayerState(AppPlayerState.PLAYING);
      setStreamState(StreamState.LIVE);
    });

    player.addEventListener(PlayerState.BUFFERING, () => {
      console.log('BUFFERING');
      setPlayerState(AppPlayerState.BUFFERING);
    });

    player.addEventListener(PlayerState.ENDED, () => {
      console.log('ENDED');
      setPlayerState(AppPlayerState.ENDED);
      setStreamState(StreamState.OFFLINE);
    });

    player.addEventListener(PlayerEventType.ERROR, (err: IVSPlayerError) => {
      console.error('error:', err);

      // ignore "failed to load playlist" errors - these are expected when stream is offline
      if (err.message?.toLowerCase().includes('failed to load playlist')) {
        setStreamState(StreamState.OFFLINE);
        return;
      }

      setPlayerError({
        type: err.type,
        message: err.message,
        code: String(err.code),
      });
      setStreamState(StreamState.OFFLINE);
    });

    player.addEventListener(
      PlayerEventType.QUALITY_CHANGED,
      (quality: Quality) => {
        console.log('Quality change:', quality);
        setSelectedQuality(quality);
      }
    );

    player.setMuted(muted);
    player.load(playbackUrl);

    if (autoplay) {
      player.play();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.delete();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackUrl, autoplay]);

  const handleQualityChange = (quality: Quality) => {
    if (playerRef.current) {
      playerRef.current.setQuality(quality);
    }
  };

  return (
    <div className="video-player">
      <div className="video-container">
        <video ref={videoEl} className="video-element" playsInline />

        <div className={`stream-status ${streamState.toLowerCase()}`}>
          {streamState === StreamState.LIVE && (
            <>
              <span className="live-dot"></span>
              LIVE
            </>
          )}
          {streamState === StreamState.OFFLINE && 'OFFLINE'}
          {streamState === StreamState.UNKNOWN && 'LOADING...'}
        </div>

        {qualities?.length > 0 && (
          <div className="quality-selector">
            <select
              value={selectedQuality?.name || ''}
              onChange={(e) => {
                const quality = qualities.find(
                  (q) => q.name === e.target.value
                );
                if (quality) handleQualityChange(quality);
              }}
            >
              {qualities.map((quality) => (
                <option key={quality.name} value={quality.name}>
                  {quality.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="player-controls">

          <button
            className="player-button"
            onClick={() => {
              playerRef.current?.load(playbackUrl);
              playerRef.current?.play();
              setPlayerError(null);
            }}
          >
            Refresh
          </button>

          <button
            onClick={() => {
              if (playerRef.current) {
                if (playerState === AppPlayerState.PLAYING) {
                  playerRef.current.pause();
                } else {
                  playerRef.current.play();
                }
              }
            }}
          >
            {playerState === AppPlayerState.PLAYING ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={() => {
              if (playerRef.current) {
                playerRef.current.setMuted(!playerRef.current.isMuted());
                setMuted((prev) => !prev);
              }
            }}
          >
            {muted ? 'Unmute' : 'Mute'}
          </button>
        </div>
      </div>

      <div className="player-info">
        <div className="info-item">
          <span className="label">Player State:</span>
          <span className="value">{playerState}</span>
        </div>
        {selectedQuality && (
          <div className="info-item">
            <span className="label">Quality:</span>
            <span className="value">
              {selectedQuality.width}x{selectedQuality.height} @
              {Math.round(selectedQuality.bitrate / 1000)}kbps
            </span>
          </div>
        )}
      </div>

      {playerError && (
        <div className="player-error">
          <strong>Error:</strong> {playerError.message}
        </div>
      )}
    </div>
  );
}
