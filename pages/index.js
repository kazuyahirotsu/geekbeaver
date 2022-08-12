import ProjectFeed from '../components/ProjectFeed';
import Metatags from '../components/Metatags';
import Loader from '../components/Loader';
import { firestore, projectToJSON, getIt } from '../lib/firebase';
import { Timestamp, query, where, orderBy, limit, collectionGroup, getDocs, startAfter, getFirestore } from 'firebase/firestore';

import { useState } from 'react';
import Link from 'next/link';

// Max project to query per page
const LIMIT = 10;

// The first batch is rendered on the server, while all subsequent queries are executed clientside
export async function getServerSideProps(context) {
  const ref = collectionGroup(getFirestore(), 'projects');
  const projectsQuery = query(
    ref,
    orderBy('createdAt', 'desc'),
    limit(LIMIT),
  )

  const projects = (await getDocs(projectsQuery)).docs.map(projectToJSON);
 
  return {
    props: { projects }, // will be passed to the page component as props
  };
}

export default function Home(props) {
  const [projects, setProjects] = useState(props.projects);
  const [loading, setLoading] = useState(false);
  const [projectsEnd, setProjectsEnd] = useState(false);



  // Get next page in pagination query
  const getMoreProjects = async () => {
    setLoading(true);
    const last = projects[projects.length - 1];

    const cursor = typeof last.createdAt === 'number' ? Timestamp.fromMillis(last.createdAt) : last.createdAt;

      const ref = collectionGroup(getFirestore(), 'projects');
      const projectsQuery = query(
        ref,
        orderBy('createdAt', 'desc'),
        startAfter(cursor),
        limit(LIMIT),
      )

    const newProjects = (await getDocs(projectsQuery)).docs.map((doc) => doc.data());

    setProjects(projects.concat(newProjects));
    setLoading(false);

    if (newProjects.length < LIMIT) {
      setProjectsEnd(true);
    }
  };

  return (
    <main className="">
      <Metatags title="Home Page" description="Get the latest projects on our site" />
      <div className="flex w-1/2 mx-auto my-10">
        <div className="grid h-10 flex-grow card place-items-center bg-primary text-white">
          <Link href="/">
            <button className="btn-blue">projects</button>
          </Link>
        </div>
        <div className="divider divider-horizontal"></div>
        <div className="grid h-10 flex-grow card place-items-center">
          <Link href="/posts">
            <button className="btn-blue">posts</button>
          </Link>
        </div>
      </div>


      <div className="flex flex-col w-screen">
        <div className="card shadow-xl bg-accent text-primary-content md:mx-10 mx-1">
          <div className="card-body">
            <p>Welcome! This app is for project lovers.</p>
            <p>Sign up for an 👨‍🎤 account, ✍️ write projects and posts, then 💞 heart content created by other users.</p>
          </div>
        </div>
      
        <ProjectFeed projects={projects} />

        {!loading && !projectsEnd && <button onClick={getMoreProjects} className="btn btn-wide mx-auto mb-10">Load more</button>}

        <Loader show={loading} />

        {projectsEnd && <p className="text-center mb-10">You have reached the end!</p>}
      </div>
    </main>
  );
}
