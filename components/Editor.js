import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { serverTimestamp, doc, deleteDoc, updateDoc, getFirestore, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

// seems like you can't change the stlye after initializing quill nor 
// render the not rendered component at the first time
export default function Editor({ defaultValue, contentRef, edit=true , newSlug, newPost=false, project, profile=false}) {
    const router = useRouter();
    const [value, setValue] = useState(defaultValue);
    const [readOnlyOption, setReadOnlyOption] = useState(true);

    const updateContent = async ({ content, contentRef }) => {
        profile?
        await updateDoc(contentRef, {
          profile: content
        }):
        await updateDoc(contentRef, {
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
      

    useEffect(() =>  {
        console.log(value);
    },[value])

    const modules = {
        toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline','strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
        ],
    } 

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ]
  
  return (
    <div>
        {
        newPost?
        <div>
            <ReactQuill theme="snow"
                        modules={modules}
                        value={value} 
                        onChange={setValue}>
            </ReactQuill>
            <button type="submit" className="btn-green" onClick={()=>{
              createContent({content:value, contentRef:contentRef})
              router.reload()}} > {/* // todo */}
            Save Changes
            </button>
        </div>
        :edit?
        <div>
            <ReactQuill theme="snow"
                        modules={modules}
                        value={value} 
                        onChange={setValue}>
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

