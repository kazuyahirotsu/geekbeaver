import styles from '../../../styles/Admin.module.css';
import AuthCheck from '../../../components/AuthCheck';
import { firestore, auth } from '../../../lib/firebase';
import { serverTimestamp, doc, deleteDoc, updateDoc, getFirestore } from 'firebase/firestore';
import ImageUploader from '../../../components/ImageUploader';

import { useState } from 'react';
import { useRouter } from 'next/router';

import { useDocumentDataOnce, useDocumentData } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Editor from '../../../components/Editor';

export default function AdminProjectEdit(props) {
  const router = useRouter();
  const { projectname, slug } = router.query;

  const postRef = doc(getFirestore(), 'users', auth.currentUser.uid, 'projects', projectname, 'posts', slug);
  const [post] = useDocumentData(postRef);
  return (
    <AuthCheck>
      <Editor defaultValue={post.content} contentRef={postRef} project={post}/>
    </AuthCheck>
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
