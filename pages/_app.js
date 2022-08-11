import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { UserContext } from '../lib/context';
import { useUserData } from '../lib/hooks';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  const userData = useUserData();

  return (
    <div data-theme="light" className="bg-base-200">
      <UserContext.Provider value={userData}>
        <Navbar />
        <Component {...pageProps} />
        <Toaster/>
      </UserContext.Provider>
    </div>
  );
}

export default MyApp;
