import connectMongo from '../../utils/connectMongo';
import User from '../../models/user'
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: "Unauthorised user" })
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
        if (error.keyValue && error.keyValue.email) {
            return res.status(200).json({ error: "Email "+req.body.email+" already exists" })
        }
        return res.status(400).json({ error })
    }
}
