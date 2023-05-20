import connectMongo from '../../utils/connectMongo';
import User from '../../models/user';

async function connect() {
    await connectMongo();
    console.log('CONNECTED TO MONGO');
}
connect();

export default async function handler(req, res) {
    try {
        // console.log(req.body)
        let user = await User.findOne({username: req.body.username, password: req.body.password}).select('-password')
        // console.log(user)
        if(user) return res.status(200).json({...user._doc})
        return res.status(400).json({error: "Invalid username or password"})
    } catch (error) {
        console.log(error)
        return res.status(400).json({error})
    }
}
