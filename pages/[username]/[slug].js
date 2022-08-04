import styles from '../../styles/Project.module.css';
import ProjectContent from '../../components/ProjectContent';
import HeartButton from '../../components/HeartButton';
import AuthCheck from '../../components/AuthCheck';
import Metatags from '../../components/Metatags';
import { UserContext } from '../../lib/context';
import { firestore, getUserWithUsername, projectToJSON } from '../../lib/firebase';
import { doc, getDocs, getDoc, collectionGroup, query, limit, getFirestore } from 'firebase/firestore';


import Link from 'next/link';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useContext } from 'react';


export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);

  let project;
  let path;

  if (userDoc) {
    const projectRef = doc(getFirestore(), userDoc.ref.path, 'projects', slug);

    project = projectToJSON(await getDoc(projectRef) );

    path = projectRef.path;
  }

  return {
    props: { project, path },
    revalidate: 100,
  };
}

export async function getStaticPaths() {
  // Improve my using Admin SDK to select empty docs
  const q = query(
    collectionGroup(getFirestore(), 'projects'),
    limit(20)
  )
  const snapshot = await getDocs(q);

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    // must be in this format:
    // paths: [
    //   { params: { username, slug }}
    // ],
    paths,
    fallback: 'blocking',
  };
}

export default function Project(props) {
  const projectRef = doc(getFirestore(), props.path);
  const [realtimeProject] = useDocumentData(projectRef);

  const project = realtimeProject || props.project;

  const { user: currentUser } = useContext(UserContext);

  return (
    <main className={styles.container}>
      <Metatags title={project.title} description={project.title} />
      
      <section>
        <ProjectContent project={project} />
      </section>

      <div className="card">
      {currentUser?.uid === project.uid && (
          <>
            <Link href={`/admin/${project.slug}`}>
              <button className="btn-blue">Edit Project</button>
            </Link>
            <Link href={`/admin/${project.slug}/update`}>
              <button className="btn-blue">Add Update</button>
            </Link>
          </>
        )}
      </div>
      <aside className="card">
        <p>
          <strong>{project.heartCount || 0} 🤍</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton projectRef={projectRef} />
        </AuthCheck>

        {currentUser?.uid === project.uid && (
          <>
            <Link href={`/admin/${project.slug}`}>
              <button className="btn-blue">Edit Project</button>
            </Link>
            {/* <Link href={`/admin/${project.slug}/update`}>
              <button className="btn-blue">Add Update</button>
            </Link> */}
          </>
        )}
      </aside>
    </main>
  );
}
