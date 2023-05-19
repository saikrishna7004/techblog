import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

export default function BlogCard({ title, summary, slug, image }) {

    const [avgColor, setAvgColor] = useState('radial-gradient(var(--card-bg-1), var(--card-bg-2))');
    const ref = useRef(null);

    useEffect(() => {
        refreshImgBg()
    }, [])

    const refreshImgBg = ()=>{
        const img = ref.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

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
        });
    }

    return (
        <div href={`/blog/${slug}`} className="blog-card" style={{borderRadius: '5px'}}>
            <div className="card" style={{ background: avgColor }}>
                <Link href={`/blog/${slug}`} className='p-3'>
                    <img className="card-img-top" style={{aspectRatio: 1.5, objectFit: 'contain'}} src={image} alt={title} ref={ref} />
                </Link>
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <p className="card-text">{summary}</p>
                    <div className="row align-items-center mx-1">
                        <Link href={`/blog/${slug}`} className="btn btn-primary col-auto">Read More</Link>
                        <Link href={`/blog/${slug}/edit`} className="col-auto ms-auto"><FontAwesomeIcon icon={faEdit} size="x" /></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
