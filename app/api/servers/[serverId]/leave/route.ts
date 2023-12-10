import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/currentProfile";
import { connect } from "@/lib/db";
import mongoose from "@/schemas/mongoose";


const MemberModel = require("@/schemas/member")
const ServerModel = require("@/schemas/server")

connect();
export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        const deletedMember = await MemberModel.findOneAndDelete({
            profileId:profile.id,
            serverId: params.serverId,
        });

        const server = await ServerModel.findById(params.serverId);

        server.members = server.members.filter((member) => member.toString() !== deletedMember.id);

        await server.save()

        const fullServer = await ServerModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(params.serverId) } },
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
                    profileId: {$first:"$profileId"},
                    members: { $push: "$members" },
                    channels: { $push: "$channels" }
                }
            }
        ]);

        return NextResponse.json(fullServer[0])

    } catch (error) {
        console.log("[SERVER_ID_LEAVE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}