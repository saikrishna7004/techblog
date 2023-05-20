import connectMongo from '../../utils/connectMongo';
import BlogPost from '../../models/blogpost';

async function connect() {
    await connectMongo();
    console.log('CONNECTED TO MONGO');
}
connect();

export default async function handler(req, res) {
    try {
        let blog = await BlogPost.findOne({slug: req.body.slug}).populate('author', '-password')
        if(blog) return res.status(200).json({...blog._doc})
        return res.status(400).json({error: "Slug " + req.body.slug + " not found"})
    } catch (error) {
        console.log(error)
        return res.status(400).json({error})
    }
}
