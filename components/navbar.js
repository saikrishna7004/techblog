import 'bootstrap/dist/css/bootstrap.min.css'
import Link from 'next/link'
import { useEffect } from 'react';
import NavLink from './navlink';
import { getSession, signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';


const Navbar = () => {

    useEffect(() => {
        require("bootstrap/js/dist/collapse");
    }, []);

    const router = useRouter()
    const { data: session, status } = useSession()
    
    return (
        <nav className="navbar navbar-expand-lg" style={{background: "var(--navbar-bg)"}}>
            <div className="container-fluid">
                <Link className="navbar-brand" href="/">College Blog</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbar">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <NavLink className="nav-link" href="/">Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" href="/blog">Blogs</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" href="/request">Request</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" href="/write">Write</NavLink>
                        </li>
                        {status!="loading" && !session && <li className="nav-item">
                            <NavLink className="nav-link" href={(router.asPath.indexOf('/login')>-1)?router.asPath:("/login?next="+router.asPath)}>Login</NavLink>
                        </li>}
                        {session && <li className="nav-item">
                            <NavLink className="nav-link" href="/api/auth/signout" onClick={(e)=>{
                                e.preventDefault()
                                signOut()
                            }}>Logout</NavLink>
                        </li>}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar