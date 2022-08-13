import { deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { getFunctions, httpsCallable, logMessage } from "firebase/functions";



// Allows user to heart or like a project
export default function DeleteButton({ deleteRef, project=false, username }) {
  const router = useRouter();
  const deleteContent = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      await deleteDoc(deleteRef);
      toast('deleted', { icon: '🗑️' });
      project? 
      router.push('/'+username)
      :router.reload()
    }
  };

/**
 * Call the 'recursiveDelete' callable function with a path to initiate
 * a server-side delete.
 */
 const deleteAtPath = async () => {
  const functions = getFunctions();
  const deleteFn = httpsCallable(functions, 'recursiveDelete');
  console.log(functions);
  deleteFn({ path: deleteRef.path })
      .then((result) => {
          console.log(result.data.text);
          // logMessage('Delete success: ' + JSON.stringify(result));
      })
      .catch((err) => {
          // logMessage('Delete failed, see console,');
          console.warn(err.message);
      });
}

  return (
    <button className="btn btn-error" onClick={deleteAtPath}>
      🗑️
    </button>
  );
}