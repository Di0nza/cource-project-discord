import mongoose from './mongoose';

// Enum definitions
const ChannelTypeEnum = ['TEXT', 'AUDIO', 'VIDEO'];


// Channel Schema
const ChannelModel = mongoose.models.Channel ?
    mongoose.model('Channel') : mongoose.model('Channel', new mongoose.Schema({
        name: String,
        type: {type: String, enum: ChannelTypeEnum, default: 'TEXT'},
        profileId: {type: mongoose.Schema.Types.ObjectId, ref: 'Profile'},
        serverId: {type: mongoose.Schema.Types.ObjectId, ref: 'Server'},
        messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
    }));

module.exports = ChannelModel;