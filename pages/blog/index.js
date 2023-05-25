import Head from 'next/head'
import Blog from '../../components/blogcard'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const BlogHome = () => {

	const [posts, setPosts] = useState([])
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(false)
	const [more, setMore] = useState(true)
	const { data: session, status } = useSession()

	useEffect(() => {
		setLoading(true)
		fetch('/api/latest/').then(d => d.json()).then(data => {
			setLoading(false)
			setPosts(data.blogs)
			console.log(data.blogs)
		}).catch(error => console.log(error))
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

	const truncate = (text, maxLength) => {
		if (!text) return "";
		if (text.length <= maxLength) return text;

		text = text.replace(/<[^>]+>/g, '')

		let truncatedText = text.substr(0, maxLength);
		const lastSpaceIndex = truncatedText.lastIndexOf(" ");

		if (lastSpaceIndex !== -1) {
			truncatedText = truncatedText.substr(0, lastSpaceIndex);
		}

		return truncatedText + '...'
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
			{more && <button className='btn btn-outline-primary mb-4' onClick={loadMore}>Load more</button>}
		</div>
	)
}

export default BlogHome
