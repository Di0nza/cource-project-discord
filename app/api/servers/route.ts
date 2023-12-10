import {v4 as uuidv4} from "uuid"
import {currentProfile} from "@/lib/currentProfile"
import {connect} from "@/lib/db"
import {NextResponse} from "next/server";

const ServerModel = require("@/schemas/server");
const MemberModel = require("@/schemas/member")
const ChannelModel = require("@/schemas/channel")
connect()

export async function POST(req: Request) {
    try {
        const {name, imageUrl} = await req.json();
        const profile = await currentProfile();

        console.log(name)
        console.log(profile)

        if (!profile) {
            return new NextResponse("Unauthorized", {status: 401});
        }


        const member = await new MemberModel({
            profileId: profile._id,
            role: "ADMIN"
        }).save();

        const channel = await new ChannelModel({
            name: "general",
            profileId: profile._id
        }).save()

        const server = await new ServerModel({
            profileId: profile.id,
            name: name,
            imageUrl: imageUrl,
            inviteCode: uuidv4(),
            channels: [channel.id],
            members: [member.id],
        }).save();

        console.log(server)

        await MemberModel.findByIdAndUpdate(member.id, {serverId: server.id});
        await ChannelModel.findByIdAndUpdate(channel.id, {serverId: server.id});

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVERS_POST]", error)
        return new NextResponse("Internal Error", {status: 500})
    }
}