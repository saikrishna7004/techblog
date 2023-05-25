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
		const type = req.query.type || ''
		const limit = 6;
		const skip = (page - 1) * limit;

		if (req.query.group == 'week') {
			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
			const blogs = await BlogPost.find({ createdAt: { $gte: oneWeekAgo }, type: { $ne: "weekly" } }).populate('author', 'firstName lastName username type').sort({ createdAt: -1 }).skip(skip).limit(limit)
			return res.status(200).json({ blogs });
		}
		else if(type){
			const blogs = await BlogPost.find({ type }).sort({ createdAt: -1 }).populate('author', 'firstName lastName username type').skip(skip).limit(limit)
			return res.status(200).json({ blogs });
		}
		else {
			const blogs = await BlogPost.find({}).sort({ createdAt: -1 }).populate('author', 'firstName lastName username type').skip(skip).limit(limit)
			return res.status(200).json({ blogs });
		}
	} catch (error) {
		console.log(error)
		return res.status(400).json({ error });
	}
}
