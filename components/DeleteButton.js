import { deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { getFunctions, httpsCallable, logMessage } from "firebase/functions";
import { functions } from "../lib/firebase"


// Allows user to heart or like a project
export default function DeleteButton({ deleteRef, project=false, username }) {
  const router = useRouter();

  const deleteAtPath = async () => {
    // const functions = getFunctions();
    const deleteFn = httpsCallable(functions, 'recursiveDelete');
    const doIt = confirm('are you sure!');
    if (doIt) {
      deleteFn({ path: deleteRef.path })
      .then((result) => {
          toast('deleted', { icon: '🗑️' });
          project? 
          router.push('/'+username)
          :router.reload()
      })
      .catch((err) => {
          console.warn(err);
      });
    }
  }

  return (
    <button className="btn btn-error" onClick={deleteAtPath}>
      🗑️
    </button>
  );
}