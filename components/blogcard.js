import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faPencil } from '@fortawesome/free-solid-svg-icons'

export default function BlogCard({ title, summary, slug, image, edit, tag, author, verified }) {

    const [avgColor, setAvgColor] = useState('radial-gradient(var(--card-bg-1), var(--card-bg-2))');
    const ref = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        refreshImgBg(ref)
    }, [])

    const refreshImgBg = (ref) => {
        const img = ref.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        img.crossOrigin = 'anonymous';

        img.addEventListener('load', () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let r = 0, g = 0, b = 0;

            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            }

            const pixels = data.length / 4;
            const avgR = Math.floor(r / pixels);
            const avgG = Math.floor(g / pixels);
            const avgB = Math.floor(b / pixels);
            const avgColor = `rgba(${avgR}, ${avgG}, ${avgB}, var(--img-bg-opacity))`;

            setAvgColor(avgColor)
            // console.log(avgColor)
            canvas.remove()
        });
    }

    function handleError(event, url) {
        const image = event.target;
        if (image) {
            image.onerror = null
            image.src = "https://images.weserv.nl/?url=" + url
            image.addEventListener('error', async function handleFallbackError() {
                image.removeEventListener('error', handleFallbackError)
                image.src = "/api/image?url=" + url
            });
        }
    }

    const colors = ['bg-danger', 'bg-primary', 'bg-secondary', 'bg-success', 'bg-warning', 'bg-info']

    return (
        <div className='position-relative'>
            <div href={`/blog/${slug}`} className="blog-card" style={{ borderRadius: '5px' }}>
                <div className="card" style={{ background: avgColor }}>
                    <Link href={`/blog/${slug}`}>
                        <img className="card-img-top" style={{ aspectRatio: 2, objectFit: 'contain' }} src={image} onError={(event) => handleError(event, image)} alt={title} ref={ref} />
                    </Link>
                    <div className="card-body">
                        <h5 className="card-title text-decoration-hover-underline"><Link href={`/blog/${slug}`} style={{ color: 'initial' }}>{title}</Link></h5>
                        <p className="fs-6 align-items-center d-flex">By {author} {verified && <img className='my-1 mx-1' style={{ pointerEvents: "none", userSelect: "none" }} src={'/verified.svg'} height='20px' width='20px' />}</p>
                        <p className="card-text">{summary}</p>
                        {tag && (
                            <div className="badge-group mb-4">
                                {
                                    tag.split(',').map((tag, index) => {
                                        return (
                                            <span key={index} className={`badge rounded-pill ${colors[index % 6]} me-2 mb-2`}>
                                                {tag.trim()}
                                            </span>
                                        );
                                    })
                                }
                            </div>
                        )}
                        <div className="row align-items-center mx-1">
                            <Link href={`/blog/${slug}`} className="btn btn-primary col-auto">Read More</Link>
                            {edit && <Link href={`/blog/${slug}/edit`} className="col-auto ms-auto"><FontAwesomeIcon icon={faPencil} size="1x" /></Link>}
                        </div>
                    </div>
                    <canvas ref={canvasRef} hidden></canvas>
                </div>
            </div>
        </div>
    )
}
