import { getUserWithUsername, projectToJSON } from '../../lib/firebase';
import { query, where, getDocs, limit, orderBy, getFirestore, collectionGroup } from 'firebase/firestore';
import UserProfile from '../../components/UserProfile';
import Metatags from '../../components/Metatags';
import PostFeed from '../../components/PostFeed';
import Link from 'next/link';


// Render the Firebase user profile on the server
export async function getServerSideProps({ query: urlQuery }) {
  const { username } = urlQuery;

  const userDoc = await getUserWithUsername(username);

  // If no user, short circuit to 404 page
  if (!userDoc) {
    return {
      notFound: true,
    };
  }

  // JSON serializable data
  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();

    const postsQuery = query(
      collectionGroup(getFirestore(), 'posts'),
      where('username','==',user.username),
      orderBy('createdAt', 'desc'),
    );
    posts = (await getDocs(postsQuery)).docs.map(projectToJSON);
  }

  return {
    props: { user, posts }, // will be passed to the page component as props
  };
}

export default function UserProfilePage({ user, posts }) {
  return (
    <main>
      <Metatags title={user.username} description={`${user.username}'s posts page`} />
      <UserProfile user={user} />

      <div className="flex w-1/2 mx-auto my-10">
        <div className="grid h-10 flex-grow card place-items-center">
          <Link href={`/${user.username}`}>
                  <button className="btn-blue">projects</button>
          </Link>
        </div>
        <div className="divider divider-horizontal"></div>
        <div className="grid h-10 flex-grow card place-items-center bg-primary text-white">
          <Link href={`/${user.username}/posts`}>
                  <button className="btn-blue">posts</button>
          </Link>
        </div>
      </div>

      <PostFeed posts={posts} mentionProject={true} />
    </main>
  );
}
