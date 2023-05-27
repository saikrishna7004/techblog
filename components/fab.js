import { faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FloatingActionButton = (props) => {
    const [show, setShow] = useState(false)

    useEffect(() => {
        document.addEventListener('click', handleClickOutside)
    }, []);

    const handleClickOutside = (event) => {
        if (
            !event.target.closest('#fab1') &&
            !event.target.closest('#fab2') &&
            !event.target.closest('#fab3') &&
            !event.target.closest('#fab4') &&
            !event.target.closest('#fabIcon')
        ) {
            setShow(false)
        }
    };

    return (
        <div>
            <div className={"inner-fabs " + (show ? 'show' : '')}>
                <Link className="fab round" id="fab2" data-tooltip="Edit" href={props.link}><FontAwesomeIcon icon={faPencil} size='2xs' /></Link>
                <div className="fab round" id="fab3" data-tooltip="Delete" onClick={props.handleDelete}><FontAwesomeIcon icon={faTrash} size='2xs' /></div>
            </div>
            <div className="fab round" id="fab1" onClick={()=>setShow(!show)}><FontAwesomeIcon id="fabIcon" icon={faPlus} size='2xs' /></div>
        </div>
    );
};

export default FloatingActionButton;
