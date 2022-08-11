import { auth, firestore, googleAuthProvider, githubAuthProvider, twitterAuthProvider } from '../lib/firebase';
import { doc, writeBatch, getDoc, getFirestore } from 'firebase/firestore';
import { signInWithPopup, signInAnonymously, signOut } from 'firebase/auth';
import { UserContext } from '../lib/context';
import Metatags from '../components/Metatags';
import { useRouter } from 'next/router';


import { useEffect, useState, useCallback, useContext } from 'react';
import debounce from 'lodash.debounce';

export default function Enter(props) {
  const { user, username } = useContext(UserContext);
  const router = useRouter();
  useEffect(() => {
    username && router.push('/')
  }, [username]);

  // 1. user signed out <SignInButton />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, has username <SignOutButton />
  return (
    <main>
      <Metatags title="Enter" description="Sign up for this amazing app!" />
      {user ? !username ? <UsernameForm /> : <SignOutButton /> : <SignInButton />}
    </main>
  );
}

// Sign in with Google button
function SignInButton() {
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleAuthProvider)
  };
  const signInWithGithub = async () => {
    await signInWithPopup(auth, githubAuthProvider)
  };
  const signInWithTwitter = async () => {
    await signInWithPopup(auth, twitterAuthProvider)
  };

  return (
    <div className="card shadow-xl bg-base-100 w-2/6 my-36 mx-auto">
      <div className="card-body">
        <div className="card-title text-3xl mb-5">
          Sign up
        </div>
        <div className="flex flex-col">
          <button className="btn mb-2 bg-[#4285F4] hover:bg-[#4285F4]/90 border-[#4285F4] hover:border-[#4285F4]/90" onClick={signInWithGoogle}> 
            <i className="devicon-google-plain text-2xl mr-3"></i>
            Sign in with Google
          </button>
          <button className="btn mb-2 bg-[#1da1f2] hover:bg-[#1da1f2]/90 border-[#1da1f2] hover:border-[#1da1f2]/90" onClick={signInWithTwitter}>        
            <i className="devicon-twitter-original text-2xl mr-3"></i>
            Sign in with Twitter
          </button>
          <button className="btn mb-2 bg-[#24292F] hover:bg-[#24292F]/90 border-[#24292F] hover:border-[#24292F]/90" onClick={signInWithGithub}>     
            <i className="devicon-github-original text-2xl mr-3"></i>
            Sign in with Github
          </button>
        </div>
      </div>
    </div>
  );
}

// Sign out button
function SignOutButton() {
  return <button onClick={() => signOut(auth)}>Sign Out</button>;
}

// Username form
function UsernameForm() {
  const [formValue, setFormValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, username } = useContext(UserContext);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();

    // Create refs for both documents
    const userDoc = doc(getFirestore(), 'users', user.uid);
    const usernameDoc = doc(getFirestore(), 'usernames', formValue);

    // Commit both docs together as a batch write.
    const batch = writeBatch(getFirestore());
    batch.set(userDoc, { username: formValue, photoURL: user.photoURL, displayName: user.displayName, profile: "", uid: user.uid });
    batch.set(usernameDoc, { uid: user.uid });

    await batch.commit();
    router.push('/');
  };

  const onChange = (e) => {
    // Force form value typed in form to match correct format
    const val = e.target.value.toLowerCase();
    // const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
    const re = /^[0-9a-zA-Z]*$/;

    if (val.length==0) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }else if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  //

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  // Hit the database for username match after each debounced change
  // useCallback is required for debounce to work
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 1) {
        const ref = doc(getFirestore(), 'usernames', username);
        const snap = await getDoc(ref);
        setIsValid(!snap.exists());
        if (username == 'admin' || username == 'api' || username == '404' || username == 'enter' || username == 'posts'){
          setIsValid(false);
        }
        setLoading(false);
      }
    }, 500),
    []
  );

  return (
    !username && (
      <div className="card shadow-xl bg-base-100 mx-10 my-5">
        <div className="card-body">
          <h3 className="text-3xl mb-5">Choose Username (半角英数字)</h3>
          <form onSubmit={onSubmit}>
            <div className="flex flex-row">
              <p className="text-3xl flex-none mr-3">@</p>
              <input name="username" placeholder="myname" value={formValue} onChange={onChange} className="input text-3xl mb-5 flex-1" />
            </div>
            <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
            <div className="text-right">
              <button type="submit" className="btn btn-wide btn-accent" disabled={!isValid}>
                Choose
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}
