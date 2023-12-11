import mongoose from './mongoose';

const MessageModel = mongoose.models.Message ?
    mongoose.model('Message') : mongoose.model('Message', new mongoose.Schema({
        content: String,
        fileUrl: {type: String, require: false},
        memberId: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
        channelId: {type: mongoose.Schema.Types.ObjectId, ref: 'Channel'},
        deleted: {type:Boolean, default: false},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
    }));

module.exports = MessageModel;