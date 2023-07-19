import connectMongo from '../../utils/connectMongo';
import User from '../../models/user';

async function connect() {
    await connectMongo();
    console.log('Attempted a connection');
}

connect();

export default async function handler(req, res) {
    try {
        let users = await User.find({}).select({_id: 1, firstName: 1, lastName: 1, username: 1})
        return res.status(200).json({users})
    } catch (error) {
        console.log(error)
        return res.status(400).json({error})
    }
}
