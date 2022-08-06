import Link from 'next/link';

export default function ProjectFeed({ projects, admin }) {
  return projects ? projects.map((project) => <ProjectItem project={project} key={project.slug} admin={admin} />) : null;
}

function ProjectItem({ project, admin = false }) {
  // Naive method to calc word count and read time
  const wordCount = project?.content.trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);

  return (
    <div className="card">
      <Link href={`/${project.username}`}>
        <a>
          <strong>By @{project.username}</strong>
        </a>
      </Link>

      <Link href={`/${project.username}/${project.slug}`}>
        <h2>
          <a>{project.title}</a>
        </h2>
      </Link>

      <footer>
        <span>
          {wordCount} words. {minutesToRead} min read
        </span>
        <span className="push-left">💗 {project.heartCount || 0} Hearts</span>
        <span>viewed {project.viewCount} times</span>
      </footer>

      {/* If admin view, show extra controls for user */}
      {admin && (
        <>
          <Link href={`/admin/${project.slug}`}>
            <h3>
              <button className="btn-blue">Edit</button>
            </h3>
          </Link>

        </>
      )}
    </div>
  );
}
