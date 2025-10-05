 export interface IVSQuality {
    name: string;
    codecs: string;
    bitrate: number;
    width: number;
    height: number;
    framerate: number;
  }

  export interface IVSPlayerError {
    type: string;
    message: string;
    code: number;
    source: string;
  }

  export const IVSPlayerState = {
    IDLE: 'Idle',
    READY: 'Ready',
    BUFFERING: 'Buffering',
    PLAYING: 'Playing',
    ENDED: 'Ended',
  } as const;

  export const IVSPlayerEventType = {
    INITIALIZED: 'PlayerInitialized',
    QUALITY_CHANGED: 'PlayerQualityChanged',
    DURATION_CHANGED: 'PlayerDurationChanged',
    ERROR: 'PlayerError',
    TIME_UPDATE: 'PlayerTimeUpdate',
    REBUFFERING: 'PlayerRebuffering',
  } as const;

  export type IVSPlayerStateValue = typeof IVSPlayerState[keyof typeof IVSPlayerState];
  export type IVSPlayerEventTypeValue = typeof IVSPlayerEventType[keyof typeof IVSPlayerEventType];

  export interface IVSPlayer {
    attachHTMLVideoElement(element: HTMLVideoElement): void;
    load(url: string): void;
    play(): void;
    pause(): void;
    setMuted(muted: boolean): void;
    setVolume(volume: number): void;
    getQualities(): IVSQuality[];
    getQuality(): IVSQuality;
    setQuality(quality: IVSQuality): void;
    delete(): void;
    addEventListener(event: string, handler: (payload?: any) => void): void;
    removeEventListener(event: string, handler: (payload?: any) => void): void;
  }

  export interface IVSPlayerModule {
    create(config?: { wasmWorker?: string; wasmBinary?: string }): IVSPlayer;
    isPlayerSupported: boolean;
    PlayerState: typeof IVSPlayerState;
    PlayerEventType: typeof IVSPlayerEventType;
  }
