import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import ProjectFeed from '../../components/ProjectFeed';
import Editor from '../../components/Editor'
import { UserContext } from '../../lib/context';
import { firestore, auth } from '../../lib/firebase';
import { serverTimestamp, query, collection, orderBy, getFirestore, setDoc, doc } from 'firebase/firestore';

import { useContext, useState } from 'react';
import { useRouter } from 'next/router';

import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function AdminProjectsPage(props) {
  return (
    <main>
      <AuthCheck>
        <CreateNewProject />
      </AuthCheck>
    </main>
  );
}

function CreateNewProject() {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState("<h1>hello world!!</h1>");

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  // Create a new project in firestore
  const createProject = async ({content, title, slug}) => {
    const uid = auth.currentUser.uid;
    const ref = doc(getFirestore(), 'users', uid, 'projects', slug);

    // Tip: give all fields a default value here
    const data = {
      title,
      slug,
      uid,
      username,
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
      viewCount: 0,
      commentCount: 0,
    };

    await setDoc(ref, data);

    toast.success('Project created!');

    // Imperative navigation after doc is set
    router.push(`/${username}/${slug}`);
  };

  const modules = {
    toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline','strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image'],
    ['clean']
    ],
  } 

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Article!"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <ReactQuill theme="snow"
                        modules={modules}
                        value={value} 
                        onChange={setValue}>
      </ReactQuill>
      <button type="submit" className="btn-green" onClick={()=>createProject({content:value, title:title, slug:slug})} >
      Save Changes
      </button>
    </div>
  );
}
