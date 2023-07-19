import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import BlogCard from '../../components/blogcard';
import { useSession } from 'next-auth/react';

const AuthorDetailsPage = () => {

    const router = useRouter()
    const username = router.query.username
    console.log(username)
    const [author, setAuthor] = useState({
        "firstName": "",
        "lastName": "",
        "bio": "",
        "username": username,
        "image": "https://picsum.photos/id/237/300/200",
        "createdAt": "2023-05-11T13:37:17.411Z",
        "email": "",
        "type": ""
    })
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [more, setMore] = useState(true)
    const [page, setPage] = useState(1)
    const { data: session, status } = useSession()

    useEffect(() => {
        setLoading(true)
        fetch('/api/author', {
            method: 'POST',
            body: JSON.stringify({ username }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(d => d.json()).then(data => {
            console.log(data)
            setAuthor(data)
        })
        console.log(username)
        fetch(`/api/latest/?author=${username}`).then(d => d.json()).then(data => {
            setLoading(false)
            setPosts(data.blogs || [])
        }).catch(error => {
            setLoading(false)
            console.log(error)
        })
    }, [username])

    const loadMore = () => {
        if (!loading) {
            setLoading(true);
            fetch(`/api/latest?page=${page + 1}&author=${username}`)
                .then((response) => response.json())
                .then((data) => {
                    const newPosts = data.blogs;
                    console.log(data.blogs.length)
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
            {
                author.email ? <div className="row justify-content-center d-flex align-items-center" style={{ minHeight: '75vh' }}>
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <div className="text-center mb-4">
                                    <img src={author.image} alt="Author" className="rounded-circle" width={150} height={150} />
                                </div>
                                <h2 className="d-flex align-items-center justify-content-center">{`${author.firstName} ${author.lastName}`} {author.type == 'admin' && <img className='my-1 mx-1' style={{ pointerEvents: "none", userSelect: "none" }} src={'/verified.svg'} height='25px' width='25px' />}</h2>
                                <p className="text-center">{author.bio}</p>
                                <div className="text-center">
                                    <span className="badge bg-primary me-2">{author.type}</span>
                                    <span className="badge bg-secondary">@{author.username}</span>
                                </div>
                                <div className="text-center mt-4">
                                    <a href={`mailto:${author.email}`} className="btn btn-primary">Contact</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> : (loading ? "Loading..." : <div className='my-4'>Username invalid</div>)
            }
            <h4 className='mb-4'>Blogs by Author</h4>
            <div className="my-4 row">
                {
                    posts.map(post => (
                        <div key={post._id} className="col-md-6 col-sm-12 col-lg-4">
                            <BlogCard
                                title={post.title}
                                summary={truncate(post.content, 80)}
                                slug={post.slug}
                                image={post.image}
                                edit={session && session.user && session.user.type == "admin"}
                                author={`${post.author.firstName} ${post.author.lastName}`}
                                verified={post.author.type == "admin"}
                            />
                        </div>
                    ))
                }
                {
                    !posts.length && !loading && <div className='mx-2'>--</div>
                }
            </div>
            {
                loading && <div className="mb-4">
                    <svg className="spinner" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                    </svg>
                </div>
            }
            {more && <button className='btn btn-outline-primary mb-4' onClick={loadMore}>Load more</button>}
        </div>
    );
};

export default AuthorDetailsPage;

export async function getServerSideProps(context) {
    return {
        props: {},
    };
}