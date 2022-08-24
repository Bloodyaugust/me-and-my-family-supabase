import { useContext } from "react"
import { SupabaseContext } from "../SupabaseContext"

export default function Profile() {
  const { currentUser, signOut } = useContext(SupabaseContext);

  return (
    <div>
      <span>{currentUser?.id} - {currentUser?.email}</span>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}