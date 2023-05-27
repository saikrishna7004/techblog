import connectMongo from '../../utils/connectMongo';
import BlogPost from '../../models/blogpost';

async function connect() {
    await connectMongo();
    console.log('CONNECTED TO MONGO');
}

connect();

export default async function handler(req, res) {
    const { term } = req.query;
    try {
        const regex = new RegExp(term, 'i');
        const matchingPosts = await BlogPost.find({ title: regex }, 'title slug');
        res.status(200).json(matchingPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching autocomplete results.' });
    }
}
