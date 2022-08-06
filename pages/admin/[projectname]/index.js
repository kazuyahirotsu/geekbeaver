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
  const { projectname } = router.query;

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

function ProjectForm({ defaultValues, projectRef, preview }) {
  const { register, formState: { errors, isValid, isDirty }, handleSubmit, reset, watch } = useForm({ defaultValues, mode: 'onChange' });

  const updateProject = async ({ content }) => {
    await updateDoc(projectRef, {
      content,
      updatedAt: serverTimestamp(),
    });

    reset({ content });

    toast.success('Project updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updateProject)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />

        <textarea
         {...register('content', {
            maxLength: { value: 20000, message: 'content is too long' },
            minLength: { value: 10, message: 'content is too short' },
            required: { value: true, message: 'content is required' },
          })}>  
        </textarea>

        {errors.content && <p className="text-danger">{errors.content.message}</p>}

        <fieldset>
          <input className={styles.checkbox} type="checkbox" {...register('published', {})}/>
          <label>Published</label>
        </fieldset>

        <button type="submit" className="btn-green" disabled={!isDirty || !isValid}>
          Save Changes
        </button>
      </div>
    </form>
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
