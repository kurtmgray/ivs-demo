import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="dashboard-page">
      <h1>Stream Dashboard</h1>
      <p>Stream health metrics will go here</p>
    </div>
  );
}
