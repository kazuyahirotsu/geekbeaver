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
  return(
    <div>
        {comments ? comments.map((comment) => <Comment comment_slow={comment} key={comment.slug}  currentUser={currentUser} parentUid={parentUid} parentProjectSlug={parentProjectSlug} parentPostSlug={parentPostSlug}/>) : null}

        <div className="mt-5 text-right">
            <AuthCheck
            fallback={
            <Link href="/enter">
                <button className="btn btn-info">Sign Up to comment</button>
            </Link>
            }>
            <Editor defaultValue={""} contentRef={newCommentRef} newSlug={newSlug} newPost={true} currentUser={currentUser} currentUsername={username} newComment={true}/>
            </AuthCheck>
        </div>

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
    <div className="">

        <span className="flex flex-col">
          <Link href={`/${comment.username}/`}>
            <a>By <strong className="text-info">@{comment.username}</strong></a>
          </Link>

          <p className="text-right">{createdAt.toISOString()}</p>
        </span>

      <Editor defaultValue={comment.comment} contentRef={commentRef} edit={edit} comment={true}/>


      {/* If admin view, show extra controls for user */}
      {currentUser?.uid === comment.uid && !edit &&(
          <div className="text-right">
              <button className="btn btn-info" onClick={()=>{setEdit(true)}}>Edit comment</button>
          </div>
        )}
      {currentUser?.uid === comment.uid && edit &&(
          <div className="text-right">
              <button className="btn btn-info" onClick={()=>{setEdit(false)}}>Edit Done</button>
          </div>
        )}
    </div>
  );
}