import { SessionProvider } from 'next-auth/react'
import Navbar from '../components/navbar'
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'

function MyApp({ Component, pageProps }) {
	return (
		<SessionProvider session={pageProps.session}>
			<Navbar />
			<Component {...pageProps} />
		</SessionProvider>
	)
}

export default MyApp
