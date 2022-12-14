import PostFeed from '../components/PostFeed';
import Metatags from '../components/Metatags';
import Loader from '../components/Loader';
import { projectToJSON } from '../lib/firebase';
import { Timestamp, query, orderBy, limit, collectionGroup, getDocs, startAfter, getFirestore } from 'firebase/firestore';
import { useState } from 'react';
import Link from 'next/link';

// Max posts to query per page
const LIMIT = 10;

// The first batch is rendered on the server, while all subsequent queries are executed clientside
export async function getServerSideProps(context) {
  const ref = collectionGroup(getFirestore(), 'posts');
  const postsQuery = query(
    ref,
    orderBy('createdAt', 'desc'),
    limit(LIMIT),
  )

  const posts = (await getDocs(postsQuery)).docs.map(projectToJSON);
 
  return {
    props: { posts }, // will be passed to the page component as props
  };
}

export default function Posts(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);
  


  // Get next page in pagination query
  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor = typeof last.createdAt === 'number' ? Timestamp.fromMillis(last.createdAt) : last.createdAt;

      const ref = collectionGroup(getFirestore(), 'posts');
      const postsQuery = query(
        ref,
        orderBy('createdAt', 'desc'),
        startAfter(cursor),
        limit(LIMIT),
      )

    const newPosts = (await getDocs(postsQuery)).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <Metatags title="Posts Page" description="Get the latest posts on our site" />
      <div className="flex w-1/2 mx-auto my-10">
        <div className="grid h-10 flex-grow card place-items-center">
          <Link href="/">
            <button className="btn-blue">projects</button>
          </Link>
        </div>
        <div className="divider divider-horizontal"></div>
        <div className="grid h-10 flex-grow card place-items-center bg-primary text-white">
          <Link href="/posts">
            <button className="btn-blue">posts</button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col w-screen">
        <div className="card shadow-xl bg-accent text-primary-content md:mx-10 mx-1">
          <div className="card-body">
            <p>moreprojects.dev??????????????????</p>
            <p>?????????????????????????????????????????????????????????????????????</p>
            <p>?????????????????????????????????????????????????????????????????????????????????????????????</p>
          </div>
        </div>
      
        <PostFeed posts={posts} mentionProject={true} />

        {!loading && !postsEnd && <button onClick={getMorePosts} className="btn btn-wide mx-auto mb-10 mt-5">Load more</button>}

        <div className="mx-auto">
          <Loader show={loading} className="mx-auto" />
        </div>

        {postsEnd && <p className="text-center mb-10">You have reached the end!</p>}
      </div>
    </main>
  );
}
