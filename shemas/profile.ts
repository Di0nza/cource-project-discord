import mongoose from './mongoose';

// Profile Schema
const ProfileModel = mongoose.models.Profile ?
    mongoose.model('Profile') : mongoose.model('Profile', new mongoose.Schema({
    userId: { type: String, unique: true },
    name: String,
    imageUrl: String,
    email: String,
    servers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Server' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}));


module.exports = ProfileModel;