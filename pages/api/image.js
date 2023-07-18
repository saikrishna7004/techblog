// pages/api/image-proxy.js

import fetch from 'node-fetch';
import { Readable } from 'stream';

export default async function handler(req, res) {
    try {
        const { url } = req.query;
        const response = await fetch(url);
        const imageBuffer = await response.buffer();
        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType);
        const imageStream = Readable.from(imageBuffer);
        imageStream.pipe(res);
    } catch (error) {
        console.error('Error fetching or serving image:', error);
        res.status(500).end();
    }
}
