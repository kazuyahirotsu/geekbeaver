import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import HeartButton from '../components/HeartButton';
import AuthCheck from '../components/AuthCheck';
import { doc, getFirestore } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useContext, useState } from 'react';
import { UserContext } from '../lib/context';
import Editor from '../components/Editor'



export default function Comments({ comments, newCommentRef, newSlug, parentUid, parentProjectSlug, parentPostSlug }) {
  const { user: currentUser, username } = useContext(UserContext);
  const date = new Date();
  return(
    <div>
        <AuthCheck
        fallback={
          <Link href="/enter">
            <button>Sign Up to comment</button>
          </Link>
        }>
        <div className="card">
        <p>Add new comment</p>
        <Editor defaultValue={""} contentRef={newCommentRef} newSlug={String(date.getTime())} newPost={true} currentUser={currentUser} currentUsername={username} newComment={true}/>
        </div>
      </AuthCheck>

        {comments ? comments.map((comment) => <Comment comment_slow={comment} key={comment.slug}  currentUser={currentUser} parentUid={parentUid} parentProjectSlug={parentProjectSlug} parentPostSlug={parentPostSlug}/>) : null}
    </div>
  ) 
}

function Comment({ comment_slow, currentUser, parentUid, parentProjectSlug, parentPostSlug }) {
  const [edit, setEdit] = useState(false);
  let commentRef
  if(parentPostSlug){
    commentRef = doc(getFirestore(), 'users', parentUid, 'projects', parentProjectSlug, 'posts', parentPostSlug, 'comments', comment_slow.slug);
  }else{
    commentRef = doc(getFirestore(), 'users', parentUid, 'projects', parentProjectSlug, 'comments', comment_slow.slug);
  }

  const [realtimeComment] = useDocumentData(commentRef);
  const comment = realtimeComment || comment_slow;

  // Naive method to calc word count and read time
  const wordCount = comment?.comment.trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);
  const createdAt = typeof comment?.createdAt === 'number' ? new Date(comment.createdAt) : comment.createdAt.toDate();


  return (
    <div className="card">

      <span className="text-sm">
        Written by{' '}
        <Link href={`/${comment.username}/`}>
          <a className="text-info">@{comment.username}</a>
        </Link>{' '}
        on {createdAt.toISOString()}
      </span>
      <Editor defaultValue={comment.comment} contentRef={commentRef} edit={edit} comment={true}/>


      {/* If admin view, show extra controls for user */}
      {currentUser?.uid === comment.uid && !edit &&(
          <>
              <button className="btn-blue" onClick={()=>{setEdit(true)}}>Edit comment</button>
          </>
        )}
      {currentUser?.uid === comment.uid && edit &&(
          <>
              <button className="btn-blue" onClick={()=>{setEdit(false)}}>Edit Done</button>
          </>
        )}
    </div>
  );
}