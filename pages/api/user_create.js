import connectMongo from '../../utils/connectMongo';
import User from '../../models/user'
import slugify from 'slugify';

async function connect() {
    await connectMongo();
    console.log('CONNECTED TO MONGO');
}
connect();

export default async function handler(req, res) {
    try {
        console.log(req.body)
        const user = await User.create({
            ...req.body
        })
        return res.status(200).json({ ...user._doc })
    } catch (error) {
        console.log(error)
        if (error.keyValue && error.keyValue.username) {
            return res.status(200).json({ error: "Username "+req.body.username+" already exists" })
        }
        return res.status(400).json({ error })
    }
}
