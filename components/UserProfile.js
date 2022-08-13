import { doc, getFirestore } from 'firebase/firestore';
import { useState } from 'react';
import Editor from '../components/Editor';
import { useContext } from 'react';
import { UserContext } from '../lib/context';


// UI component for user profile


export default function UserProfile( {user} ) {
  const [edit, setEdit] = useState(false);
  const { user: currentUser } = useContext(UserContext);
  const userRef = doc(getFirestore(), 'users', user.uid);

  return (
    <div className="text-center">
      <div className="avatar">
        <div className=" w-40 rounded-full">
          <img src={user.photoURL || '/hacker.png'} className="" />
        </div>
      </div>
      <p>
        <i className="">@{user.username}</i>
      </p>
      <h1 className="text-3xl">{user.displayName || 'Anonymous User'}</h1>

      <div className="card shadow-xl bg-base-100 md:mx-10 mx-1 my-5">
        <div className="card-body">
          <Editor defaultValue ={user.profile} contentRef={userRef} edit={edit} profile={true}/>

          {currentUser?.uid === user.uid && !edit &&(
              <div className="text-right">
                  <button className="btn btn-info" onClick={()=>{setEdit(true)}}>Edit Profile</button>
                  </div>
            )}
          {currentUser?.uid === user.uid && edit &&(
              <div className="text-right">
                  <button className="btn btn-info" onClick={()=>{setEdit(false)}}>Edit Done</button>
                  </div>
            )}
        </div>
      </div>
    </div>
  );
}
