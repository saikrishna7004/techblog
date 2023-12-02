import connectMongo from '../../utils/connectMongo';
import BlogPost from '../../models/blogpost';
import { authOptions } from './auth/[...nextauth]';
import { getServerSession } from 'next-auth';

async function connect() {
    await connectMongo();
    console.log('Attempted a connection');
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
        if (req.body.content){
            blog.content = req.body.content;
        }
        if (req.body.title){
            blog.title = req.body.title;
        }
        if (req.body.image){
            blog.image = req.body.image;
        }
        if (req.body.tags){
            blog.tags = req.body.tags;
        }
        await blog.save();
        return res.status(200).json({ ...blog._doc })
    } catch (error) {
        return res.status(400).json({ error })
    }
}
