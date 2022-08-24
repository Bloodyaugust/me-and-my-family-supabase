import { Link, Outlet, useLocation } from 'react-router-dom';
import styles from './Main.module.css';

export default function Main() {
  const location = useLocation();

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.link}>Feed</Link>
        <Link to="/profile" className={styles.link}>Profile</Link>
      </nav>
      <div className={styles.header}>
        <h1 className={styles.heading}>{location.pathname.split('/')[1] || 'Feed'}</h1>
      </div>
      <div className={styles.content}>
        <Outlet />
      </div>
      <footer className={styles.footer}>
        <span>Me and My Family - Made with ❤️ by Greyson Richey</span>
      </footer>
    </div>
  )
}