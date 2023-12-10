import {NextResponse} from "next/server";
import {v4 as uuidv4} from "uuid"
import {currentProfile} from "@/lib/currentProfile";
import {redirect} from "next/navigation";
import {connect} from "@/lib/db"
import {redirectToSignIn} from "@clerk/nextjs";
import {ServerSidebar} from "@/components/server/server-sidebar";
import mongoose from "@/schemas/mongoose";

const ServerModel = require("@/schemas/server");
const MemberModel = require("@/schemas/member");

export async function PATCH(
    req: Request,
    {params}: { params: { serverId: string } }
) {
    try {

        connect();

        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauthorized", {status: 401});
        }

        if (!params.serverId) {
            return new NextResponse("Server Id Missing", {status: 400});
        }

        console.log(params.serverId)
        const server = await ServerModel.findOneAndUpdate(
            {_id: params.serverId, profileId: profile.id},
            {inviteCode: uuidv4()}
        );

        if (!server) {
            return new NextResponse("No such server", {status: 400});
        }

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


        console.log(fullServer)



        return NextResponse.json(fullServer[0])

    } catch (error) {
        console.log(error)
        return new NextResponse("Internal Error", {status: 500})
    }
}