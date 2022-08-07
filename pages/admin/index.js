import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import ProjectFeed from '../../components/ProjectFeed';
import Editor from '../../components/Editor'
import { UserContext } from '../../lib/context';
import { firestore, auth } from '../../lib/firebase';
import { serverTimestamp, query, collection, orderBy, getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';

import { useEffect, useState, useCallback, useContext } from 'react';
import { useRouter } from 'next/router';

import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

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
  const { user, username } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [value, setValue] = useState("<h1>hello world!!</h1>");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // // Ensure slug is URL safe
  // const slug = encodeURI(kebabCase(title));

  // Validate length
  // const isValid = title.length > 3 && title.length < 100;


  
  const onChange = (e) => {
    setTitle(e.target.value)
    setSlug(encodeURI(kebabCase(e.target.value)))
    if (slug.length < 3) {
      setLoading(false);
      setIsValid(false);
    }else{
      setLoading(true);
      setIsValid(false);
    }
    checkTitle(slug);
  }

  useEffect(() => {
    slug.length > 0 &&
    checkTitle(slug);
  }, [slug]);

  // Hit the database for username match after each debounced change
  // useCallback is required for debounce to work
  const checkTitle = useCallback(
    debounce(async (slug) => {   
      const ref = doc(getFirestore(), 'users', user.uid, 'projects', slug);
      console.log(user.uid);
      console.log(slug);
      const snap = await getDoc(ref);
      console.log('Firestore read executed!', snap.exists());
      setIsValid(!snap.exists());
      setLoading(false);
    }, 500),
    []
  );

  function TitleMessage({ title, isValid, loading }) {
    if (loading) {
      return <p>Checking...</p>;
    } else if (isValid) {
      return <p className="text-success">{title} is available!</p>;
    } else if (title && !isValid) {
      return <p className="text-danger">That title is taken!</p>;
    } else {
      return <p></p>;
    }
  }

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
        onChange={onChange}
        placeholder="My Awesome Article!"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <TitleMessage  title={title} isValid={isValid} loading={loading} />
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
