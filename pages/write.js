import Head from 'next/head'
import { Editor } from '@tinymce/tinymce-react'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

function Write({ login }) {

    const { data: session, status } = useSession()
    const router = useRouter();

    const [blog, setBlog] = useState({ title: "", image: "https://neorablog.com/wp-content/uploads/2019/04/1200x600-Placeholder.png", content: "", author: session?.user?._id, type: "regular", tags: "" })
    const [isValid, setIsValid] = useState({ title: true, image: true })
    const [authors, setAuthors] = useState([])

    useEffect(() => {
        if (login)
            fetch('/api/authors')
                .then((response) => response.json())
                .then((data) => setAuthors(data.users))
                .catch((error) => console.error('Error fetching authors:', error));
    }, []);

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
                return fetch("/api/create", {
                    method: 'POST',
                    body: JSON.stringify(blog),
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
                        }).then(result => {
                            if (result.isConfirmed) {
                                router.push('/blog/' + data.slug)
                            }
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
        })
    }

    const handleEditorChange = (content, editor) => {
        setBlog({ ...blog, content })
    }

    const handleInputChange = (e) => {
        if (e.target.value.trim() == '') setIsValid({ ...isValid, [e.target.name]: false }); else setIsValid({ ...isValid, [e.target.name]: true })
        setBlog({ ...blog, [e.target.name]: e.target.value })
    }

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

    if (!login) return <div className='container my-4'>
        <h4>Want to contribute?</h4>
        <p>Reach out to us at our mail to get your credentials and start contributing the blogs.</p>
    </div>

    return (
        <>
            <Head>
                <title>Write a Blog - My Blog Site</title>
            </Head>
            <div className="container mt-4">
                {(session && session.user) ? <div>
                    <div className="row">
                        <div className="form-group mb-3 col-md-5">
                            <label htmlFor="title">Title</label>
                            <input type="text" className={"form-control " + (isValid.title ? '' : 'is-invalid')} id="title" name="title" onChange={handleInputChange} value={blog.title} />
                            <div className="invalid-feedback">
                                Please enter a title.
                            </div>
                        </div>
                        <div className="form-group mb-3 col-md-5">
                            <label htmlFor="image">Type</label>
                            <select className="form-select" id="type" name="type" onChange={handleInputChange} value={blog.type} aria-label="Type of blog">
                                <option value="regular">Regular</option>
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="Special">Special</option>
                            </select>
                        </div>
                        {session && session.user && (session.user.type == 'admin') && <div className="form-group mb-3 col-md-5">
                            <label htmlFor="author">Author</label>
                            <select className="form-select" id="author" name="author" onChange={handleInputChange} value={blog.author}>
                                {authors.map((author) => (
                                    <option key={author._id} value={author._id}>
                                        {author.firstName} {author.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>}
                        <div className="form-group mb-3 col-md-5">
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
                        <div className="form-group mb-3 col-md-5" style={{ cursor: 'pointer' }}>
                            <label htmlFor="image">Cover Image</label>
                            <div className="text-center px-sm-4" style={{ overflowX: 'auto' }}>
                                <img className="mt-3 mb-4 w-100 border-hover" style={{ display: 'block', margin: '0 auto' }} src={blog.image} alt={blog.title} onClick={handleImageChange} />
                            </div>
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="content">Content</label>
                            <Editor
                                id="content-editor"
                                instanceId="content-editor"
                                initialValue="<p>Start writing here...</p>"
                                init={{
                                    height: 500,
                                    skin: "oxide",
                                    plugins:
                                        'advlist autolink lists link image charmap preview anchor\
                                    searchreplace visualblocks code fullscreen\
                                    insertdatetime media table code help wordcount',
                                    toolbar: 'undo redo | styles | bold italic strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist | formatselect | removeformat',
                                }}
                                onEditorChange={handleEditorChange}
                                value={blog.content}
                            />
                        </div>
                    </div>
                    <button type="submit" onClick={submitBlog} className="btn btn-primary mb-3">Submit</button>
                </div> : <div className='container my-4'>
                    <h4>Want to contribute?</h4>
                    <p>Reach out to us at our mail to get your credentials and start contributing the blogs.</p>
                </div>}
            </div>
        </>
    );
}

export default Write;

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