import connectMongo from '../../utils/connectMongo';
import BlogPost from '../../models/blogpost';
import slugify from 'slugify';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

async function connect() {
    await connectMongo();
    console.log('Attempted a connection');
}

connect();

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: "Unauthorised user" })
    try {
        // console.log(req.body)
        const blog = await BlogPost.create({
            ...req.body, slug: slugify(req.body.title.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]/gu, ''), {
                remove: /[*+~.()'"!:@]/g,
                lower: true
            })
        })
        return res.status(200).json({ ...blog._doc })
    } catch (error) {
        // console.log(error)
        if (error?.errors?.author?.reason) {
            return res.status(400).json({ error: "Author is invalid" })
        }
        if (error?.errors?.author?.properties?.message) {
            return res.status(400).json({ error: "Author is required" })
        }
        if (error?.errors?.title?.properties?.message) {
            return res.status(400).json({ error: "Title is required" })
        }
        if (error?.errors?.image?.properties?.message) {
            return res.status(400).json({ error: "Image is required" })
        }
        if (error?.errors?.content?.properties?.message) {
            return res.status(400).json({ error: "Content is required" })
        }
        if (error.keyValue && error.keyValue.slug) {
            const blog = await BlogPost.create({
                ...req.body, slug: slugify(req.body.title.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]/gu, ''), {
                    remove: /[*+~.()'"!:@]/g,
                    lower: true
                }) + "-" + Math.random().toString(36).substring(2, 7)
            })
            return res.status(200).json({ ...blog._doc })
        }
        return res.status(400).json({ error })
    }
}
