import styles from '../../../styles/Admin.module.css';
import AuthCheck from '../../../components/AuthCheck';
import { firestore, auth } from '../../../lib/firebase';
import { serverTimestamp, doc, deleteDoc, updateDoc, getFirestore } from 'firebase/firestore';
import ImageUploader from '../../../components/ImageUploader';
import Editor from '../../../components/Editor'

import { useState } from 'react';
import { useRouter } from 'next/router';

import { useDocumentDataOnce, useDocumentData } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';
import kebabCase from 'lodash.kebabcase';
import { containJapanese } from '../../../lib/hooks';



export default function AdminProjectEdit(props) {
  return (
    <AuthCheck>
      <ProjectManager />
    </AuthCheck>
  );
}

function ProjectManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { projectname:projectname_original, slug:slug_original } = router.query;
  const projectname = containJapanese(projectname_original) ? encodeURI(kebabCase(projectname_original)):projectname_original;
  const slug = containJapanese(slug_original) ? encodeURI(kebabCase(slug_original)):slug_original;


  const postRef = doc(getFirestore(), 'users', auth.currentUser.uid, 'projects', projectname, "posts", slug);
  const [post] = useDocumentData(postRef);
  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <p>ID: {post.slug}</p>
            <Editor defaultValue={post.content} contentRef={postRef} />
            {/* <ProjectForm projectRef={projectRef} defaultValues={project} preview={preview} /> */}
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${post.username}/${projectname}`}>
              <button className="btn-blue">Live view</button>
            </Link>
            <DeleteProjectButton projectRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
}


function DeleteProjectButton({ projectRef }) {
  const router = useRouter();

  const deleteProject = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      await deleteDoc(projectRef);
      router.push('/admin');
      toast('project annihilated ', { icon: '🗑️' });
    }
  };

  return (
    <button className="btn-red" onClick={deleteProject}>
      Delete
    </button>
  );
}