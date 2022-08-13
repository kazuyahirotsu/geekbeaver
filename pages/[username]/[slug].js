import ProjectContent from '../../components/ProjectContent';
import Metatags from '../../components/Metatags';
import { UserContext } from '../../lib/context';
import { getUserWithUsername, projectToJSON } from '../../lib/firebase';
import { doc, getDocs, getDoc, query, limit, getFirestore, collection, orderBy, updateDoc, increment } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import PostFeed from '../../components/PostFeed';
import Editor from '../../components/Editor';
import kebabCase from 'lodash.kebabcase';
import { containJapanese } from '../../lib/hooks';

export async function getServerSideProps({ query: urlQuery }) {
  const { username, slug:slug_original } = urlQuery;
  
  const slug = containJapanese(slug_original) ? encodeURI(kebabCase(slug_original)):slug_original;
  const userDoc = await getUserWithUsername(username);

  let project;
  let path;
  let posts = null;
  let comments = null;
  
  if (userDoc&&slug) {
    const projectRef = doc(getFirestore(), userDoc.ref.path, 'projects', slug);

    project = projectToJSON(await getDoc(projectRef) );

    path = projectRef.path;

    const postsQuery = query(
      collection(getFirestore(), userDoc.ref.path, 'projects', slug, 'posts'),
      orderBy('createdAt', 'desc')
    );
    posts = (await getDocs(postsQuery)).docs.map(projectToJSON);

    const commentsQuery = query(
      collection(getFirestore(), userDoc.ref.path, 'projects', slug, 'comments'),
      orderBy('createdAt', 'desc')
    );
    comments = (await getDocs(commentsQuery)).docs.map(projectToJSON);

  }

  return {
    props: { project, path, posts, comments },
  };
}


// shows edit project and add post UI for the owner
export default function Project(props) {
  const projectRef = doc(getFirestore(), props.path);
  const [realtimeProject] = useDocumentData(projectRef);
  const project = realtimeProject || props.project;
  const date = new Date();
  const { user: currentUser, username } = useContext(UserContext);
  const postRef = doc(getFirestore(), 'users', project.uid, 'projects', project.slug, 'posts', String(date.getTime())); // todo
  const newCommentRef = doc(getFirestore(), 'users', project.uid, 'projects', project.slug, 'comments', String(date.getTime())); // todo add uid or username to newslug
  
  useEffect(() => {
    updateDoc(projectRef, {
      viewCount: increment(1)
    });
  }, []);


  return (
    <main>
      <Metatags title={project.title} description={project.title} />
      <div className="flex flex-col">
        
        <section>
          <p className='md:text-5xl text-4xl text-center md:mx-12 mx-1 font-semibold'>Project</p>
          <ProjectContent project={project} comments={props.comments} />
        </section>

        <p className='md:text-5xl text-4xl text-center md:mx-12 mx-1 mt-10 font-semibold'>Posts</p>
        {currentUser?.uid === project.uid && (
            <div className="card shadow-xl bg-base-100 md:mx-10 mx-1 my-5">
              <div className="card-body">
                <Editor defaultValue={""} contentRef={postRef} newSlug={String(date.getTime())} newPost={true} project={project}/>
              </div>
            </div>
          )}
        

        <div className="">
          <PostFeed posts={props.posts}/>
        </div>

      </div>
    </main>
  );
}

function DeletePostButton({ postRef }) {

  const deletePost = async () => {
    const doIt = confirm('are you sure!');
    if (doIt) {
      await deleteDoc(postRef);
      toast('post annihilated ', { icon: '🗑️' });
    }
  };

  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
}
