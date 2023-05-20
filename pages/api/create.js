import connectMongo from '../../utils/connectMongo';
import BlogPost from '../../models/blogpost';
import slugify from 'slugify';

async function connect() {
    await connectMongo();
    console.log('CONNECTED TO MONGO');
}
connect();

export default async function handler(req, res) {
    try {
        // console.log(req.body)
        const blog = await BlogPost.create({
            ...req.body, slug: slugify(req.body.title, {
                remove: /[*+~.()'"!:@]/g,
                lower: true
            })
        })
        return res.status(200).json({ ...blog._doc })
    } catch (error) {
        // console.log(error)
        if (error?.errors?.author?.reason) {
            return res.status(400).json({ error: "Author is invalid" })
        }
        if (error?.errors?.author?.properties?.message) {
            return res.status(400).json({ error: "Author is required" })
        }
        if (error?.errors?.title?.properties?.message) {
            return res.status(400).json({ error: "Title is required" })
        }
        if (error?.errors?.image?.properties?.message) {
            return res.status(400).json({ error: "Image is required" })
        }
        if (error?.errors?.content?.properties?.message) {
            return res.status(400).json({ error: "Content is required" })
        }
        if (error.keyValue && error.keyValue.slug) {
            const blog = await BlogPost.create({
                ...req.body, slug: slugify(req.body.title, {
                    remove: /[*+~.()'"!:@]/g,
                    lower: true
                })+"-"+Math.random().toString(36).substring(2, 7)
            })
            return res.status(200).json({ ...blog._doc })
        }
        return res.status(400).json({ error })
    }
}
