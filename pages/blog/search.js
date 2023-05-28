import Head from 'next/head'
import Blog from '../../components/blogcard'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faFilter } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'

const BlogHome = () => {

    const router = useRouter();
    const { q } = router.query;
	const [posts, setPosts] = useState([])
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(true)
	const [more, setMore] = useState(true)
	const { data: session, status } = useSession()
	const [filterMenu, setFilterMenu] = useState(false);
	const [filter, setFilter] = useState({ type: { regular: false, weekly: false, monthly: false }, fromDate: '', toDate: '' })

	useEffect(() => {
		setLoading(true)
		fetch('/api/latest/?q='+q).then(d => d.json()).then(data => {
			setLoading(false)
			setPosts(data.blogs)
            setMore(data.blogs.length!=0)
		}).catch(error => console.log(error))
	}, [q])

	const loadMore = (filters) => {
		if (!loading) {
			setLoading(true);
			const temp = { ...filter, filter: true }
			let type = ""
			for (const key in temp.type) {
				if (Object.hasOwnProperty.call(temp.type, key)) {
					if (temp.type[key]) {
						type += (key + ',')
					}
				}
			}
			if (type.endsWith(',')) { type = type.slice(0, -1) }
			console.log(type)
			temp.type = type
			const queryParams = new URLSearchParams(temp)
			fetch(`/api/latest?q=${q}&page=${page + 1}&${queryParams}`)
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

	const handleFilterChange = (event) => {
		const { name, checked, value } = event.target;
		if (name == 'weekly' || name == 'monthly' || name == 'regular') {
			setFilter({ ...filter, type: { ...filter.type, [name]: checked } })
		}
		else if (name == 'fromDate' || name=="toDate"){
			setFilter({...filter, [name]: value})
		}
	};

	const handleFilterButtonClick = () => {
		if (!loading) {
			setLoading(true)
            setMore(true)
			const temp = { ...filter, filter: true }
			let type = ""
			try {
				for (const key in temp.type) {
					if (Object.hasOwnProperty.call(temp.type, key)) {
						if (temp.type[key]) {
							type += (key + ',')
						}
					}
				}
				if (type.endsWith(',')) { type = type.slice(0, -1) }
				console.log(type)
				temp.type = type
				const queryParams = new URLSearchParams(temp)
				fetch(`/api/latest/?q=${q}&${queryParams.toString()}`).then(d => d.json()).then(data => {
					setLoading(false)
					setPosts(data.blogs)
					console.log(data.blogs)
				}).catch(error => console.log(error))
			} catch (error) {
				console.log(error)
				setLoading(false)
			}
		}
	};

	return (
		<div className="container">
			<Head>
				<title>Search Results - My Blog Site</title>
			</Head>
			<div className="row align-items-center justify-content-between">
				<h2 className='my-4 col-auto'>Search Results for query: {q}</h2>
				<div className='col-auto'><button className='btn btn-outline-secondary' onClick={() => setFilterMenu(!filterMenu)}><FontAwesomeIcon icon={faFilter} /> Filter</button></div>
			</div>
			<div style={{zIndex: '1100 !important'}}>
				<div className={`filter-menu p-4 ${filterMenu ? 'active' : ''}`}>
					<div>
						<div className="mb-3">
							<label htmlFor="type" className="form-label">Type</label>
							<div className="form-check">
								<input type="checkbox" className="form-check-input mt-2" id="regular" name="regular" checked={filter.type.regular} onChange={handleFilterChange} />
								<label className="form-check-label" htmlFor="regular">Regular</label>
							</div>
							<div className="form-check">
								<input type="checkbox" className="form-check-input mt-2" id="weekly" name="weekly" checked={filter.type.weekly} onChange={handleFilterChange} />
								<label className="form-check-label" htmlFor="weekly">Weekly</label>
							</div>
							<div className="form-check">
								<input type="checkbox" className="form-check-input mt-2" id="monthly" name="monthly" checked={filter.type.monthly} onChange={handleFilterChange} />
								<label className="form-check-label" htmlFor="monthly">Monthly</label>
							</div>
						</div>
						<div className="mb-3">
							<label htmlFor="type" className="form-label">From date</label>
							<input type="date" className="form-control" id="fromDate" name="fromDate" value={filter.fromDate} onChange={handleFilterChange} />
						</div>
						<div className="mb-3">
							<label htmlFor="type" className="form-label">To date</label>
							<input type="date" className="form-control" id="toDate" name="toDate" value={filter.toDate} onChange={handleFilterChange} />
						</div>
					</div>
					<button className='btn position-absolute' style={{ color: 'var(--close-btn-color)', top: '15px', right: '15px' }} onClick={() => setFilterMenu(!filterMenu)}><FontAwesomeIcon icon={faClose} /></button>
					<button className='btn btn-secondary my-3 me-3' onClick={handleFilterButtonClick}>Filter</button>
					<button className='btn btn-secondary my-3' onClick={()=>setFilter({ type: { regular: false, weekly: false, monthly: false }, fromDate: '', toDate: '' })}>Clear</button>
				</div>
				<div className={`black-backdrop ${filterMenu ? 'active' : ''}`} />
			</div>
			<div className="row">
				{posts?.map(post => (
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
                {!loading && (posts.length==0) && <div className='container'>No posts to show</div>}
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
