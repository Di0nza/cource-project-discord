import { auth } from "@clerk/nextjs"

import {connect} from "@/lib/db"

connect();

const ProfileModel = require("@/schemas/profile")

export const currentProfile = async () => {
    const {userId} = auth();

    if(!userId) {
        return null;
    }

    const profile = await ProfileModel.findOne({userId: userId});

    return profile;
}