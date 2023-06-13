import 'bootstrap/dist/css/bootstrap.min.css'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react';
import NavLink from './navlink';
import { signOut, useSession } from 'next-auth/react';
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
    const [autocompleteResults, setAutocompleteResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const suggestionListRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault()
        setSearchText('')
        setAutocompleteResults([])
        setShowSuggestions(true)
        router.push(`/blog/search?q=${searchText}`)
    }

    const handleKeyDown = (e) => {
        if (e.key == 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestion((prevIndex) => Math.max(prevIndex - 1, 0));
        } else if (e.key == 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestion((prevIndex) => Math.min(prevIndex + 1, autocompleteResults.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if(activeSuggestion==-1){
                handleSearch(e)
                setSearchText('')
                setShowSuggestions(false)
                setAutocompleteResults([])
                return
            }
            handleSuggession(e, autocompleteResults[activeSuggestion]);
        }
    };

    const handleSearchTermChange = (event) => {
        const { value } = event.target;
        setSearchText(value);
        setActiveSuggestion(-1)
        if (!value || (value == '')) {
            setAutocompleteResults([])
            setShowSuggestions(false)
            return
        }
        fetch(`/api/autocomplete?term=${value}`)
            .then((response) => response.json())
            .then((data) => {
                setAutocompleteResults(data);
                setShowSuggestions(data.length > 0);
            })
            .catch((error) => console.error('Error fetching autocomplete results:', error));
    };

    const handleSuggession = (e, result) => {
        if(!result) return
        router.push(`/blog/${result.slug}`)
        setSearchText('')
        setShowSuggestions(false)
        setAutocompleteResults([])
    }

    useEffect(() => {
        if (suggestionListRef.current) {
            const suggestionItem = suggestionListRef.current.querySelector(`.autocomplete-suggestion:nth-child(${activeSuggestion + 1})`);
            if (suggestionItem) {
                suggestionItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [activeSuggestion]);

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
                    <Link className='ms-4' href='/'><FontAwesomeIcon icon={faHome} style={{ color: 'var(--navbar-text)' }} /></Link>
                    <form className="d-flex me-2" onSubmit={handleSearch}>
                        <input className="form-control search-input" type="search" value={searchText} onChange={handleSearchTermChange} placeholder="Search" aria-label="Search" onKeyDown={handleKeyDown} />
                        <button className="btn search-btn" type='submit'><FontAwesomeIcon icon={faSearch} className="search-icon" /></button>
                        {showSuggestions && (
                            <ul className="autocomplete-suggestions" ref={suggestionListRef}>
                                {autocompleteResults.map((result, index) => (
                                    <li className={`autocomplete-suggestion${index === activeSuggestion ? ' active' : ''}`} key={result._id} onClick={(e) => handleSuggession(e, result)}>
                                        {result.title}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </form>
                </div>
            </nav>
        </>
    )
}

export default Navbar