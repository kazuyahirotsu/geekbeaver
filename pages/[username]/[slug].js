import styles from '../../styles/Project.module.css';
import ProjectContent from '../../components/ProjectContent';
import HeartButton from '../../components/HeartButton';
import AuthCheck from '../../components/AuthCheck';
import Metatags from '../../components/Metatags';
import { UserContext } from '../../lib/context';
import { firestore, getUserWithUsername, projectToJSON, auth } from '../../lib/firebase';
import { serverTimestamp, doc, getDocs, getDoc, setDoc, collectionGroup, query, limit, getFirestore, collection, where, orderBy, updateDoc, increment } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import ImageUploader from '../../components/ImageUploader';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import Link from 'next/link';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import PostFeed from '../../components/PostFeed';
import Editor from '../../components/Editor';
import kebabCase from 'lodash.kebabcase';

// SSG
export async function getStaticProps({ params }) {
  const { username, slug:slug_original } = params;
  const slug = encodeURI(kebabCase(slug_original));
  const userDoc = await getUserWithUsername(username);

  let project;
  let path;
  let posts = null;
  
  if (userDoc) {
    const projectRef = doc(getFirestore(), userDoc.ref.path, 'projects', slug);

    project = projectToJSON(await getDoc(projectRef) );

    path = projectRef.path;

    const postsQuery = query(
      collection(getFirestore(), userDoc.ref.path, 'projects', slug, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    posts = (await getDocs(postsQuery)).docs.map(projectToJSON);

  }

  return {
    props: { project, path, posts },
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

// shows edit project and add post UI for the owner
export default function Project(props) {
  const projectRef = doc(getFirestore(), props.path);
  const [realtimeProject] = useDocumentData(projectRef);
  const project = realtimeProject || props.project;
  const date = new Date();
  const { user: currentUser, username } = useContext(UserContext);
  const postRef = doc(getFirestore(), 'users', project.uid, 'projects', project.slug, 'posts', String(date.getTime())); // todo
  
  useEffect(() => {
    updateDoc(projectRef, {
      viewCount: increment(1)
    });
  }, []);


  return (
    // <main className={styles.container}>
    <main>
      <Metatags title={project.title} description={project.title} />
      <div className="flex flex-col">
        
        <section>
          <ProjectContent project={project} />
        </section>

        
        {currentUser?.uid === project.uid && (
            <div className="card">
              <p>Add new post</p>
              <Editor defaultValue={""} contentRef={postRef} newSlug={String(date.getTime())} newPost={true} project={project}/>
            </div>
          )}
        

        <div className="">
          <PostFeed posts={props.posts} project={project}/>
        </div>

      </div>
    </main>
  );
}

function DeletePostButton({ postRef }) {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      await deleteDoc(postRef);
      router.push('/admin');
      toast('post annihilated ', { icon: '🗑️' });
    }
  };

  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
}
