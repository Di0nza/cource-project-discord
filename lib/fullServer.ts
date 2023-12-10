import {connect} from "@/lib/db"
import mongoose from '@/schemas/mongoose';

const ServerModel = require("@/schemas/server")

connect();

export const fullServer = async (id:string) => {

    const server = await ServerModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
            $lookup: {
                from: 'members',
                localField: 'members',
                foreignField: '_id',
                as: 'members'
            }
        },
        {
            $unwind: "$members"
        },
        {
            $lookup: {
                from: 'profiles',
                localField: 'members.profileId',
                foreignField: '_id',
                as: 'members.profile'
            }
        },
        {
            $lookup: {
                from: 'channels',
                localField: 'channels',
                foreignField: '_id',
                as: 'channels'
            }
        },
        {
            $unwind: "$channels"
        },
        {
            $lookup: {
                from: 'profiles',
                localField: 'channels.profileId',
                foreignField: '_id',
                as: 'channels.profile'
            }
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                imageUrl: { $first: "$imageUrl" },
                inviteCode: { $first: "$inviteCode" },
                members: { $push: "$members" },
                channels: { $push: "$channels" }
            }
        },
        // Другие этапы агрегации, если необходимо
    ]);

    return server[0];
}