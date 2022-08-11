import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import ProjectFeed from '../../components/ProjectFeed';
import Editor from '../../components/Editor'
import { UserContext } from '../../lib/context';
import { firestore, auth } from '../../lib/firebase';
import { serverTimestamp, query, collection, orderBy, getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';

import { useEffect, useState, useCallback, useContext, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';

import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, STATE_CHANGED } from '../../lib/firebase';
import imageCompression from 'browser-image-compression';
import Loader from '../../components/Loader';

import dynamic from 'next/dynamic';
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    const quillRefFun = ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
    return quillRefFun
  },
  {
    ssr: false
  }
);
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
      const snap = await getDoc(ref);
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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file) => {
    // Get the file
    const extension = file.type.split('/')[1];

    // Makes reference to the storage bucket location
    const fileRef = ref(storage, `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`);
    setUploading(true);

    // Starts the upload
    const task = uploadBytesResumable(fileRef, file)

    // Listen to updates to upload task
    task.on(STATE_CHANGED, (snapshot) => {
      const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100/2+50).toFixed(0);
      setProgress(pct);
    });

    // Get downloadURL AFTER task resolves (Note: this is not a native Promise)
    task
      .then((d) => getDownloadURL(fileRef))
      .then((url) => {
        insertToEditor(url);
        setUploading(false);
      });
  };

  const quillRef = useRef(false);

  const insertToEditor = (url) => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, 'image', url);
  };

  const show = (value) => {
    setProgress((value/2).toFixed(0));
  };

  const quillImageCallback = async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.click();
    var options = {
      maxSizeMB: 0.1, 
      onProgress: show,
    }

    input.onchange = () => {
      const file = input.files[0];

      // file type is only image.
      if (/^image\//.test(file.type)) {
        setUploading(true);
        imageCompression(file, options)
        .then(function (compressedFile) {
          return uploadFile(compressedFile);
        })
        .catch(function (error) {
          console.log(error.message);
        });
        
      } else {
        toast.error("This is not an image file");
      }
  };
  };

  const modules = useMemo(() => {
    return {
      toolbar: {
        handlers: {
          image: quillImageCallback,
        },
        container: [
          [{ 'header': [1, 2, 3, false] }],
          [{ 'font': [] }],
          ['bold', 'italic', 'underline','strike', 'code-block', 'blockquote'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          [{'list': 'ordered'}, {'list': 'bullet'}],
          ['link', 'image'],
          ['clean']
        ],
      },
    };
  }, []);

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
      <Loader show={uploading} />
      {uploading && <h3>{progress}% uploading...</h3>}
      <ReactQuill theme="snow"
                  modules={modules}
                  value={value} 
                  onChange={setValue}
                  forwardedRef={quillRef}>
      </ReactQuill>
      <button type="submit" className="btn-green" onClick={()=>createProject({content:value, title:title, slug:slug})} >
      Save Changes
      </button>
    </div>
  );
}
