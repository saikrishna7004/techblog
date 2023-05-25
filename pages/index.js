import Head from 'next/head'
import Blog from '../components/blogcard'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { TypeAnimation } from 'react-type-animation'
import Link from 'next/link'

const Home = (props) => {

	const [weekly, setWeekly] = useState([...props.weekly])
	const [latest, setLatest] = useState([...props.latest])
	const [loading, setLoading] = useState(false)
	const { data: session, status } = useSession()

	useEffect(() => {
		setLoading(true)
		fetch('/api/latest/?type=weekly').then(d => d.json()).then(data => {
			setWeekly(data.blogs)
		}).catch(error => console.log(error))
		fetch('/api/latest/?group=week').then(d => d.json()).then(data => {
			setLoading(false)
			setLatest(data.blogs || [])
		}).catch(error => console.log(error))
	}, [])

	const truncate = (text, maxLength) => {
		if (!text) return "";
		text = text.replace(/<[^>]+>/g, '')
		let truncatedText = text.substr(0, maxLength);
		const lastSpaceIndex = truncatedText.lastIndexOf(" ");
		if (lastSpaceIndex !== -1) {
			truncatedText = truncatedText.substr(0, lastSpaceIndex);
		}
		if (truncatedText.length <= maxLength) return truncatedText;
		return truncatedText + '...'
	}

	return (
		<div className="container">
			<Head>
				<title>Home - My Blog Site</title>
			</Head>

			<div className="row">
				<div className="col-md-8 mx-auto text-center">
					<h1 className='my-4'>Welcome to our Tech Blog</h1>
					<TypeAnimation
						sequence={[
							'Discover the latest in technology',
							2000,
							'Discover the latest in programming',
							2000,
							'Discover the latest in industry trends',
							2000,
						]}
						wrapper="span"
						cursor={true}
						repeat={Infinity}
						style={{ fontSize: '2em', display: 'inline-block' }}
						speed={65}
						deletionSpeed={65}
					/>
					<hr />
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis feugiat dolor. Proin eu condimentum
						purus. Fusce lacinia eros sed turpis lobortis viverra. Donec et odio justo. Ut ultrices fermentum urna,
						sed efficitur lorem pellentesque id. Nam hendrerit felis sed lectus tempus, ut vestibulum ex lacinia.
					</p>
					<p>
						Fusce dapibus velit non libero eleifend, ut molestie turpis rhoncus. Cras nec purus quis purus auctor
						fermentum. Mauris tempus ipsum sit amet tellus elementum tempus. Curabitur dapibus nulla ut fringilla
						hendrerit. Vivamus scelerisque, erat non tincidunt vestibulum, urna enim varius neque, a ultrices ex ante
						ac lacus. Aliquam erat volutpat. Pellentesque id semper ex, sit amet cursus nulla. Ut cursus tortor ac
						nunc fermentum, eget vestibulum justo pulvinar. Donec non commodo leo.
					</p>
					<Link href="/blog" className="btn btn-primary">Explore Our Blog</Link>
				</div>
			</div>

			<h2 className='my-4'>Weekly Blogs</h2>
			<div className="row">
				{weekly.map((post) => (
					<div key={post._id} className="col-md-6 col-sm-12 col-lg-4">
						<Blog
							title={post.title}
							summary={truncate(post.content, 80)}
							slug={post.slug}
							image={post.image}
							edit={session && session.user && session.user.type == "admin"}
							tag={post.tags}
							author={`${post.author.firstName} ${post.author.lastName}`}
							verified={post.author.type == "admin"}
						/>
					</div>
				))}
				{
					loading && <div className="mb-4">
						<svg className="spinner" viewBox="0 0 50 50">
							<circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
						</svg>
					</div>
				}
			</div>
			<h2 className='my-4'>Lastest Blogs - In a Week</h2>
			<div className="row">
				{latest.map(post => (
					<div key={post._id} className="col-md-6 col-sm-12 col-lg-4">
						<Blog
							title={post.title}
							summary={truncate(post.content, 80)}
							slug={post.slug}
							image={post.image}
							edit={session && session.user && session.user.type == "admin"}
							author={`${post.author.firstName} ${post.author.lastName}`}
							verified={post.author.type == "admin"}
						/>
					</div>
				))}
				{
					loading && <div className="mb-4">
						<svg className="spinner" viewBox="0 0 50 50">
							<circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
						</svg>
					</div>
				}
			</div>
		</div>
	)
}

export default Home

export async function getStaticProps() {
	const weekly = [
		{
			_id: 1,
			title: 'Post 1',
			slug: 'post-1',
			summary: 'This is a summary of Post 1',
			image: 'https://picsum.photos/id/237/300/200',
		},
		{
			_id: 2,
			title: 'Post 2',
			slug: 'post-2',
			summary: 'This is a summary of Post 2',
			image: 'https://picsum.photos/id/238/300/200',
		},
		{
			_id: 3,
			title: 'Post 3',
			slug: 'post-3',
			summary: 'This is a summary of Post 3',
			image: 'https://picsum.photos/id/239/300/200',
		},
	]

	return {
		props: { weekly: weekly, latest: [] },
	}
}