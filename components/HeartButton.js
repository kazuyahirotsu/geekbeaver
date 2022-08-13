import { auth } from '../lib/firebase';
import { useDocument } from 'react-firebase-hooks/firestore';
import { increment, writeBatch, doc, getFirestore, serverTimestamp, getDoc } from "firebase/firestore";


// Allows user to heart or like a project
export default function Heart({ projectRef, postHeart=false, post, projectHeart=false, project }) {
  // Listen to heart document for currently logged in user

  const heartRef = doc(getFirestore(), projectRef.path, 'hearts', auth.currentUser.uid);
  const [heartDoc] = useDocument(heartRef);

  let userHeartRef;
  postHeart? userHeartRef = doc(getFirestore(), 'users', auth.currentUser.uid, 'posthearts', post.uid+post.slug)
  :projectHeart? userHeartRef = doc(getFirestore(), 'users', auth.currentUser.uid, 'projecthearts', project.uid+project.slug)
  :null;

  // Create a user-to-project relationship
  const addHeart = async () => {
    const uid = auth.currentUser.uid;
    const batch = writeBatch(getFirestore());

    batch.set(userHeartRef,
       {ref: projectRef.path,
        heartAt: serverTimestamp(),
      })
    batch.update(projectRef, { heartCount: increment(1) });
    batch.set(heartRef, { uid });

    await batch.commit();
  };

  // Remove a user-to-project relationship
  const removeHeart = async () => {
    const batch = writeBatch(getFirestore());

    batch.update(projectRef, { heartCount: increment(-1) });
    batch.delete(heartRef);
    batch.delete(userHeartRef);

    await batch.commit();
  };

  return heartDoc?.exists() ? (
    <button onClick={removeHeart} className="text-3xl">💗</button>
  ) : (
    <button onClick={addHeart} className="text-3xl" >🤍</button>
  );
}
