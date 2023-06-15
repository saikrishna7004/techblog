import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Shimmer } from 'react-shimmer'
import { Editor } from '@tinymce/tinymce-react'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'

const BlogPost = ({ login, allowed }) => {
    const router = useRouter()
    const slug = router.query.slug
    const { data: session, status } = useSession()

    const [blog, setBlog] = useState({ title: "", image: "", content: "", author: "" })
    const [author, setAuthor] = useState({})
    const [loading, setLoading] = useState(true)
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (!login) return

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
    }, [hasChanges, login]);

    const options = {
        timeZone: "Asia/Kolkata",
        hour12: true,
        year: "numeric",
        month: "short",
        day: "numeric"
    };

    useEffect(() => {
        if (!login) return
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
            setLoading(false)
            if (!(session && session.user && ((data.author._id == session.user._id) || (session.user.type == 'admin')))) return
            setBlog({ ...data, author: null });
            setHasChanges(false)
            setAuthor({ ...data.author, createdAt: new Date(data.author.createdAt) })
        }).catch(e => {
            console.log(e)
            setBlog({})
            setHasChanges(false)
            setAuthor({})
            setLoading(false)
        })
    }, [slug, login])

    if (!login || !allowed) return <div className='container'>Not allowed</div>

    const handleEditorChange = (content, editor) => {
        setBlog({ ...blog, content })
        setHasChanges(true)
    }

    const handleInputChange = (e) => {
        setBlog({ ...blog, [e.target.name]: e.target.value })
    }

    const handleTitleChange = (e) => {
        setBlog({ ...blog, title: e.target.innerHTML })
        setHasChanges(true)
        console.log(blog.title)
    };

    const handleImageChange = (e) => {
        Swal.fire({
            title: 'Enter Image URL',
            input: 'text',
            inputPlaceholder: 'Enter the image URL',
            inputAttributes: {
                'aria-label': 'Image URL'
            },
            showCancelButton: true,
            confirmButtonText: 'Preview',
            preConfirm: (url) => {
                // Display a preview of the image
                Swal.fire({
                    title: 'Image Preview',
                    imageUrl: url,
                    imageAlt: 'Preview',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                    confirmButtonText: 'Save',
                }).then((result) => {
                    if (result.isConfirmed) {
                        setBlog({ ...blog, image: url })
                        Swal.fire('Image Saved!', '', 'success');
                    }
                });
            }
        });
    }

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
                    (session && ((session.user.type == 'admin') || (session.user._id == author._id))) && blog._id && <>
                        <div className="d-flex flex-column">
                            <div className='px-4'>
                                <nav className='my-4 d-sm-block d-none' aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                                        <li className="breadcrumb-item"><Link href="/blog">Blogs</Link></li>
                                        <li className="breadcrumb-item"><Link href={"/blog/" + blog.slug}>{blog.title}</Link></li>
                                        <li className="breadcrumb-item active" aria-current="page">Edit</li>
                                    </ol>
                                </nav>
                                <Link href={"/blog/" + blog.slug} className='d-flex align-items-center my-4 d-sm-none'><FontAwesomeIcon icon={faAngleLeft} size='2xs' />&nbsp;&nbsp;Blog</Link>
                                <h1 className="mb-3 p-1 editable border-hover" name="title" contentEditable={true} onBlur={handleTitleChange} data-placeholder="Title" dangerouslySetInnerHTML={{ __html: blog.title }}></h1>
                                <p className="text-muted">{new Date(blog.createdAt).toLocaleString("en-US", options)}</p>
                                <Link className='mylink' href={'/author/' + author.username}>
                                    <div className="d-flex align-items-center">
                                        <img src={author.image} alt="Author" width={30} height={30} className="rounded-circle my-3" />
                                        <div className="mx-2 d-flex align-items-center">
                                            <p className="mb-0 me-1" style={{ fontSize: '18px' }}>{author.firstName} {author.lastName}</p>
                                            {(author.type == "admin") && <img className='my-1' style={{ pointerEvents: "none", userSelect: "none" }} src={'/verified.svg'} height='20px' width='20px' />}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="text-center px-sm-4" style={{ overflowX: 'auto' }}>
                                <img className="mt-3 mb-4 w-100 border-hover" style={{ display: 'block', margin: '0 auto' }} src={blog.image} alt={blog.title} onClick={handleImageChange} />
                            </div>
                            <div className="mx-4 mb-3 col-md-5">
                                <label htmlFor="tags">Tags&nbsp;</label><span className="text-secondary">(Comma seperated)</span>
                                <input type="text" className="form-control" id="tags" name="tags" onChange={handleInputChange} value={blog.tags} />
                                <div className="badge-group mb-4">
                                    {blog.tags.split(',').map((tag, index) => (
                                        <span key={index} className="badge rounded-pill bg-primary me-2 my-2">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
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
                    </>
                }
                {
                    !(session && ((session.user.type == 'admin') || (session.user._id == author._id))) && <div>Not Allowed</div>
                }
                {
                    session && ((session.user.type == 'admin') || (session.user._id == author._id)) && !loading && !blog._id && <div>Blog doesn&apos;t exist</div>
                }
                {
                    loading && <>
                        <Shimmer width={500} height={20} duration={1500} />
                        <Shimmer width={400} height={20} duration={1500} />
                        <Shimmer width={200} height={200} duration={1500} />
                        <Shimmer width={450} height={20} duration={1500} />
                    </>
                }
            </div>
        </main>
    )
}

export default BlogPost

export async function getServerSideProps(context) {
    const session = await getSession(context)
    console.log(context.query.slug)
    // console.log("Session", session?.user)
    fetch(process.env.NEXTAUTH_URL + '/api/blog/', {
        method: "POST",
        body: JSON.stringify({ slug: context.query.slug }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(data => data.json()).then(data => {
        if (!session || !session.user || (data.author._id != session.user._id))
            return {
                props: {
                    login: session ? true : false,
                    session: session,
                    allowed: false
                }
            }
    }).catch(e => {
        console.log(e)
    })
    return {
        props: {
            login: session ? true : false,
            session: session,
            allowed: true
        }
    }
}