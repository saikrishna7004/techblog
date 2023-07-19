import connectMongo from '../../utils/connectMongo';
import User from '../../models/user';

async function connect() {
    await connectMongo();
    console.log('Attempted a connection');
}

connect();

export default async function handler(req, res) {
    try {
        let user = await User.findOne({username: req.body.username}).select('-password')
        if(user) return res.status(200).json({...user._doc})
        return res.status(400).json({error: "Username " + req.body.username + " not found"})
    } catch (error) {
        console.log(error)
        return res.status(400).json({error})
    }
}
