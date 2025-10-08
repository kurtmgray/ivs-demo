import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
});

interface StreamData {
  state: string;
  startTime: string;
  viewerCount: number;
  health: string;
  streamId: string;
  playbackUrl: string;
  channelArn: string;
  ingest: {
    videoCodec: string;
    videoWidth: number;
    videoHeight: number;
    videoFramerate: number;
    videoBitrate: number;
    audioCodec: string;
    audioSampleRate: number;
    audioChannels: number;
    audioBitrate: number;
  };
}

function RouteComponent() {
  const [streamData, setStreamData] = useState<StreamData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/stream/metadata');
        const data = await response.json();
        setStreamData(data);
      } catch (err) {
        console.error('Failed to fetch stream data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dashboard-page">
      <h1>Stream Dashboard</h1>
      <pre>{JSON.stringify(streamData, null, 2)}</pre>{' '}
    </div>
  );
}
