import { useContext } from "react"
import { SupabaseContext } from "../SupabaseContext"
import styles from './Profile.module.css';

export default function Profile() {
  const { currentUser, currentUserImages, images, signOut } = useContext(SupabaseContext);

  return (
    <div className={styles.root}>
      <span>{currentUser?.id} - {currentUser?.email}</span>
      <div className={styles.images}>
        {currentUserImages.map(image => (
          <img alt="From profile" className={styles.image} key={image} src={images[image]} />
        ))}
      </div>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}