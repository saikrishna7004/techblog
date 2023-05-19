import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Shimmer } from 'react-shimmer'

const BlogPost = () => {
    const router = useRouter()
    const slug = router.query.slug

    const [blog, setBlog] = useState({})
    const [author, setAuthor] = useState({})
    const [loading, setLoading] = useState(false)

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

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
            console.log(data);
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

    return (
        <main className="container my-3">
            <div className="row">
                <div className="col-md-8 my-4">
                    {
                        blog._id ? <>
                            <h1 className="mb-3">{blog.title}</h1>
                            <p className="text-muted">{new Date(blog.createdAt).toLocaleString("en-US", options)}</p>
                            <hr />
                            <div className="text-center" style={{overflowX: 'auto'}}><img className="mt-3 mb-4" style={{maxWidth: '400px'}} src={blog.image} alt={blog.title} /></div>
                            <div className='content' dangerouslySetInnerHTML={{ __html: blog.content }} />
                        </> : (loading ? (<>
                            <Shimmer width={500} height={20} duration={1500}/>
                            <Shimmer width={400} height={20} duration={1500}/>
                            <Shimmer width={200} height={200} duration={1500}/>
                            <Shimmer width={450} height={20} duration={1500}/>
                        </>) : <div>
                            Blog doesn't exist
                        </div>)
                    }
                </div>
                <div className="col-md-4 my-4">
                    {
                        (author.createdAt && !loading) && <div className="author-info">
                            <div className="row align-items-center">
                                <div className="col-auto"><img src="/person.jpg" alt="Author" width={50} height={50} className="rounded-circle my-3" /></div>
                                <div className="col-auto">
                                    <h4 className="mb-1">{author.firstName} {author.lastName}</h4>
                                    <p className="text-muted mb-0" style={{ fontSize: "14px" }}>Joined {formatDistanceToNow(author.createdAt, { addSuffix: true })}</p>
                                </div>
                            </div>
                            <p className="my-2">{author.bio}</p>
                        </div>
                    }
                </div>
            </div>
                
        </main>
    )
}

export default BlogPost
