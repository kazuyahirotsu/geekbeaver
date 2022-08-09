import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Editor from '../components/Editor';
import { useContext } from 'react';
import { UserContext } from '../lib/context';

// UI component for user profile


export default function UserProfile( {user} ) {
  const [edit, setEdit] = useState(false);
  const { user: currentUser } = useContext(UserContext);
  const userRef = doc(getFirestore(), 'users', user.uid);

  return (
    <div className="box-center">
      <img src={user.photoURL || '/hacker.png'} className="card-img-center" />
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName || 'Anonymous User'}</h1>
      
      <Editor defaultValue ={user.profile} contentRef={userRef} edit={edit} profile={true}/>

      {currentUser?.uid === user.uid && !edit &&(
          <>
              <button className="btn-blue" onClick={()=>{setEdit(true)}}>Edit Post</button>
          </>
        )}
      {currentUser?.uid === user.uid && edit &&(
          <>
              <button className="btn-blue" onClick={()=>{setEdit(false)}}>Edit Done</button>
          </>
        )}
    </div>
  );
}
