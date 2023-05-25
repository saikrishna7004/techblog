import { Schema, model, models } from 'mongoose';
import User from './user';

const blogpostSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
    upvotes: Number,
    downvotes: Number,
    type: {
        type: String,
        enum: ['regular', 'weekly', 'biweekly', 'monthly', 'special'],
        default: 'regular'
    },
    tags: String
}, {
    timestamps: true
});

const BlogPost = models.BlogPost || model('BlogPost', blogpostSchema);

export default BlogPost;
