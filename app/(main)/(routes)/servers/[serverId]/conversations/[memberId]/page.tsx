import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/currentProfile";
import { ChatHeader } from "@/components/chat/chat-header";


import { connect } from "@/lib/db";
import mongoose from "@/schemas/mongoose";

const ServerModel = require("@/schemas/server");
const ChannelModel = require("@/schemas/channel");
const MemberModel = require("@/schemas/member");
const ProfileModel = require("@/schemas/profile");

connect();

interface MemberIdPageProps {
    params: {
        memberId: string;
        serverId: string;
    },
    searchParams: {
        video?: boolean;
    }
}

const MemberIdPage = async ({
                                params,
                                searchParams,
                            }: MemberIdPageProps) => {
    const profile = await currentProfile();

    if (!profile) {
        return redirectToSignIn();
    }

    const currentMember = await MemberModel.findOne({serverId: params.serverId, profileId: profile.id});
    const currentMemberProfile = await ProfileModel.findById(profile.id);

    if (!currentMember) {
        return redirect("/");
    }

    console.log("members", currentMember, params.memberId);

    const conversation = await getOrCreateConversation((currentMember._id).toString(), params.memberId);

    console.log(conversation);

    if (!conversation) {
        return redirect(`/servers/${params.serverId}`);
    }

    const memberOne = conversation.memberOne;
    const memberTwo = conversation.memberTwo;

    const otherMember = (memberOne.profileId).toString() === profile.id ? memberTwo : memberOne;

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                imageUrl={otherMember.profile[0].imageUrl}
                name={otherMember.profile[0].name}
                serverId={params.serverId}
                type="conversation"
            />
        </div>
    );
}

export default MemberIdPage;