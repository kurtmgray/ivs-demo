import { createFileRoute } from '@tanstack/react-router';
import { VideoPlayer } from '../components/VideoPlayer';
import { env } from '../config/env';

export const Route = createFileRoute('/watch')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="watch-page">
      <h1>Live Stream</h1>
      <p className="stream-description">
        AWS IVS Live Stream Demo...
      </p>

      <VideoPlayer playbackUrl={env.playbackUrl} autoplay={true} />
    </div>
  );
}
