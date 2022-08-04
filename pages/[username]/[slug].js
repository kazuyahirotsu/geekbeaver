import styles from '../../styles/Project.module.css';
import ProjectContent from '../../components/ProjectContent';
import HeartButton from '../../components/HeartButton';
import AuthCheck from '../../components/AuthCheck';
import Metatags from '../../components/Metatags';
import { UserContext } from '../../lib/context';
import { firestore, getUserWithUsername, projectToJSON, auth } from '../../lib/firebase';
import { serverTimestamp, doc, getDocs, getDoc, setDoc, collectionGroup, query, limit, getFirestore, collection, where, orderBy } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import ImageUploader from '../../components/ImageUploader';


import Link from 'next/link';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useContext } from 'react';
import toast from 'react-hot-toast';
import PostFeed from '../../components/PostFeed';

// SSG
export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);

  let project;
  let path;
  let posts = null;
  
  if (userDoc) {
    const projectRef = doc(getFirestore(), userDoc.ref.path, 'projects', slug);

    project = projectToJSON(await getDoc(projectRef) );

    path = projectRef.path;

    const postsQuery = query(
      collection(getFirestore(), userDoc.ref.path, 'projects', slug, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    posts = (await getDocs(postsQuery)).docs.map(projectToJSON);
  }

  return {
    props: { project, path, posts },
    revalidate: 100,
  };
}

export async function getStaticPaths() {
  // Improve my using Admin SDK to select empty docs
  const q = query(
    collectionGroup(getFirestore(), 'projects'),
    limit(20)
  )
  const snapshot = await getDocs(q);

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    // must be in this format:
    // paths: [
    //   { params: { username, slug }}
    // ],
    paths,
    fallback: 'blocking',
  };
}

// shows edit project and add post UI for the owner
export default function Project(props) {
  const projectRef = doc(getFirestore(), props.path);
  const [realtimeProject] = useDocumentData(projectRef);
  const project = realtimeProject || props.project;

  const { user: currentUser, username } = useContext(UserContext);

  return (
    <main className={styles.container}>
      <Metatags title={project.title} description={project.title} />
      <div className="flex flex-col">
        
        <section>
          <ProjectContent project={project} />
        </section>

        <div className="">
          <PostFeed posts={props.posts} project={project}/>
        </div>

        <div className="card">
        {currentUser?.uid === project.uid && (
            <>
              <p>Add post here</p>
              <PostForm project={project} username={username}  />
            </>
          )}
        </div>
      </div>
      
      <aside className="card">
        <p>
          <strong>{project.heartCount || 0} 🤍</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton projectRef={projectRef} />
        </AuthCheck>

        {currentUser?.uid === project.uid && (
          <>
            <Link href={`/admin/${project.slug}`}>
              <button className="btn-blue">Edit Project</button>
            </Link>
          </>
        )}
      </aside>
    </main>
  );
}

function PostForm({ project, username }) {
  const preview=false; // todo

  const { register, formState: { errors, isValid, isDirty }, handleSubmit, reset, watch } = useForm({ defaultValues: {}, mode: 'onChange' });
  const submitPost = async ({ content, published }) => {
    const uid = auth.currentUser.uid;
    const ref = doc(getFirestore(), 'users', uid, 'projects', project.slug, 'posts', "test"); // todo

    // Tip: give all fields a default value here
    const data = {
      slug: "test", // todo
      uid,
      username,
      published,
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    };

    await setDoc(ref, data);

    reset({ content, published });

    toast.success('Post updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(submitPost)}>
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
