import {NextResponse} from "next/server";
import {currentProfile} from "@/lib/currentProfile";
import {redirect} from "next/navigation";
import {connect} from "@/lib/db"
import mongoose from "@/schemas/mongoose";
import {v4 as uuidv4} from "uuid";

const ServerModel = require("@/schemas/server");
const MemberModel = require("@/schemas/member");
const ChannelModel = require("@/schemas/channel")

export async function PATCH(
    req:Request,
    {params}:{params:{serverId:string}}
){
    try{
        connect();

        const profile = await currentProfile();
        const {name, imageUrl} = await req.json();

        if (!profile) {
            return new NextResponse("Unauthorized", {status: 401});
        }

        if (!params.serverId) {
            return new NextResponse("Server Id Missing", {status: 400});
        }

        console.log(params.serverId)
        const server = await ServerModel.findOneAndUpdate(
            {_id: params.serverId, profileId: profile.id},
            {name: name, imageUrl: imageUrl}
        );

        if (!server) {
            return new NextResponse("No such server", {status: 400});
        }

        const fullServer = await ServerModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(server._id) } },
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

        console.log(fullServer)



        return NextResponse.json(fullServer[0])

    }catch (error){
        console.log("[SERVER_ID_PATCH]", error);
        return new NextResponse("Internal Error", {status:500})
    }
}


export async function DELETE(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const server = await ServerModel.findById(params.serverId);

        if(server){

            await MemberModel.deleteMany({serverId: params.serverId});

            await ChannelModel.deleteMany({serverId: params.serverId});

            await server.deleteOne();
        }


        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}