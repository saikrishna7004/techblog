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

		if (req.query.q) {
			const filters = {};
			if (req.query.filter) {
				const { type, fromDate, toDate, q } = req.query;
				if (type) {
					filters.type = { $in: type.split(',') };
				}
				if (fromDate && toDate) {
					filters.createdAt = {
						$gte: new Date(fromDate),
						$lte: new Date(toDate),
					};
				} else if (fromDate) {
					filters.createdAt = {
						$gte: new Date(fromDate),
					};
				} else if (toDate) {
					filters.createdAt = {
						$lte: new Date(toDate),
					};
				}
			}
			const regex = new RegExp(req.query.q, 'i')
			const blogs = await BlogPost.find({ $or: [{ title: regex }, { content: regex }], ...filters }).sort({ createdAt: -1 }).populate('author', 'firstName lastName username type').skip(skip).limit(limit)
			return res.json({ blogs })
		}
		else if (req.query.filter) {
			const { type, fromDate, toDate } = req.query;
			const filters = {};
			if (type) {
				filters.type = { $in: type.split(',') };
			}
			if (fromDate && toDate) {
				filters.createdAt = {
					$gte: new Date(fromDate),
					$lte: new Date(toDate),
				};
			} else if (fromDate) {
				filters.createdAt = {
					$gte: new Date(fromDate),
				};
			} else if (toDate) {
				filters.createdAt = {
					$lte: new Date(toDate),
				};
			}
			const blogs = await BlogPost.find(filters).sort({ createdAt: -1 }).populate('author', 'firstName lastName username type').skip(skip).limit(limit)
			return res.json({ blogs })
		}
		else if (req.query.group == 'week') {
			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
			const blogs = await BlogPost.find({ createdAt: { $gte: oneWeekAgo }, type: { $ne: "weekly" } }).sort({ createdAt: -1 }).populate('author', 'firstName lastName username type').skip(skip).limit(limit)
			return res.status(200).json({ blogs });
		}
		else if (type) {
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
