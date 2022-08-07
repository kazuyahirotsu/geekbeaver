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
  const { projectname:projectname_original } = router.query;
  const projectname = encodeURI(kebabCase(projectname_original));

  const projectRef = doc(getFirestore(), 'users', auth.currentUser.uid, 'projects', projectname);
  const [project] = useDocumentData(projectRef);
  return (
    <main className={styles.container}>
      {project && (
        <>
          <section>
            <h1>{project.title}</h1>
            <p>ID: {project.slug}</p>
            <Editor defaultValue={project.content} contentRef={projectRef} />
            {/* <ProjectForm projectRef={projectRef} defaultValues={project} preview={preview} /> */}
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${project.username}/${project.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
            <DeleteProjectButton projectRef={projectRef} />
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
