import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/currentProfile";
import { connect } from "@/lib/db";
import mongoose from "@/schemas/mongoose";

const ServerModel = require("@/schemas/server");
const MemberModel = require("@/schemas/member")
const ChannelModel = require("@/schemas/channel")

connect();
export async function POST(
    req: Request
) {
    try {
        const profile = await currentProfile();
        const { name, type } = await req.json();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        if (name === "general") {
            return new NextResponse("Name cannot be 'general'", { status: 400 });
        }

        const channel = await new ChannelModel({
            name,
            type,
            profileId: profile.id,
            serverId,
        })

        const member = await MemberModel.findOne({profileId:profile.id});

        console.log(member.role)

        if(member.role !== "ADMIN" && member.role !== "MODERATOR"){
            return NextResponse.json("Access Denied", { status: 403 });
        }

        await channel.save();

        const fullServer = await ServerModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(serverId) } },
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
            },
        ]);

        return NextResponse.json(fullServer[0])
    } catch (error) {
        console.log("CHANNELS_POST", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}