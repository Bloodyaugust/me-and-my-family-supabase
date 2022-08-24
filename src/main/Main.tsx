import { Link, Outlet } from "react-router-dom";

export default function Main() {
  return (
    <div>
      <div>
        <nav>
          <Link to="/">Feed</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}