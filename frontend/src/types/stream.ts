export enum StreamState {
  LIVE = "LIVE",
  OFFLINE = "OFFLINE",
  UNKNOWN = "UNKNOWN",
}

export enum PlayerState {
  IDLE = "IDLE",
  PLAYING = "PLAYING",
  READY = "READY",
  BUFFERING = "BUFFERING",
  ENDED = "ENDED",
}

export interface StreamMetadata {
  state: StreamState;
  startTime?: Date;
  viewerCount?: number;
  title?: string;
}

export interface PlayerError {
  type: string;
  message: string;
  code?: string;
}