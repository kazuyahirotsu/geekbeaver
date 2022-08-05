import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import HeartButton from '../components/HeartButton';
import AuthCheck from '../components/AuthCheck';
import { doc, getFirestore } from 'firebase/firestore';
import { useContext } from 'react';
import { UserContext } from '../lib/context';

// UI component for main project content
export default function ProjectContent({ project }) {
  const { user: currentUser, username } = useContext(UserContext);
  const projectRef = doc(getFirestore(), 'users', project.uid, 'projects', project.slug);
  const createdAt = typeof project?.createdAt === 'number' ? new Date(project.createdAt) : project.createdAt.toDate();

  return (
    <div className="card">
      <h1>{project?.title}</h1>
      <span className="text-sm">
        Written by{' '}
        <Link href={`/${project.username}/`}>
          <a className="text-info">@{project.username}</a>
        </Link>{' '}
        on {createdAt.toISOString()}
      </span>
      <ReactMarkdown>{project?.content}</ReactMarkdown>
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
      {/* If admin view, show extra controls for user */}
      {currentUser?.uid === project.uid && (
        <>
          <Link href={`/admin/${project.slug}`}>
            <button className="btn-blue">Edit Project</button>
          </Link>
        </>
      )}
    </div>
  );
}
