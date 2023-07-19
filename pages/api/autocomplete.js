import connectMongo from '../../utils/connectMongo';
import BlogPost from '../../models/blogpost';

async function connect() {
    await connectMongo();
    console.log('Attempted a connection');
}

connect();

export default async function handler(req, res) {
    const { term } = req.query;
    try {
        const searchText = term;
        const searchWords = searchText.split(' ')
        const regexExpressions = searchWords.map(word => new RegExp(word, 'i'))
        const query = {
            $or: regexExpressions.map(regex => ({ title: regex }))
        }
        const blogs = await BlogPost.find(query, 'title slug')
        console.log(blogs)
        return res.status(200).json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching autocomplete results.' });
    }
}
