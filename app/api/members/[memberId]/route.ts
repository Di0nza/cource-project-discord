import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/currentProfile";
import { fullServer } from "@/lib/fullServer";
import { connect } from "@/lib/db";
import mongoose from "@/schemas/mongoose";


const MemberModel = require("@/schemas/member")
const ServerModel = require("@/schemas/server")


export async function DELETE(
    req: Request,
    { params }: { params: { memberId: string } }
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized" ,{ status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        if (!params.memberId) {
            return new NextResponse("Member ID missing", { status: 400 });
        }

        const member = await MemberModel.findByIdAndDelete(params.memberId);


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
        console.log("[MEMBER_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { memberId: string } }
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const { role } = await req.json();

        const serverId = searchParams.get("serverId");


        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        if (!params.memberId) {
            return new NextResponse("Member ID missing", { status: 400 });
        }

        const member = await MemberModel.findById(params.memberId);
        member.role = role;
        await member.save();

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
        console.log("[MEMBERS_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}