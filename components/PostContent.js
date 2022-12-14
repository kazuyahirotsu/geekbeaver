import Link from 'next/link';
import Editor from '../components/Editor'

// UI component for main post content
export default function PostContent({ post }) {
  const createdAt = typeof post?.createdAt === 'number' ? new Date(post.createdAt) : post.createdAt.toDate();

  return (
    <div className="card">
      <h1>{post?.title}</h1>
      <span className="text-sm">
        Written by{' '}
        <Link href={`/${post.username}/`}>
          <a className="text-info">@{post.username}</a>
        </Link>{' '}
        {createdAt.toLocaleString()}
      </span>
      <Editor defaultValue={post.content} edit={false}/>
    </div>
  );
}
