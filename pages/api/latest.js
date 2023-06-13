import connectMongo from '../../utils/connectMongo';
import BlogPost from '../../models/blogpost';
import User from '../../models/user';

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

		const filters = {};

		if (req.query.q || req.query.filter) {
			const { fromDate, toDate, q } = req.query;

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

			if (req.query.q) {
				const regex = new RegExp(q, 'i');
				filters.$or = [{ title: regex }, { content: regex }];
			}
		}

		if (req.query.group === 'week') {
			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
			filters.createdAt = { $gte: oneWeekAgo };
			filters.type = { $ne: 'weekly' };
		}

		if (req.query.type) {
			filters.type = { $in: req.query.type.split(',') };
		}

		if (req.query.author) {
			const author = await User.findOne({ username: req.query.author });
			filters.author = author._id;
		}

		const blogs = await BlogPost.find(filters)
			.sort({ createdAt: -1 })
			.populate('author', 'firstName lastName username type')
			.skip(skip)
			.limit(limit);

		return res.status(200).json({ blogs });
	} catch (error) {
		console.log(error);
		return res.status(400).json({ error });
	}
}
