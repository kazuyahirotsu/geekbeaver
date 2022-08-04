import ProjectFeed from '../components/ProjectFeed';
import Metatags from '../components/Metatags';
import Loader from '../components/Loader';
import { firestore, projectToJSON, getIt } from '../lib/firebase';
import { Timestamp, query, where, orderBy, limit, collectionGroup, getDocs, startAfter, getFirestore } from 'firebase/firestore';

import { useState } from 'react';

// Max project to query per page
const LIMIT = 10;

// The first batch is rendered on the server, while all subsequent queries are executed clientside
export async function getServerSideProps(context) {
  const ref = collectionGroup(getFirestore(), 'projects');
  const projectsQuery = query(
    ref,
    where('published', '==', true),
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
        where('published', '==', true),
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
    <main>
      <Metatags title="Home Page" description="Get the latest projects on our site" />

      <div className="card card-info">
        <h2>💡 Next.js + Firebase - The Full Course</h2>
        <p>Welcome! This app is built with Next.js and Firebase and is loosely inspired by Dev.to.</p>
        <p>Sign up for an 👨‍🎤 account, ✍️ write projects, then 💞 heart content created by other users. All public content is server-rendered and search-engine optimized.</p>
      </div>
     
      <ProjectFeed projects={projects} />

      {!loading && !projectsEnd && <button onClick={getMoreProjects}>Load more</button>}

      <Loader show={loading} />

      {projectsEnd && 'You have reached the end!'}
    </main>
  );
}
