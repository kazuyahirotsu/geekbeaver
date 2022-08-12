import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import HeartButton from '../components/HeartButton';
import AuthCheck from '../components/AuthCheck';
import { doc, getFirestore, query, collection, orderBy, getDocs } from 'firebase/firestore';
import { projectToJSON } from '../lib/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../lib/context';
import Editor from '../components/Editor'
import Comments from '../components/Comments';



export default function PostFeed({ posts, admin, mentionProject=false }) {
  const { user: currentUser, username } = useContext(UserContext);
  return posts ? posts.map((post) => <PostItem post_slow={post} key={post.slug} admin={admin} currentUser={currentUser} mentionProject={mentionProject}/>) : null;
}

function PostItem({ post_slow, admin = false , currentUser, mentionProject }) {
  const [edit, setEdit] = useState(false);
  const [comments, setComments] = useState();

  const postRef = doc(getFirestore(), 'users', post_slow.uid, 'projects', post_slow.projectSlug, 'posts', post_slow.slug);
  const [realtimePost] = useDocumentData(postRef);
  const post = realtimePost || post_slow;

  // Naive method to calc word count and read time
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);
  const createdAt = typeof post?.createdAt === 'number' ? new Date(post.createdAt) : post.createdAt.toDate();
  
  const date = new Date();
  const newCommentRef = doc(getFirestore(), 'users', post.uid, 'projects', post.projectSlug, 'posts', post.slug, 'comments', String(date.getTime())); // todo add uid or username to newslug
  
  const getComments = async () => {
    const commentsQuery = query(
      collection(getFirestore(), 'users', post.uid, 'projects', post.projectSlug, 'posts', post.slug, 'comments'),
      orderBy('createdAt')
    );
    setComments((await getDocs(commentsQuery)).docs.map(projectToJSON));
  };

  useEffect(() => {
    getComments();
  }, []);

  return (
    
    <div className="card shadow-xl bg-base-100 md:mx-10 mx-1 my-5">
      <div className="card-body">
        <span className="flex flex-col">
          {mentionProject && 
          <div className="flex">
          <Link href={`/${post.username}/${post.projectSlug}`}>
            <a className="">
            Project: 
            <strong className="text-info">{post.projectTitle}</strong>
            </a>
          </Link>
          </div>}
          
          <div className="flex">
          <Link href={`/${post.username}/`}>
            <a className="">By <strong className="text-info">@{post.username}</strong></a>
          </Link>
          </div>

          <p className="">{createdAt.toISOString()}</p>
        </span>

        <Editor defaultValue={post.content} project={post} contentRef={postRef} edit={edit}/>

        {!edit&&<div className="flex flex-row ml-auto">
          {/* hearts */}
          <AuthCheck
            fallback={
              <Link href="/enter">
                <button className="text-3xl">🤍</button>
              </Link>
            }
          >
            <HeartButton projectRef={postRef} postHeart={true}  post={post}/>
          </AuthCheck>
          <span className="text-3xl">{post.heartCount || 0}</span>
        </div>}

        {/* If admin view, show extra controls for user */}
        {currentUser?.uid === post.uid && !edit &&(
            <div className="text-right">
              <button className="btn btn-info" onClick={()=>{setEdit(true)}}>Edit Post</button>
            </div>
          )}
        {currentUser?.uid === post.uid && edit &&(
            <div className="text-right">
              <button className="btn btn-info" onClick={()=>{setEdit(false)}}>Edit Done</button>
            </div>
          )}

        {/* comment section */}
        <div tabIndex="0" className="collapse collapse-plus border border-base-300 bg-base-100 rounded-box">
          <input type="checkbox" className="peer" />
          <div className="collapse-title">
            comments
          </div>
          <div className="collapse-content">      
            {comments? <Comments comments={comments} newSlug={String(date.getTime())} newCommentRef={newCommentRef} parentUid={post.uid} parentProjectSlug={post.projectSlug} parentPostSlug={post.slug} />:null}
          </div>
        </div>
      </div>
    </div> 

  );
}
