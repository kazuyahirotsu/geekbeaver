import React, { useState, useEffect, useMemo, useRef } from "react";
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");

    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  {
    ssr: false
  }
);
import 'react-quill/dist/quill.snow.css';
import { serverTimestamp, doc, deleteDoc, updateDoc, getFirestore, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, storage, STATE_CHANGED } from '../lib/firebase';
import imageCompression from 'browser-image-compression';
import Loader from '../components/Loader';


// seems like you can't change the stlye after initializing quill nor 
// render the not rendered component at the first time
export default function Editor({ defaultValue, contentRef, edit=true , newSlug, newPost=false, project, profile=false, currentUser, currentUsername, comment=false, newComment=false}) {
    const router = useRouter();
    const [value, setValue] = useState(defaultValue);
    const [readOnlyOption, setReadOnlyOption] = useState(true);

    const updateContent = async ({ content, contentRef }) => {
        profile?
        await updateDoc(contentRef, {
          profile: content
        })
        :comment?
        await updateDoc(contentRef, {
          comment: content
        })
        :await updateDoc(contentRef, {
          content,
          updatedAt: serverTimestamp(),
        });
    
        toast.success('Updated successfully!');
      };

    const createContent = async ({ content, contentRef }) => {
      const data = {
          slug: newSlug, // todo
          uid: project.uid,
          username: project.username,
          projectSlug: project.slug,
          projectTitle: project.title,
          content,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          heartCount: 0,
          viewCount: 0,
          commentCount: 0,
        };
      await setDoc(contentRef, data);
  
      toast.success('Post created successfully!');
    };


    const createComment = async ({ comment, contentRef }) => {
      const data = {
          slug: newSlug, // todo
          uid: currentUser.uid,
          username: currentUsername,
          comment,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          heartCount: 0,
        };
      await setDoc(contentRef, data);
  
      toast.success('Comment created successfully!');
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
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline','strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'image'],
            ['clean']
          ],
        },
      };
    }, []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ]
  
  return (
    <div>
        {
        newComment?
        <div>
            <Loader show={uploading} />
            {uploading && <h3>{progress}% uploading...</h3>}
            <ReactQuill theme="snow"
                        modules={modules}
                        value={value} 
                        onChange={setValue}
                        forwardedRef={quillRef}>
            </ReactQuill>
            <button type="submit" className="btn-green" onClick={()=>{
              createComment({comment:value, contentRef:contentRef})
              router.reload()
              }} > {/* // todo */}
            Save Changes
            </button>
        </div>
        :newPost?
        <div>
            <Loader show={uploading} />
            {uploading && <h3>{progress}% uploading...</h3>}
            <ReactQuill theme="snow"
                        modules={modules}
                        value={value} 
                        onChange={setValue}
                        forwardedRef={quillRef}>
            </ReactQuill>
            <button type="submit" className="btn-green" onClick={()=>{
              createContent({content:value, contentRef:contentRef})
              router.reload()}} > {/* // todo */}
            Save Changes
            </button>
        </div>
        :edit?
        <div>
            <Loader show={uploading} />
            {uploading && <h3>{progress}% uploading...</h3>}
            <ReactQuill theme="snow"
                        modules={modules}
                        value={value} 
                        onChange={setValue}
                        forwardedRef={quillRef}>
            </ReactQuill>
            <button type="submit" className="btn-green" onClick={()=>{
              updateContent({content:value, contentRef:contentRef})
              }} >
            Save Changes
            </button>
        </div>
        :
        <ReactQuill theme="snow"
                    modules={{toolbar: false}}
                    readOnly={true}
                    value={value} 
                    onChange={setValue}>
        </ReactQuill>
        }
    </div>
  )
}

