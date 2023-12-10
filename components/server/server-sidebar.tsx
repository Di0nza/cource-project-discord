import React from 'react';
import {currentProfile} from "@/lib/currentProfile";
import {connect} from "@/lib/db"
import {redirectToSignIn} from "@clerk/nextjs";
import {redirect} from "next/navigation";
import {ServerHeader} from "@/components/server/server-header";
import mongoose from '@/schemas/mongoose';

const ServerModel = require("@/schemas/server");
const MemberModel = require("@/schemas/member");
const ChannelModel = require("@/schemas/channel");
const ProfileModel = require("@/schemas/profile");


interface ServerSidebarProps {
    serverId: string;
}

export const ServerSidebar = async ({serverId}: ServerSidebarProps) => {

connect();

    const profile = await currentProfile();

    if (!profile) {
        return redirectToSignIn();
    }

    const membershipByProfile = await MemberModel.find({profileId: profile.id})

    // @ts-ignore
    const membersId = membershipByProfile.map(member => member._id);

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
                members: { $push: "$members" },
                channels: { $push: "$channels" }
            }
        },
        // Другие этапы агрегации, если необходимо
    ]);

    // @ts-ignore
    const textChannels = server[0].channels.filter((channel) => channel.type === "TEXT")
    // @ts-ignore
    const audioChannels = server[0].channels.filter((channel) => channel.type === "AUDIO")
    // @ts-ignore
    const videoChannels = server[0].channels.filter((channel) => channel.type === "VIDEO")

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
        </div>
    );
};
