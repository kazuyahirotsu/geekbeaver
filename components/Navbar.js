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
      <div className="md:flex-1">
          <Link href="/">
            <button className="btn btn-ghost normal-case md:text-4xl text-3xl ">MORE PROJECTS</button>
          </Link>
      </div>

      {username && (
      <div className="navbar-end md:hidden">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
          </label>
          <ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <Link href="/admin">
                    <button className="">create new project</button>
                  </Link>
                </li>
                <li className="">
                  <button onClick={signOutNow} className="">Sign Out</button>
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
        </div>)}

        {/* user is signed-in and has username */}
        {username && (
          <div className="md:flex-none md:flex hidden">
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
          <div className="navbar-end ">
            <Link href="/enter">
              <button className="btn btn-primary md:btn-wide text-white">Log in</button>
            </Link>
          </div>
        )}
    </nav>
  );
}
