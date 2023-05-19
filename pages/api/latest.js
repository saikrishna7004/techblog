import connectMongo from '../../utils/connectMongo';
import BlogPost from '../../models/blogpost';

async function connect() {
    await connectMongo();
    console.log('CONNECTED TO MONGO');
}
connect();

export default async function handler(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6;
      const skip = (page - 1) * limit;
  
      const blogs = await BlogPost.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  
      return res.status(200).json({ blogs });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
  