import {redirectToSignIn} from "@clerk/nextjs";
import {redirect} from "next/navigation";

import {connect} from "@/lib/db";
import {currentProfile} from "@/lib/currentProfile";


const ServerModel = require("@/schemas/server");
const MemberModel = require("@/schemas/member");

interface InviteCodePageProps {
    params: {
        inviteCode: string;
    };
};

const InviteCodePage = async ({
                                  params
                              }: InviteCodePageProps) => {

    connect();

    const profile = await currentProfile();

    if (!profile) {
        return redirectToSignIn();
    }

    if (!params.inviteCode) {
        return redirect("/");
    }

    const server = await ServerModel.findOne({inviteCode: params.inviteCode})

    const member = await MemberModel.findOne({profileId: profile.id, serverId: server._id})

    if (member) {
        const existingServer = await ServerModel.findOne({
            members: member._id
        });

        if (existingServer) {
            return redirect(`/servers/${existingServer.id}`);
        }

    }



    const newMember = await new MemberModel({
        profileId: profile._id,
        serverId: server.id
    }).save();


    server.members.push(newMember.id)
    await server.save();

    if (server) {
        return redirect(`/servers/${server._id}`);
    }

    return null;
}

export default InviteCodePage;