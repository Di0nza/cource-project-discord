import mongoose from './mongoose';

const MemberRoleEnum = ['ADMIN', 'MODERATOR', 'GUEST'];

// Member Schema
const MemberModel = mongoose.models.Member ?
    mongoose.model('Member') : mongoose.model('Member', new mongoose.Schema({
        role: {type: String, enum: MemberRoleEnum, default: 'GUEST'},
        messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
        directMessages: [{type: mongoose.Schema.Types.ObjectId, ref: 'DirectMessage'}],
        conversationInitial: [{type: mongoose.Schema.Types.ObjectId, ref: 'Conversation'}],
        conversationReceived: [{type: mongoose.Schema.Types.ObjectId, ref: 'Conversation'}],
        profileId: {type: mongoose.Schema.Types.ObjectId, ref: 'Profile'},
        serverId: {type: mongoose.Schema.Types.ObjectId, ref: 'Server'},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
    }));


module.exports = MemberModel;