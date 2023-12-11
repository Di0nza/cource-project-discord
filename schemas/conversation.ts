import mongoose from './mongoose';

const ConversationModel = mongoose.models.Conversation ?
    mongoose.model('Conversation') : mongoose.model('Conversation', new mongoose.Schema({
        memberOne: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
        memberTwo: {type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
        directMessages: [{type: mongoose.Schema.Types.ObjectId, ref: 'DirectMessage'}],
    }));

module.exports = ConversationModel;