import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { UserContext } from '../lib/context';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

// Top navbar
export default function Navbar() {
  const { user, username } = useContext(UserContext);

  const router = useRouter();

  const signOutNow = () => {
    signOut(auth);
    router.reload();
  }

  return (
    <nav className="navbar">
      <div className="flex-1">
          <Link href="/">
            <button className="btn btn-ghost normal-case text-4xl">MORE PROJECTS</button>
          </Link>
      </div>

        {/* user is signed-in and has username */}
        {username && (
          <div className="flex-none">
            <ul className="menu menu-horizontal p-0">
              <li className="">
                <button onClick={signOutNow} className="btn text-white my-auto mx-3">Sign Out</button>
              </li>
              <li>
                <Link href="/admin">
                  <button className="btn btn-primary text-white my-auto">create new project</button>
                </Link>
              </li>
              <li>
                <Link href={`/${username}`}>
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src={user?.photoURL || '/hacker.png'} />
                    </div>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* user is not signed OR has not created username */}
        {!username && (
          <div className="navbar-end">
            <Link href="/enter">
              <button className="btn btn-primary btn-wide text-white">Log in</button>
            </Link>
          </div>
        )}
    </nav>
  );
}
