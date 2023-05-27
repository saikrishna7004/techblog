import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

const NavLink = ({className, children, ...props}) => {

    const router = useRouter()

    return (
        <Link className={className + ((router.asPath.split('?')[0]==props.href) ? " active" : "")} {...props}>{children}</Link>
    )
}

export default NavLink
