import Link from 'next/link';

export default function ProjectFeed({ projects, admin }) {
  return projects ? projects.map((project) => <ProjectItem project={project} key={project.slug} admin={admin} />) : null;
}

function ProjectItem({ project, admin = false }) {
  // Naive method to calc word count and read time

  return (
    <div className="card shadow-xl bg-base-100 md:mx-10 mx-1 my-5">
      <Link href={`/${project.username}/${project.slug}`}>
      <div className="card-body">
        <div className="flex">
        <Link href={`/${project.username}`}>
          <a>
            By <strong className="text-info"> @{project.username}</strong>
          </a>
        </Link>
        </div>

        <Link href={`/${project.username}/${project.slug}`}>
          <h2>
            <a className="text-2xl">{project.title}</a>
          </h2>
        </Link>

        <div className="flex flex-row ml-auto">
          <span className="text-xl">💗{project.heartCount || 0}</span>
          <span className="text-xl ml-5">👀{project.viewCount}</span>
        </div>

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
      </Link>
    </div>
  );
}
