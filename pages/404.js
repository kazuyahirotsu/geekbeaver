import Link from 'next/link';

export default function Custom404() {
  return (
    <main className=''>
      <div className='alert alert-error shadow-lg w-5/6 mx-auto my-10'>
        <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         <h1 className=''>404 - That page does not seem to exist...</h1>
        </div>
      </div>
      <iframe
        src="https://giphy.com/embed/l2JehQ2GitHGdVG9y"
        width="480"
        height="362"
        frameBorder="0"
        allowFullScreen
        className='mx-auto'
      ></iframe>
      <div className='text-center mt-10'>
      <Link href="/">
        <button className="btn btn-wide">Go home</button>
      </Link>
      </div>
    </main>
  );
}
