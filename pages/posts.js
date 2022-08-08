import PostFeed from '../components/PostFeed';
import Metatags from '../components/Metatags';
import Loader from '../components/Loader';
import { firestore, projectToJSON, getIt } from '../lib/firebase';
import { Timestamp, query, where, orderBy, limit, collectionGroup, getDocs, startAfter, getFirestore } from 'firebase/firestore';

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
      <Metatags title="Home Page" description="Get the latest posts on our site" />
      <Link href="/">
                <button className="btn-blue">projects</button>
      </Link>
      <Link href="/posts">
                <button className="btn-blue">posts</button>
      </Link>

      <div className="card card-info">
        <h2>💡 SNS based on your projects</h2>
        <p>Welcome! This app is built with Next.js and Firebase and is loosely inspired by Dev.to.</p>
        <p>Sign up for an 👨‍🎤 account, ✍️ write projects and posts, then 💞 heart content created by other users.</p>
      </div>
     
      <PostFeed posts={posts} mentionProject={true} />

      {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  );
}
