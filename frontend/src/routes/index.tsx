import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent
});

function RouteComponent(){
  return (
      <div className="home">
        <h1>AWS IVS Demo</h1>
        <p>A demo application showcasing AWS Interactive Video Service</p>

        <div className="feature-grid">
          <div className="feature-card">
            <h2>Watch</h2>
            <p>View low-latency live stream</p>
          </div>

          <div className="feature-card">
            <h2>Dashboard</h2>
            <p>Stream health and other metrics</p>
          </div>

          <div className="feature-card">
            <h2>Chat</h2>
            <p>(not implemented)</p>
          </div>
        </div>
      </div>
    )
  }