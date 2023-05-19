import Navbar from '../components/navbar'
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'

function MyApp({ Component, pageProps }) {
  return <>
    <Navbar />
    <Component {...pageProps} />
  </>
}

export default MyApp
