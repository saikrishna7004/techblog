import Head from 'next/head'
import { Editor } from '@tinymce/tinymce-react'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getSession, useSession } from 'next-auth/react';

function Write({ login }) {

    const { data: session, status } = useSession()

    if (!login) return <div className='container my-4'>
        <h4>Want to contribute?</h4>
        <p>Reach out to us at our mail to get your credentials and start contributing the blogs.</p>
    </div>

    const [blog, setBlog] = useState({ title: "", image: "", content: "", author: session?.user?._id, type: "regular", tags: "" })
    const [isValid, setIsValid] = useState({ title: true, image: true })
    const [authors, setAuthors] = useState([])

    useEffect(() => {
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

    const handleEditorChange = (content, editor) => {
        setBlog({ ...blog, content })
    }

    const handleInputChange = (e) => {
        if (e.target.value.trim() == '') setIsValid({ ...isValid, [e.target.name]: false }); else setIsValid({ ...isValid, [e.target.name]: true })
        setBlog({ ...blog, [e.target.name]: e.target.value })
    }

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
                            <label htmlFor="image">Cover Image URL</label>
                            <input type="text" className={"form-control " + (isValid.image ? '' : 'is-invalid')} id="image" name="image" onChange={handleInputChange} value={blog.image} />
                            <div className="invalid-feedback">
                                Please enter an image URL.
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
                            <label htmlFor="tags">Tags</label>
                            <input type="text" className="form-control" id="tags" name="tags" onChange={handleInputChange} value={blog.tags} />
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
                                    toolbar: 'undo redo | styles | bold italic strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist | formatselect | removeformat'
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