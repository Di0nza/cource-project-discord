import { connect } from "@/lib/db";
import mongoose from "@/schemas/mongoose";
const ConversationModel = require("@/schemas/conversation");
const MemberModel = require("@/schemas/member");


connect();
export const getOrCreateConversation = async (memberOneId: string, memberTwoId: string) => {
    let conversation = await findConversation(memberOneId, memberTwoId) || await findConversation(memberTwoId, memberOneId);
    console.log(memberOneId, memberTwoId)

    if (!conversation) {
        console.log("Creating a new conversation...");
        conversation = await createNewConversation(memberOneId, memberTwoId);
        console.log("New conversation created:", conversation);
    }

    console.log(conversation)

    if (conversation && conversation._id) {
        console.log("Aggregating conversation details...");
        conversation = await ConversationModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId((conversation._id).toString()) } },
            {
                $lookup: {
                    from: 'members',
                    localField: 'memberOne',
                    foreignField: '_id',
                    as: 'memberOne',
                },
            },
            {
                $lookup: {
                    from: 'members',
                    localField: 'memberTwo',
                    foreignField: '_id',
                    as: 'memberTwo',
                },
            },
            {
                $unwind: '$memberOne',
            },
            {
                $unwind: '$memberTwo',
            },
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'memberOne.profileId',
                    foreignField: '_id',
                    as: 'memberOne.profile',
                },
            },
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'memberTwo.profileId',
                    foreignField: '_id',
                    as: 'memberTwo.profile',
                },
            },
            {
                $group: {
                    _id: '$_id',
                    memberOne: { $first: '$memberOne' },
                    memberTwo: { $first: '$memberTwo' },
                    directMessages: { $first: '$directMessages' },
                },
            },
        ]);

        console.log("Aggregated conversation:", conversation);
        return conversation[0];
    }

    // Если разговор не существует или у него нет id, что-то нужно вернуть, возможно, даже null
    console.log("Returning conversation:", conversation);
    return conversation[0];
};

const findConversation = async (memberOneId: string, memberTwoId: string) => {
    if(memberOneId !== memberTwoId) {
        try {
            const conversation = await ConversationModel.findOne({});

            if (!conversation) {
                return null;
            }

            return conversation;
        } catch (error: any) {
            console.error('Error finding conversation:', error.message);
            return null;
        }
    }else{
        return "You cant create conversation with yourself";
    }
};

const createNewConversation = async (memberOneId:string, memberTwoId:string) => {
    try {
        const conversation = await new ConversationModel({
            memberOne: new mongoose.Types.ObjectId(memberOneId),
            memberTwo: new mongoose.Types.ObjectId(memberTwoId)
        })

        const savedConversation = await conversation.save();

        const memberOne = await MemberModel.findById(memberOneId);
        const memberTwo = await MemberModel.findById(memberTwoId);

        memberOne.conversationInitial.push(savedConversation.id);
        memberTwo.conversationReceived.push(savedConversation.id);

        await memberOne.save();
        await memberTwo.save();

        return savedConversation;
    } catch (error){
        return null;
    }
};
