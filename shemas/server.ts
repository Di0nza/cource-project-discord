import mongoose from './mongoose';

// Server Schema
const ServerModel = mongoose.models.Server ?
    mongoose.model('Server') : mongoose.model('Server', new mongoose.Schema({
    name: String,
    imageUrl: String,
    inviteCode: String,
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}));
module.exports = ServerModel;