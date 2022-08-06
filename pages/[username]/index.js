import { getUserWithUsername, projectToJSON, firestore } from '../../lib/firebase';
import { query, collection, where, getDocs, limit, orderBy, getFirestore } from 'firebase/firestore';
import UserProfile from '../../components/UserProfile';
import Metatags from '../../components/Metatags';
import ProjectFeed from '../../components/ProjectFeed';

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
  let projects = null;

  if (userDoc) {
    user = userDoc.data();

    const projectsQuery = query(
      collection(getFirestore(), userDoc.ref.path, 'projects'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    projects = (await getDocs(projectsQuery)).docs.map(projectToJSON);
  }

  return {
    props: { user, projects }, // will be passed to the page component as props
  };
}

export default function UserProfilePage({ user, projects }) {
  return (
    <main>
      <Metatags title={user.username} description={`${user.username}'s public profile`} />
      <UserProfile user={user} />
      <ProjectFeed projects={projects} />
    </main>
  );
}
