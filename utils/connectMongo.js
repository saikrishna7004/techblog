import mongoose from 'mongoose';

const connectMongo = async () => mongoose.connect(process.env.MONGODB_URI);

async function connect() {
    await connectMongo();
    console.log('CONNECTED TO MONGO');
}
connect();

export default connectMongo;
