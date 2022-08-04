import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

// UI component for main project content
export default function ProjectContent({ project }) {
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
    </div>
  );
}
