// NOTE: Hardcoded for demo
// In production, these should be fetched from a backend endpoint

interface EnvConfig {
  playbackUrl: string;
  channelArn: string;
  awsRegion: string;
}

export const env: EnvConfig = {
  playbackUrl: 'https://4f96398f983b.us-west-2.playback.live-video.net/api/video/v1/us-west-2.919488177132.channel.YFCwsgoCGJ4S.m3u8',
  channelArn: 'arn:aws:ivs:us-west-2:919488177132:channel/YFCwsgoCGJ4S',
  awsRegion: 'us-west-2',
};

if (import.meta.env.DEV) {
  console.log("Env config loaded:", env);
}