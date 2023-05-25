import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const AuthorDetailsPage = () => {

    const router = useRouter()
    const username = router.query.username
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

    useEffect(() => {
        fetch('/api/author', {
            method: 'POST',
            body: JSON.stringify({username}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(d=>d.json()).then(data=>{
            console.log(data)
            setAuthor(data)})
    }, [])
    

    return (
        <div className="container">
            {author.email ? <div className="row justify-content-center d-flex align-items-center" style={{minHeight: '80vh'}}>
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <div className="text-center mb-4">
                                <img src={author.image} alt="Author" className="rounded-circle" width={150} height={150} />
                            </div>
                            <h2 className="text-center">{`${author.firstName} ${author.lastName}`}</h2>
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
            </div> : <div className='my-4'>Username invalid</div>}
        </div>
    );
};

export default AuthorDetailsPage;

export async function getServerSideProps(context) {
    return {
        props: {},
    };
}