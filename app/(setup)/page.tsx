import React from 'react';
import {initialProfile} from "@/lib/initial-profile";
import Server from "@/shemas/server";
import {redirect} from "next/navigation"

const SetupPage = async () => {

    const profile = await initialProfile();

    const server = await Server.findOne({
        members: {
            $elemMatch: {profileId: profile.id}
        }
    });

    if(server){
        return redirect(`/servers/${server.id}`)
    }

    return (
        <div>
            Create a Server
        </div>
    );
};

export default SetupPage;