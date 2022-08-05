import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import ProjectFeed from '../../components/ProjectFeed';
import { UserContext } from '../../lib/context';
import { firestore, auth } from '../../lib/firebase';
import { serverTimestamp, query, collection, orderBy, getFirestore, setDoc, doc } from 'firebase/firestore';

import { useContext, useState } from 'react';
import { useRouter } from 'next/router';

import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

export default function AdminProjectsPage(props) {
  return (
    <main>
      <AuthCheck>
        <ProjectList />
        <CreateNewProject />
      </AuthCheck>
    </main>
  );
}

function ProjectList() {

  const ref = collection(getFirestore(), 'users', auth.currentUser.uid, 'projects')
  const projectQuery = query(ref, orderBy('createdAt'))

  const [querySnapshot] = useCollection(projectQuery);

  const projects = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <h1>Manage your Projects</h1>
      <ProjectFeed projects={projects} admin />
    </>
  );
}

function CreateNewProject() {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState('');

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  // Create a new project in firestore
  const createProject = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = doc(getFirestore(), 'users', uid, 'projects', slug);

    // Tip: give all fields a default value here
    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: '# hello world!',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
      viewCount: 0,
      commentCount: 0,
    };

    await setDoc(ref, data);

    toast.success('Project created!');

    // Imperative navigation after doc is set
    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createProject}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Article!"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Project
      </button>
    </form>
  );
}
