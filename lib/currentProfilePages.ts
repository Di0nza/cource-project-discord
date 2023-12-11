import { getAuth } from "@clerk/nextjs/server"

import {connect} from "@/lib/db"
import {NextApiRequest} from "next";

connect();

const ProfileModel = require("@/schemas/profile")

export const currentProfilePages = async (req: NextApiRequest) => {
    const {userId} = getAuth(req);

    if(!userId) {
        return null;
    }

    const profile = await ProfileModel.findOne({userId: userId});

    return profile;
}