import { NextApiRequest } from "next";
import { connect } from "@/lib/db";

import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/currentProfilePages";
const MemberModel = require("@/schemas/member")
const ServerModel = require("@/schemas/server")
const ChannelModel = require("@/schemas/channel")
const MessageModel = require("@/schemas/message")

connect();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo,
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const profile = await currentProfilePages(req);
        const { content, fileUrl } = req.body;
        const { serverId, channelId } = req.query;

        if (!profile) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!serverId) {
            return res.status(400).json({ error: "Server ID missing" });
        }

        if (!channelId) {
            return res.status(400).json({ error: "Channel ID missing" });
        }

        if (!content) {
            return res.status(400).json({ error: "Content missing" });
        }

        const server = await ServerModel.findById(serverId);

        const members = await MemberModel.find({serverId:serverId, profileId:profile.id})

        if (!server) {
            return res.status(404).json({ message: "Server not found" });
        }

        const channel = await ChannelModel.findOne({_id:channelId, serverId:serverId})

        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }

        console.log(members, profile.id)

        const member = members.find((member) => (member.profileId).toString() === profile.id);

        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        const message = await new MessageModel({
            content,
            fileUrl,
            memberId:member.id,
            channelId:channelId,
        }).save();

        const membersMessage = await MemberModel.findById(member.id);
        membersMessage.messages.push(message.id);
        await membersMessage.save();

        const channelMessage = await ChannelModel.findById(channelId);
        channelMessage.messages.push(message.id);
        await channelMessage.save();



        const populatedMessage = await MessageModel.aggregate([
            {
                $match: { _id: message._id }
            },
            {
                $lookup: {
                    from: 'members',
                    localField: 'memberId',
                    foreignField: '_id',
                    as: 'member',
                },
            },
            {
                $unwind: '$member',
            },
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'member.profileId',
                    foreignField: '_id',
                    as: 'member.profile',
                },
            },
            {
                $addFields: {
                    member: {
                        $mergeObjects: ['$member', { profile: { $arrayElemAt: ['$member.profile', 0] } }]
                    }
                }
            },
            {
                $project: {
                    content: 1,
                    fileUrl: 1,
                    member: 1,
                    channelId: 1,
                    deleted: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);

        const populatedMessageObject = populatedMessage[0];



        const channelKey = `chat:${channelId}:messages`;

        res?.socket?.server?.io?.emit(channelKey, populatedMessageObject);

        console.log(populatedMessageObject)

        return res.status(200).json(populatedMessageObject);
    } catch (error) {
        console.log("[MESSAGES_POST]", error);
        return res.status(500).json({ message: "Internal Error" });
    }
}