import { deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

// Allows user to heart or like a project
export default function DeleteButton({ deleteRef, project=false, username }) {
  const router = useRouter();
  const deletePost = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      await deleteDoc(deleteRef);
      toast('deleted', { icon: '🗑️' });
      project? 
      router.push('/'+username)
      :router.reload()
    }
  };

  return (
    <button className="btn btn-error" onClick={deletePost}>
      🗑️
    </button>
  );
}