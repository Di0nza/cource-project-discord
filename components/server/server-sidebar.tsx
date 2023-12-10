import React from 'react';
import {currentProfile} from "@/lib/currentProfile";
import {connect} from "@/lib/db"
import {redirectToSignIn} from "@clerk/nextjs";
import {redirect} from "next/navigation";
import {ServerHeader} from "@/components/server/server-header";
import {ServerSearch} from "@/components/server/server-search";
import {ServerSection} from "@/components/server/server-section";
import {ServerChannel} from "@/components/server/server-channel";
import {ServerMember} from "@/components/server/server-member";
import mongoose from '@/schemas/mongoose';
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";

import {Hash, Mic, ShieldAlert, ShieldCheck, Video} from "lucide-react";

const ServerModel = require("@/schemas/server");


interface ServerSidebarProps {
    serverId: string;
}

enum ChannelType { TEXT = "TEXT", AUDIO = "AUDIO",  VIDEO = "VIDEO"};


const iconMap = {
    ["TEXT"]: <Hash className="mr-2 h-4 w-4"/>,
    ["AUDIO"]: <Mic className="mr-2 h-4 w-4"/>,
    ["VIDEO"]: <Video className="mr-2 h-4 w-4"/>
};

const roleIconMap = {
    ["GUEST"]: null,
    ["MODERATOR"]: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500"/>,
    ["ADMIN"]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500"/>
}

connect();
export const ServerSidebar = async ({serverId}: ServerSidebarProps) => {

    const profile = await currentProfile();

    if (!profile) {
        return redirectToSignIn();
    }

    const server = await ServerModel.aggregate([
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

    console.log(server[0])

    // @ts-ignore
    const textChannels = server[0].channels.filter((channel) => channel.type === "TEXT")
    // @ts-ignore
    const audioChannels = server[0].channels.filter((channel) => channel.type === "AUDIO")
    // @ts-ignore
    const videoChannels = server[0].channels.filter((channel) => channel.type === "VIDEO")

    const members = server[0].members

    console.log(textChannels, audioChannels, videoChannels);

    if (!server) {
        return redirect("/");
    }

    //console.log(server[0].members)
    // @ts-ignore
    const role = server[0].members.find((member) => (member.profileId).toString() === profile.id)?.role;
    //console.log('Role:', role);


    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <ServerHeader
                server={server[0]}
                role={role}
            />
            <ScrollArea className="flex-1 px-3">
                <div className="mt-2">
                    <ServerSearch
                        data={[
                            {
                                label: "Text Channels",
                                type: "channel",
                                data: textChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },
                            {
                                label: "Voice Channels",
                                type: "channel",
                                data: audioChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },
                            {
                                label: "Video Channels",
                                type: "channel",
                                data: videoChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },
                            {
                                label: "Members",
                                type: "member",
                                data: server[0].members.map((member) => {
                                    const profile = member.profile.find(
                                        (profile) => profile._id.toString() === member.profileId.toString()
                                    );

                                    return {
                                        id: member._id,
                                        name: profile ? profile.name : null,
                                        icon: roleIconMap[member.role],
                                    };
                                }),
                            },
                        ]}
                    />
                </div>
                <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
                {!!textChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.TEXT}
                            role={role}
                            label="Text Channels"
                        />
                        <div className="space-y-[2px]">
                            {textChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    role={role}
                                    server={server[0]}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!audioChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.AUDIO}
                            role={role}
                            label="Voice Channels"
                        />
                        <div className="space-y-[2px]">
                            {audioChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    role={role}
                                    server={server[0]}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!videoChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType={ChannelType.VIDEO}
                            role={role}
                            label="Video Channels"
                        />
                        <div className="space-y-[2px]">
                            {videoChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    channel={channel}
                                    role={role}
                                    server={server[0]}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!members?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="members"
                            role={role}
                            label="Members"
                            server={server[0]}
                        />
                        <div className="space-y-[2px]">
                            {members.map((member) => (
                                <ServerMember
                                    key={member.id}
                                    member={member}
                                    server={server[0]}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};
