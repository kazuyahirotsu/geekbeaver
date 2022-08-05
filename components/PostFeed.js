import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import HeartButton from '../components/HeartButton';
import AuthCheck from '../components/AuthCheck';
import { doc, getFirestore } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useContext } from 'react';
import { UserContext } from '../lib/context';


export default function PostFeed({ posts, admin, project }) {
  const { user: currentUser, username } = useContext(UserContext);
  return posts ? posts.map((post) => <PostItem post_slow={post} key={post.slug} admin={admin} project={project} currentUser={currentUser} />) : null;
}

function PostItem({ post_slow, admin = false , project, currentUser }) {

  const postRef = doc(getFirestore(), 'users', project.uid, 'projects', project.slug, 'posts', post_slow.slug);
  const [realtimePost] = useDocumentData(postRef);
  const post = realtimePost || post_slow;

  // Naive method to calc word count and read time
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);
  const createdAt = typeof post?.createdAt === 'number' ? new Date(post.createdAt) : post.createdAt.toDate();


  return (
    <div className="card">

      <span className="text-sm">
        Written by{' '}
        <Link href={`/${post.username}/`}>
          <a className="text-info">@{post.username}</a>
        </Link>{' '}
        on {createdAt.toISOString()}
      </span>
      <ReactMarkdown>{post?.content}</ReactMarkdown>

      <footer>
        <span>
          {wordCount} words. {minutesToRead} min read
        </span>
        <span className="push-left">💗 {post.heartCount || 0} Hearts</span>
        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton projectRef={postRef} />
        </AuthCheck>
      </footer>

      {/* If admin view, show extra controls for user */}
      {currentUser?.uid === post.uid && (
          <>
            <Link href={`/admin/${project.slug}/${post.slug}`}>
              <button className="btn-blue">Edit Post</button>
            </Link>
          </>
        )}
    </div>
  );
}