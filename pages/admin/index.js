import AuthCheck from '../../components/AuthCheck';
import { UserContext } from '../../lib/context';
import {  auth } from '../../lib/firebase';
import { serverTimestamp, getFirestore, setDoc, doc } from 'firebase/firestore';
import { useState, useContext, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
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
  const [value, setValue] = useState("<h1>hello world!!</h1>");


  const slug = String(Date.now());
  
  const onChange = (e) => {
    setTitle(e.target.value)
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
      inneedcontent: "",
      coverphotoURL: "",
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
    <div className="card shadow-xl bg-base-100 md:mx-10 mx-1 my-5">
      <div className="card-body">
        <p className="text-3xl">Title</p>
        <input
          value={title}
          onChange={onChange}
          placeholder="My Awesome Project!"
          className="input text-3xl mb-5"
        />

        <p className="text-3xl">Content</p>
        <div className="flex flex-row">
            <Loader show={uploading} />
            {uploading && <h3 className="mt-auto">{progress}% uploading...</h3>}
        </div>
        <div className="border">
        <ReactQuill theme="snow"
                    modules={modules}
                    value={value} 
                    onChange={setValue}
                    forwardedRef={quillRef}>
        </ReactQuill>
        </div>
        <div className="text-right">
          {title
          ?<button type="submit" className="btn btn-accent" onClick={()=>createProject({content:value, title:title, slug:slug})} >
          Post Project
          </button>
          :<button type="submit" className="btn btn-accent" disabled="disabled" onClick={()=>createProject({content:value, title:title, slug:slug})} >
          Post Project
          </button>}
        </div>
      </div>
    </div>
  );
}
