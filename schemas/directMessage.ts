import mongoose from './mongoose';

const DirectMessageModel = mongoose.models.DirectMessage ?
    mongoose.model('DirectMessage') : mongoose.model('DirectMessage', new mongoose.Schema({
        content: String,
        fileUrl: {type: String, require: false},
        memberId: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
        conversationId: {type: mongoose.Schema.Types.ObjectId, ref: 'Conversation'},
        deleted: {type:Boolean, default: false},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
    }));

module.exports = DirectMessageModel;