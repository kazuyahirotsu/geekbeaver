import { Oval } from  'react-loader-spinner'
// Loading Spinner
export default function Loader({ show }) {
  return show ? <Oval
  height={80}
  width={80}
  color="#3ABFF8"
  wrapperStyle={{}}
  wrapperClass=""
  visible={true}
  ariaLabel='oval-loading'
  secondaryColor="#3ABFF8"
  strokeWidth={2}
  strokeWidthSecondary={2}

/> : null;
}
