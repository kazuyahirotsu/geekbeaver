import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import HeartButton from '../components/HeartButton';
import AuthCheck from '../components/AuthCheck';
import { doc, getFirestore } from 'firebase/firestore';
import { useContext } from 'react';
import { UserContext } from '../lib/context';
import Editor from '../components/Editor'
import Comments from '../components/Comments';


// UI component for main project content
export default function ProjectContent({ project, comments}) {
  const { user: currentUser, username } = useContext(UserContext);
  const projectRef = doc(getFirestore(), 'users', project.uid, 'projects', project.slug);
  const createdAt = typeof project?.createdAt === 'number' ? new Date(project.createdAt) : project.createdAt.toDate();
  const date = new Date();
  const newCommentRef = doc(getFirestore(), 'users', project.uid, 'projects', project.slug, 'comments', String(date.getTime())); // todo add uid or username to newslug


  return (
    <div className="card">

      {/* project content */}
      <h1>{project?.title}</h1>
      <span className="text-sm">
        Written by{' '}
        <Link href={`/${project.username}/`}>
          <a className="text-info">@{project.username}</a>
        </Link>{' '}
        on {createdAt.toISOString()}
      </span>
      <Editor defaultValue={project.content} contentRef={projectRef} edit={false}/>

      {/* view count */}
      <span className="text-info">viewed {project.viewCount} times</span>
      
      {/* hearts */}
      <span className="push-left">💗 {project.heartCount || 0} Hearts</span>
      <AuthCheck
        fallback={
          <Link href="/enter">
            <button>💗 Sign Up</button>
          </Link>
        }
      >
        <HeartButton projectRef={projectRef} />
      </AuthCheck>

      {/* edit button for admin user */}
      {currentUser?.uid === project.uid && (
        <>
          <Link href={`/admin/${project.slug}`}>
            <button className="btn-blue">Edit Project</button>
          </Link>
        </>
      )}

      {/* comment section */}
      <Comments comments={comments} newSlug={String(date.getTime())} newCommentRef={newCommentRef} parentUid={project.uid} parentProjectSlug={project.slug} />
      {/* show comment */}

      {/* add comment */}
      
    </div>
  );
}
