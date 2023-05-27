import 'bootstrap/dist/css/bootstrap.min.css'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import NavLink from './navlink';
import { getSession, signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons';


const Navbar = () => {

    useEffect(() => {
        require("bootstrap/js/dist/collapse");
    }, []);

    const router = useRouter()
    const { data: session, status } = useSession()
    const [searchText, setSearchText] = useState('')
    const handleSearch = (e)=>{
        e.preventDefault()
        router.push(`/blog/search?q=${searchText}`)
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg" style={{ background: "var(--navbar-bg)", boxShadow: "0px 0px 8px 2px #000000" }}>
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
                            {status != "loading" && !session && <li className="nav-item">
                                <NavLink className="nav-link" href={(router.asPath.indexOf('/login') > -1) ? router.asPath : ("/login?next=" + router.asPath)}>Login</NavLink>
                            </li>}
                            {session && <li className="nav-item">
                                <NavLink className="nav-link" href="/api/auth/signout" onClick={(e) => {
                                    e.preventDefault()
                                    signOut({ redirect: false })
                                }}>Logout</NavLink>
                            </li>}
                        </ul>
                        <div className='me-4'>
                            {session?.user.firstName} {session?.user.lastName}
                        </div>
                    </div>
                </div>
            </nav>
            <nav className="navbar navbar-expand py-3 sticky-top" style={{ background: "var(--navbar-bg-2)", height: '50px' }}>
                <div className="container-fluid">
                    <Link className='ms-4' href='/'><FontAwesomeIcon icon={faHome} style={{color: 'var(--navbar-text)'}} /></Link>
                    <form className="d-flex me-2" onSubmit={handleSearch}>
                        <input className="form-control search-input" type="search" value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search" aria-label="Search" />
                        <button className="btn search-btn" type='submit'><FontAwesomeIcon icon={faSearch} className="search-icon" /></button>
                    </form>
                </div>
            </nav>
        </>
    )
}

export default Navbar