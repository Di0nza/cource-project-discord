import React from 'react';
import {currentProfile} from "@/lib/currentProfile";
import {redirect} from "next/navigation";
import {connect} from "@/lib/db";

const ServerModel = require("@/schemas/server");
const MemberModel = require("@/schemas/member")

connect();

export const NavigationSidebar = async () => {

    const profile = await currentProfile();

    if(!profile){
        return redirect("/")
    }

    const member = await MemberModel.findOne({profileId: profile.id})

    const server = await ServerModel.findOne({
        members: member._id
    });

    return (
        <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] py-3">
            NavigationSidebar
        </div>
    );
};
