import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Shimmer } from 'react-shimmer'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import FloatingActionButton from '../../components/fab'
import { getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import Swal from 'sweetalert2'
import ShareButtons from '../../components/share'
import BlogCard from '../../components/blogcard'

const BlogPost = ({ login }) => {
    const router = useRouter()
    const slug = router.query.slug

    const [blog, setBlog] = useState({})
    const [author, setAuthor] = useState({})
    const [loading, setLoading] = useState(true)
    const [latest, setLatest] = useState([])
    const { data: session, status } = useSession()

    useEffect(() => {
        console.log(session?.user)
    }, [])

    const options = {
        timeZone: "Asia/Kolkata",
        hour12: true,
        year: "numeric",
        month: "short",
        day: "numeric"
    };

    useEffect(() => {
        if (!slug) return
        setLoading(true)
        fetch('/api/blog/', {
            method: "POST",
            body: JSON.stringify({ slug }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(data => data.json()).then(data => {
            setBlog({ ...data, author: null });
            setAuthor({ ...data.author, createdAt: new Date(data.author.createdAt) })
            setLoading(false)
        }).catch(e => {
            console.log(e)
            setBlog({})
            setAuthor({})
            setLoading(false)
        })
    }, [slug])

    useEffect(() => {
		setLoading(true)
		fetch('/api/latest/').then(d => d.json()).then(data => {
			setLoading(false)
			setLatest(data.blogs || [])
		}).catch(error => {
            setLoading(false)
            console.log(error)
        })
	}, [])

    const handleDelete = () => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success mx-2',
                cancelButton: 'btn btn-danger mx-2'
            },
            buttonsStyling: false
        })

        swalWithBootstrapButtons.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/api/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: blog._id })
                })
                    .then((response) => {
                        if (!response.ok) return Swal.fire('Error', 'An error occured, your blog isn\'t deleted!', 'error')
                        return swalWithBootstrapButtons.fire(
                            'Deleted!',
                            'Your file has been deleted.',
                            'success'
                        ).then(() => router.push('/blog'))
                    })
                    .catch((error) => console.error('Error deleting blogs', error));

            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire(
                    'Cancelled',
                    'Your blog is not deleted',
                    'error'
                )
            }
        })
    }

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
        <main className='mx-auto' style={{ maxWidth: '900px' }}>
            <Head>
                <title>{blog._id && blog.title}</title>
            </Head>
            <div className="my-4 w-100">
                {
                    blog._id ? <>
                        <div className="d-flex flex-column-reverse flex-sm-column">
                            <div className='px-4'>
                                <nav className='my-4 d-sm-block d-none' aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                                        <li className="breadcrumb-item"><Link href="/blog">Blogs</Link></li>
                                        <li className="breadcrumb-item active" aria-current="page">{blog.title}</li>
                                    </ol>
                                </nav>
                                <Link href="/" className='d-flex align-items-center my-4 d-sm-none'><FontAwesomeIcon icon={faAngleLeft} size='2xs' />&nbsp;&nbsp;Blogs</Link>
                                <h1 className="mb-3">{blog.title}</h1>
                                <p className="text-muted fs-6">{new Date(blog.createdAt).toLocaleString("en-US", options)}</p>
                                <Link className='mylink' href={'/author/' + author.username}>
                                    <div className="d-flex align-items-center">
                                        <img src={author.image} alt="Author" width={30} height={30} className="rounded-circle my-3" />
                                        <div className="mx-2 d-flex align-items-center">
                                            <p className="mb-0 me-1" style={{ fontSize: '18px' }}>{author.firstName} {author.lastName}</p>
                                            {(author.type == "admin") && <img className='my-1' style={{ pointerEvents: "none", userSelect: "none" }} src={'/verified.svg'} height='20px' width='20px' />}
                                        </div>
                                    </div>
                                </Link>
                                <ShareButtons className='mt-2 mb-3' />
                            </div>
                            <div className="text-center px-sm-4" style={{ overflowX: 'auto' }}>
                                <img className="mt-3 mb-4 w-100" style={{ display: 'block', margin: '0 auto' }} src={"https://images.weserv.nl/?url=" + blog.image} alt={blog.title} crossOrigin='anonymous' />
                            </div>
                        </div>
                        <div className='content px-4' dangerouslySetInnerHTML={{ __html: blog.content }} />
                        <div className="px-4 my-4">
                            <h5>Tags</h5>
                            <div className="my-4">
                                {
                                    blog.tags?.split(',').map((e, i) => {
                                        return <span key={i} className={`badge badge-lg fs-6 rounded-pill text-bg-light me-2`}>
                                            {e.trim()}
                                        </span>
                                    })
                                }
                                {!blog.tags && '-None-'}
                            </div>
                        </div>
                    </> : (loading ? (<div className='container' style={{ scale: '1/2', overflowX: 'hidden' }}>
                        <Shimmer width={500} height={20} duration={1500} />
                        <Shimmer width={400} height={20} duration={1500} />
                        <Shimmer width={200} height={200} duration={1500} />
                        <Shimmer width={450} height={20} duration={1500} />
                    </div>) : <div>
                        Blog doesn&apos;t exist
                    </div>)
                }
            </div>
            <hr className='my-5' />
            <div className="px-4 my-5">
                <h4>Read More</h4>
                <div className="my-4 row">
                    {latest.map((post) => (
                        (blog._id!=post._id) && <div key={post._id} className="col-md-6 col-sm-12">
                            <BlogCard
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
            </div>
            {login && session && ((session.user.type == 'admin') || (session.user._id == author._id)) && <FloatingActionButton link={router.asPath + '/edit'} handleDelete={handleDelete} />}
        </main>
    )
}

export default BlogPost

export async function getServerSideProps(context) {
    const session = await getSession(context)
    // console.log("Session", session?.user)
    return {
        props: {
            login: session ? true : false,
            session: session
        }
    }
}