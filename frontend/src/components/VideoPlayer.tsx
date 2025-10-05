import { useEffect, useRef, useState } from 'react';
import {
  PlayerState as AppPlayerState,
  StreamState,
  type PlayerError as AppPlayerError,
} from '../types/stream';
import './VideoPlayer.scss';

// Declare global IVS Player from CDN
declare global {
  interface Window {
    IVSPlayer: any;
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
  const playerRef = useRef<any>(null);

  const [playerState, setPlayerState] = useState<AppPlayerState>(
    AppPlayerState.IDLE
  );
  const [streamState, setStreamState] = useState<StreamState>(
    StreamState.UNKNOWN
  );
  const [muted, setMuted] = useState<boolean>(true);
  const [playerError, setPlayerError] = useState<AppPlayerError | null>(null);
  const [qualities, setQualities] = useState<any[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<any>(null);

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
      console.log('Player: IDLE');
      setPlayerState(AppPlayerState.IDLE);
    });

    player.addEventListener(PlayerState.READY, () => {
      console.log('Player: READY');
      setPlayerState(AppPlayerState.READY);
      setStreamState(StreamState.LIVE);
      const availableQualities = player.getQualities();
      console.log('Available qualities:', availableQualities);
      setQualities(availableQualities);
      setSelectedQuality(player.getQuality());
    });

    player.addEventListener(PlayerState.PLAYING, () => {
      console.log('Player: PLAYING');
      setPlayerState(AppPlayerState.PLAYING);
      setStreamState(StreamState.LIVE);
    });

    player.addEventListener(PlayerState.BUFFERING, () => {
      console.log('Player: BUFFERING');
      setPlayerState(AppPlayerState.BUFFERING);
    });

    player.addEventListener(PlayerState.ENDED, () => {
      console.log('Player: ENDED');
      setPlayerState(AppPlayerState.ENDED);
      setStreamState(StreamState.OFFLINE);
    });

    player.addEventListener(PlayerEventType.ERROR, (err: any) => {
      console.error('Player error:', err);
      setPlayerError({
        type: err.type,
        message: err.message,
        code: err.code,
      });
      setStreamState(StreamState.OFFLINE);
    });

    player.addEventListener(PlayerEventType.QUALITY_CHANGED, (quality: any) => {
      console.log('Quality changed:', quality);
      setSelectedQuality(quality);
    });

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
  }, [playbackUrl, autoplay, muted]);

  const handleQualityChange = (quality: any) => {
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

        <div className="quality-selector">
          <select
            value={selectedQuality?.name || ''}
            onChange={(e) => {
              const quality = qualities.find((q) => q.name === e.target.value);
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
        <div className="player-controls">
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
            {playerState === AppPlayerState.PLAYING ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            onClick={() => {
              if (playerRef.current) {
                playerRef.current.setMuted(!playerRef.current.isMuted());
                setMuted(prev => !prev);
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
