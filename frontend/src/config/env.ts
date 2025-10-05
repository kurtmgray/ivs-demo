interface EnvConfig {
  playbackUrl: string;
  channelArn: string;
  awsRegion: string;
}

function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  playbackUrl: getEnvVar('VITE_PLAYBACK_URL'),
  channelArn: getEnvVar('VITE_CHANNEL_ARN'),
  awsRegion: getEnvVar('VITE_AWS_REGION'),
};

if (import.meta.env.DEV) {
  console.log("Env config loaded:", env);
}