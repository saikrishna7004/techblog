import connectMongo from '../../utils/connectMongo';
import BlogPost from '../../models/blogpost';
import { authOptions } from './auth/[...nextauth]';
import { getServerSession } from 'next-auth';

async function connect() {
    await connectMongo();
    console.log('CONNECTED TO MONGO');
}
connect();

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: "Unauthorised user" })
    try {
        const blog = await BlogPost.findOne({ slug: req.body.slug });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        if (blog.content){
            blog.content = req.body.content;
        }
        if (blog.title){
            blog.title = req.body.title;
        }
        await blog.save();
        return res.status(200).json({ ...blog._doac })
    } catch (error) {
        return res.status(400).json({ error })
    }
}
