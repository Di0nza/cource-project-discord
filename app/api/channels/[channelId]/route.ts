import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/currentProfile";
import { connect } from "@/lib/db";
import mongoose from "@/schemas/mongoose";

const ServerModel = require("@/schemas/server");
const ChannelModel = require("@/schemas/channel");

connect();

export async function DELETE(
    req: Request,
    { params }: { params: { channelId: string } }
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        if (!params.channelId) {
            return new NextResponse("Channel ID missing", { status: 400 });
        }

        const deletedChannel = await ChannelModel.findByIdAndDelete(params.channelId);


        const server = await ServerModel.findById(serverId)
        console.log(server.channels)

        console.log(server.channels[2].toString() , " ", params.channelId)

        server.channels = server.channels.filter((channel)=> channel.toString() !== params.channelId);

        await server.save();

        // @ts-ignore
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
                $unwind: '$members'
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
                $unwind: '$channels'
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
                    _id: '$_id',
                    name: { $first: '$name' },
                    imageUrl: { $first: '$imageUrl' },
                    inviteCode: { $first: '$inviteCode' },
                    profileId: { $first: '$profileId' },
                    serverId: { $first: '$serverId' },
                    members: { $addToSet: '$members' },
                    channels: { $addToSet: '$channels' } // используйте $addToSet вместо $push
                }
            },
        ]);


        return NextResponse.json(fullServer[0])
    } catch (error) {
        console.log("[CHANNEL_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { channelId: string } }
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

        if (!params.channelId) {
            return new NextResponse("Channel ID missing", { status: 400 });
        }

        if (name === "general") {
            return new NextResponse("Name cannot be 'general'", { status: 400 });
        }

        const channel = await ChannelModel.findById(params.channelId);

        if(type) channel.type = type;

        if(name) channel.name = name;

        await channel.save();

        // @ts-ignore
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
                $unwind: '$members'
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
                $unwind: '$channels'
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
                    _id: '$_id',
                    name: { $first: '$name' },
                    imageUrl: { $first: '$imageUrl' },
                    inviteCode: { $first: '$inviteCode' },
                    profileId: { $first: '$profileId' },
                    serverId: { $first: '$serverId' },
                    members: { $addToSet: '$members' },
                    channels: { $addToSet: '$channels' } // используйте $addToSet вместо $push
                }
            },
        ]);


        return NextResponse.json(fullServer[0])
    } catch (error) {
        console.log("[CHANNEL_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}