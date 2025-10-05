import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="app">
      <nav className="nav">
        <div className="nav-container">
          <h1 className="nav-logo">IVS Demo</h1>
          <div className="nav-links">
            <Link
              to="/"
              className="nav-link"
              activeProps={{ className: 'active' }}
            >
              Home
            </Link>
            <Link
              to="/watch"
              className="nav-link"
              activeProps={{ className: 'active' }}
            >
              Watch
            </Link>
            <Link
              to="/dashboard"
              className="nav-link"
              activeProps={{ className: 'active' }}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  ),
});
