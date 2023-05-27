import React, { useEffect, useState } from 'react';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton, FacebookIcon, TwitterIcon, LinkedinIcon, WhatsappIcon } from 'react-share';
import { useRouter } from 'next/router';

const ShareButtons = ({ title, ...props }) => {
    const router = useRouter();
    const { asPath } = router;

    const [fullUrl, setFullUrl] = useState('');

    const shareMessage = `Hi, I just discovered an amazing blog on Tech Veda that I can't wait to share with you! 😍🚀 \n\nCheck it out here:`;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = `${window.location.origin}${asPath}`;
            setFullUrl(url);
        }
    }, [asPath]);

    if (!fullUrl) {
        // Render a loading state or return null while the URL is being fetched
        return null;
    }

    return (
        <div className="share-buttons" {...props}>
            <FacebookShareButton url={fullUrl} quote={shareMessage} className="btn p-0 me-2">
                <FacebookIcon size={32} round />
            </FacebookShareButton>

            <TwitterShareButton url={fullUrl} title={shareMessage} className="btn p-0 me-2">
                <TwitterIcon size={32} round />
            </TwitterShareButton>

            <LinkedinShareButton url={fullUrl} title={shareMessage} className="btn p-0 me-2">
                <LinkedinIcon size={32} round />
            </LinkedinShareButton>

            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage+' \n'+fullUrl)}`} target="_blank" rel="noopener noreferrer" className="btn p-0 me-2" separator="">
                <WhatsappIcon size={32} round />
            </a>

            <a href={`https://www.instagram.com/?url=${fullUrl}`} target="_blank" rel="noopener noreferrer" className=" p-0" style={{ height: '32px', width: '32px', textAlign: 'center' }}>
                <svg viewBox="0 0 64 64" width="32" height="32">
                    <circle cx="32" cy="32" r="31" fill="#E4405F" />
                    <path d="M45.707,14H18.293C15.784,14,14,15.784,14,18.293v27.414C14,46.216,15.784,48,18.293,48h27.414C48.216,48,50,46.216,50,43.707V18.293C50,15.784,48.216,14,45.707,14z M47,43.707C47,44.391,46.391,45,45.707,45H18.293C17.609,45,17,44.391,17,43.707V18.293C17,17.609,17.609,17,18.293,17h27.414C46.391,17,47,17.609,47,18.293V43.707z" fill="white" />
                    <path d="M32,20c-6.627,0-12,5.373-12,12c0,6.627,5.373,12,12,12c6.627,0,12-5.373,12-12C44,25.373,38.627,20,32,20z M32,40c-4.411,0-8-3.589-8-8s3.589-8,8-8s8,3.589,8,8S36.411,40,32,40z" fill="white" />
                    <circle cx="45.5" cy="18.5" r="1.5" fill="white" />
                </svg>
            </a>
        </div>
    );
};

export default ShareButtons;
