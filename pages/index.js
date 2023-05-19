import Head from 'next/head'
import Blog from '../components/blogcard'
import { useEffect, useState } from 'react'

const Home = (props) => {

	const [posts, setPosts] = useState([...props.posts])
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(false)
	const [more, setMore] = useState(true)

	useEffect(() => {
		setLoading(true)
		fetch('/api/latest/').then(d => d.json()).then(data => {
			setLoading(false)
			setPosts(data.blogs)
		}).catch(error=>console.log(error))
	}, [])

	const loadMore = () => {
		if (!loading) {
			setLoading(true);
			fetch(`/api/latest?page=${page + 1}`)
				.then((response) => response.json())
				.then((data) => {
					const newPosts = data.blogs;
					if (data.blogs.length == 0) setMore(false)
					setPosts((prevPosts) => [...prevPosts, ...newPosts]);
					setPage((prevPage) => prevPage + 1);
					setLoading(false);
				})
				.catch((error) => {
					console.log(error);
					setLoading(false);
				});
		}
	}

	const truncate = (text) => {
		if (!text) return ""
		const words = text.split(' ')
		let finalText = text
		if (words.length > 10) {
			const shortened = words.slice(0, 10).join(' ')
			const ellipsis = '...'
			finalText = `${shortened} ${ellipsis}`
		}
		return finalText
	}

	return (
		<div className="container">
			<Head>
				<title>Recent Blogs - My Blog Site</title>
			</Head>
			<h2 className='my-4'>Recent Blogs</h2>
			<div className="row">
				{posts.map(post => (
					<div key={post._id} className="col-md-6 col-sm-12 col-lg-4">
						<Blog
							title={post.title}
							summary={truncate(post.content)}
							slug={post.slug}
							image={post.image}
						/>
					</div>
				))}
				{
					loading && <div className="mb-4">
						<svg class="spinner" viewBox="0 0 50 50">
							<circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
						</svg>
					</div>
				}
			</div>
			{more && <button className='btn btn-outline-primary mb-4' onClick={loadMore}>Load more</button>}
		</div>
	)
}

export default Home

export async function getStaticProps() {
	const posts = [
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
		props: { posts },
	}
}