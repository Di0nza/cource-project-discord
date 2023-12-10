import React from 'react';
import {currentProfile} from "@/lib/currentProfile";
import {redirect} from "next/navigation";
import {connect} from "@/lib/db";
import {Separator} from "@/components/ui/separator";
import {ScrollArea} from "@/components/ui/scroll-area";

import {NavigationItem} from "@/components/navigation/navigation-item"
import {NavigationAction} from "@/components/navigation/navigation-action";
import {ModeToggle} from "@/components/mode-toggle";
import {UserButton} from "@clerk/nextjs";

const ServerModel = require("@/schemas/server");
const MemberModel = require("@/schemas/member");

connect();

export const NavigationSidebar = async () => {

    const profile = await currentProfile();

    if (!profile) {
        return redirect("/")
    }

    const members = await MemberModel.find({profileId: profile.id})

    // @ts-ignore
    const membersId = members.map(member => member._id);

    const servers = await ServerModel.find({
        members: {$in: membersId}
    });

    return (
        <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] py-3">
            <NavigationAction/>
            <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto"/>
            <ScrollArea className="flex-1 w-full">
                {servers.map((server:any) => (
                    <div key={server.id} className="mb-4">
                        <NavigationItem
                            id={server.id}
                            name={server.name}
                            imageUrl={server.imageUrl}
                        />
                    </div>
                ))}
            </ScrollArea>
            <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                <ModeToggle/>
                <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: "h-[42px] w-[42px]"
                        }
                    }} />
            </div>
        </div>
    );
};
