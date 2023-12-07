import React from 'react';
import {initialProfile} from "@/lib/initial-profile";
import {redirect} from "next/navigation"
import { UserButton } from "@clerk/nextjs";
import {InitialModal} from "@/components/modals/initial-modal";

const Server = require("@/shemas/server");

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
            <InitialModal/>
        </div>
    );
};

export default SetupPage;