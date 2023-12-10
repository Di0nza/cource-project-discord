import React from 'react';
import {initialProfile} from "@/lib/initial-profile";
import {redirect} from "next/navigation"
import { UserButton } from "@clerk/nextjs";
import {InitialModal} from "@/components/modals/initial-modal";

const ServerModel = require("@/schemas/server");
const MemberModel = require("@/schemas/member");

const SetupPage = async () => {

    const profile = await initialProfile();

    console.log(profile.id)

    const member = await MemberModel.findOne({profileId: profile.id})

    if(member){
        const server = await ServerModel.findOne({
            members: member._id
        });

        console.log(server)


        if(server){
            return redirect(`/servers/${server.id}`)
        }
    }

    return (
        <div>
            <InitialModal/>
        </div>
    );
};

export default SetupPage;