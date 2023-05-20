import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Shimmer } from 'react-shimmer'
import { Editor } from '@tinymce/tinymce-react'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { getSession } from 'next-auth/react'
import Head from 'next/head'

const BlogPost = ({ login }) => {
    const router = useRouter()
    const slug = router.query.slug

    if(!login) return <div className='container'>Not allowed</div>

    const [blog, setBlog] = useState({ title: "", image: "", content: "", author: "645cef8db3f2b97c88835466" })
    const [author, setAuthor] = useState({})
    const [loading, setLoading] = useState(true)
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasChanges]);

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
            setHasChanges(false)
            setAuthor({ ...data.author, createdAt: new Date(data.author.createdAt) })
            setLoading(false)
        }).catch(e => {
            console.log(e)
            setBlog({})
            setHasChanges(false)
            setAuthor({})
            setLoading(false)
        })
    }, [slug])

    const handleEditorChange = (content, editor) => {
        setBlog({ ...blog, content })
        setHasChanges(true)
    }

    const handleTitleChange = (e) => {
        setBlog({ ...blog, title: e.target.innerHTML })
        setHasChanges(true)
        console.log(blog.title)
    };

    const submitBlog = () => {

        if (blog.title.trim() === '') {
            let newIsValid = { ...isValid }
            newIsValid = { ...newIsValid, title: false };
            if (blog.image.trim() === '') {
                newIsValid = { ...newIsValid, image: false };
            }
            setIsValid(newIsValid)
            return;
        }

        if (blog.image.trim() === '') {
            setIsValid({ ...isValid, image: false });
            return;
        }

        const plainTextContent = blog.content.replace(/<[^>]+>/g, '');
        const wordCount = plainTextContent.trim().split(/\s+/).length;

        if (wordCount < 20) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Content',
                text: `Content must have at least 20 words.`,
            });
            return;
        }

        Swal.fire({
            title: 'Saving your blog...',
            showCancelButton: true,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
                return fetch("/api/update/", {
                    method: 'POST',
                    body: JSON.stringify({ ...blog, slug }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    return response.json().then(data => {
                        if (!response.ok) {
                            throw new Error(data.error || response.statusText);
                        }
                        Swal.fire({
                            icon: 'success',
                            title: `Saved`,
                            text: 'Blog saved successfully'
                        })
                        return data;
                    });
                }).catch(error => {
                    console.log(error)
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `${error}`
                    })
                })
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: `Saved`,
                    text: 'Blog saved successfully'
                })
            }
        })
    }

    return (
        <main className='mx-auto' style={{ maxWidth: '900px' }}>
			<Head>
				<title>Edit Blog</title>
			</Head>
            <div className="my-4 w-100">
                {
                    blog._id ? <>
                        <div className="d-flex flex-column-reverse flex-sm-column">
                            <div className='px-4'>
                                <nav className='my-4' aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                                        <li className="breadcrumb-item"><Link href="/blog">Blogs</Link></li>
                                        <li className="breadcrumb-item"><Link href={`/blog/${blog.slug}`}>{blog.title}</Link></li>
                                        <li className="breadcrumb-item" aria-current="page">Edit</li>
                                    </ol>
                                </nav>
                                <h1 className="mb-3 p-1 editable border-hover" name="title" contentEditable={true} onBlur={handleTitleChange} data-placeholder="Title" dangerouslySetInnerHTML={{ __html: blog.title }}></h1>
                                <p className="text-muted">{new Date(blog.createdAt).toLocaleString("en-US", options)}</p>
                                <div className="d-flex align-items-center">
                                    <img src="/person.jpg" alt="Author" width={30} height={30} className="rounded-circle my-3" />
                                    <div className="mx-2">
                                        <p className="mb-0" style={{ fontSize: '18px' }}>{author.firstName} {author.lastName}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center px-sm-4" style={{ overflowX: 'auto' }}>
                                <img className="mt-3 mb-4 w-100" style={{ display: 'block', margin: '0 auto' }} src={blog.image} alt={blog.title} />
                            </div>
                            <div className="mx-4 mb-4">
                                <Editor
                                    id="content-editor"
                                    inline={true}
                                    instanceId="content-editor"
                                    init={{
                                        skin: "oxide",
                                        setup: (editor) => {
                                            editor.on('init', () => {
                                                const body = editor.getBody();
                                                body.classList.add('border-hover');
                                                body.classList.add('px-3');
                                                body.style.paddingTop = '40px'
                                            });
                                        },
                                    }}
                                    onEditorChange={handleEditorChange}
                                    value={blog.content}
                                />
                                <button type="submit" onClick={submitBlog} className="btn btn-primary my-4">Submit</button>
                            </div>
                        </div>
                    </> : (loading ? (<>
                        <Shimmer width={500} height={20} duration={1500} />
                        <Shimmer width={400} height={20} duration={1500} />
                        <Shimmer width={200} height={200} duration={1500} />
                        <Shimmer width={450} height={20} duration={1500} />
                    </>) : <div>
                        Blog doesn't exist
                    </div>)
                }
            </div>
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