import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import HeartButton from '../components/HeartButton';
import AuthCheck from '../components/AuthCheck';
import { doc, getFirestore } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { UserContext } from '../lib/context';
import Editor from '../components/Editor'
import Comments from '../components/Comments';
import DeleteButton from '../components/DeleteButton';



// UI component for main project content
export default function ProjectContent({ project, comments}) {
  const [projectedit, setProjectEdit] =useState(false);
  const { user: currentUser, username } = useContext(UserContext);
  const projectRef = doc(getFirestore(), 'users', project.uid, 'projects', project.slug);
  const createdAt = typeof project?.createdAt === 'number' ? new Date(project.createdAt) : project.createdAt.toDate();
  const date = new Date();
  const newCommentRef = doc(getFirestore(), 'users', project.uid, 'projects', project.slug, 'comments', String(date.getTime())); // todo add uid or username to newslug


  return (
    <div className="card shadow-xl bg-base-100 md:mx-10 mx-1 my-5">
      <div className="card-body">
        {/* project content */}
        {!projectedit &&
        <>
          <h1 className="card-title text-5xl mb-5">{project?.title}</h1>
          <div className="flex flex-col mb-5">
            <Link href={`/${project.username}/`}>
              <a className="text-right">
            By <strong className="text-info"> @{project.username}</strong>
              </a>
            </Link>
            <p className="text-right">{createdAt.toLocaleString()}</p>
          </div>
        </>
        }
        <Editor defaultValue={project.content} defaultTitle={project.title} contentRef={projectRef} projectedit={projectedit}/>
        
        {!projectedit &&
        <>
        <div className="flex flex-row ml-auto">
          {/* hearts */}
          <AuthCheck
            fallback={
              <Link href="/enter">
                <button className="text-3xl">🤍</button>
              </Link>
            }
          >
            <HeartButton projectRef={projectRef} projectHeart={true} project={project}/>
          </AuthCheck>
          <span className="text-3xl">{project.heartCount || 0}</span>
          {/* view count */}
          <span className="text-3xl ml-5">👀{project.viewCount}</span>
        </div>
        </>}



        {/* edit button for admin user */}
        {currentUser?.uid === project.uid && !projectedit &&(
          <div className="text-right">
              <button className="btn btn-info mr-1" onClick={()=>setProjectEdit(true)}>✏️</button>
              <DeleteButton deleteRef={projectRef} project={true} username={username}/>
          </div>
        )}
        {currentUser?.uid === project.uid && projectedit &&(
          <div className="text-right">
              <button className="btn btn-outline btn-info" onClick={()=>setProjectEdit(false)}>✏️</button>
          </div>
        )}

        {/* comment section */}
        {/* show comment */}
        <div tabIndex="0" className="collapse collapse-plus border border-base-300 bg-base-100 rounded-box">
          <input type="checkbox" className="peer" />
          <div className="collapse-title">
            comments
          </div>
          <div className="collapse-content">      
            {comments?  <Comments comments={comments} newSlug={String(date.getTime())} newCommentRef={newCommentRef} parentUid={project.uid} parentProjectSlug={project.slug} />:null}
          </div>
        </div>
        {/* add comment */}
      </div>
    </div>
  );
}
