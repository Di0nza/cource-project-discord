import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ChannelType } from "@prisma/client";

import { currentProfile } from "@/lib/currentProfile";
import { ChatHeader } from "@/components/chat/chat-header";
// import { ChatInput } from "@/components/chat/chat-input";
// import { ChatMessages } from "@/components/chat/chat-messages";
// import { MediaRoom } from "@/components/media-room";

import { connect } from "@/lib/db";
import mongoose from "@/schemas/mongoose";

const ServerModel = require("@/schemas/server");
const ChannelModel = require("@/schemas/channel");
const MemberModel = require("@/schemas/member");


connect();

interface ChannelIdPageProps {
    params: {
        serverId: string;
        channelId: string;
    }
}

const ChannelIdPage = async ({
                                 params
                             }: ChannelIdPageProps) => {
    const profile = await currentProfile();

    if (!profile) {
        return redirectToSignIn();
    }

    const channel = await ChannelModel.findById(params.channelId);

    const member = await MemberModel.findOne({serverId: params.serverId, profileId: profile.id});


    if (!channel || !member) {
        redirect("/");
    }

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                name={channel.name}
                serverId={channel.serverId}
                type="channel"
            />
            {/*{channel.type === ChannelType.TEXT && (*/}
            {/*    <>*/}
            {/*        <ChatMessages*/}
            {/*            member={member}*/}
            {/*            name={channel.name}*/}
            {/*            chatId={channel.id}*/}
            {/*            type="channel"*/}
            {/*            apiUrl="/api/messages"*/}
            {/*            socketUrl="/api/socket/messages"*/}
            {/*            socketQuery={{*/}
            {/*                channelId: channel.id,*/}
            {/*                serverId: channel.serverId,*/}
            {/*            }}*/}
            {/*            paramKey="channelId"*/}
            {/*            paramValue={channel.id}*/}
            {/*        />*/}
            {/*        <ChatInput*/}
            {/*            name={channel.name}*/}
            {/*            type="channel"*/}
            {/*            apiUrl="/api/socket/messages"*/}
            {/*            query={{*/}
            {/*                channelId: channel.id,*/}
            {/*                serverId: channel.serverId,*/}
            {/*            }}*/}
            {/*        />*/}
            {/*    </>*/}
            {/*)}*/}
            {/*{channel.type === ChannelType.AUDIO && (*/}
            {/*    <MediaRoom*/}
            {/*        chatId={channel.id}*/}
            {/*        video={false}*/}
            {/*        audio={true}*/}
            {/*    />*/}
            {/*)}*/}
            {/*{channel.type === ChannelType.VIDEO && (*/}
            {/*    <MediaRoom*/}
            {/*        chatId={channel.id}*/}
            {/*        video={true}*/}
            {/*        audio={true}*/}
            {/*    />*/}
            {/*)}*/}
        </div>
    );
}

export default ChannelIdPage;