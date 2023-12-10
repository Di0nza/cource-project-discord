import React from 'react';
import {currentProfile} from "@/lib/currentProfile";
import {redirect} from "next/navigation";
import {connect} from "@/lib/db"
import {redirectToSignIn} from "@clerk/nextjs";
import {ServerSidebar} from "@/components/server/server-sidebar";

const ServerModel = require("@/schemas/server");
const MemberModel = require("@/schemas/member");


const ServerIdLayout = async ({children, params}: { children: React.ReactNode, params: { serverId: string } }) => {

    connect();

    const profile = await currentProfile();

    if (!profile) {
        return redirectToSignIn();
    }

    const members = await MemberModel.find({profileId: profile.id})

    // @ts-ignore
    const membersId = members.map(member => member._id);

    const server = await ServerModel.findOne({
        _id: params.serverId,
        members: {$in: membersId}
    });

    if (!server) {
        return redirect("/");
    }


    return (
        <div className="h-full">
            <div
                className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSidebar serverId={params.serverId}/>
            </div>
            <main className="h-full md:pl-60">
                {children}
            </main>
        </div>
    );
};

export default ServerIdLayout;