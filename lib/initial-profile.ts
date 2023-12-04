import {currentUser, redirectToSignIn} from "@clerk/nextjs";
import {connect} from "@/lib/db"
const ProfileModel = require("@/shemas/profile")

connect();

export const initialProfile = async () =>{
    const user = await currentUser();

    if(!user){
        return redirectToSignIn();
    }

    const profile = await ProfileModel.findOne({userId: user.id})


    if(profile){
        return profile;
    }

    const newProfile = new ProfileModel({
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress
    })

    const savedProfile = await newProfile.save();

    return savedProfile;
}