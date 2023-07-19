import connectMongo from '../../utils/connectMongo';
import BlogPost from '../../models/blogpost';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]'

async function connect() {
    await connectMongo();
    console.log('Attempted a connection');
}

connect();

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: "Unauthorised user" })
    try {
        console.log(req.body.id)
        let blog = await BlogPost.findByIdAndDelete(req.body.id)
        if(blog) return res.status(200).json({...blog})
        return res.status(400).json({error: "Error finding blog with id "+req.body.id})
    } catch (error) {
        console.log(error)
        return res.status(400).json({error})
    }
}
