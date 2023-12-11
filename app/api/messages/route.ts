import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/currentProfile";
import mongoose from "@/schemas/mongoose";
import MessageModel from "@/schemas/message";

const MESSAGES_BATCH = 10;

export async function GET(req:Request) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get("cursor");
        const channelId = searchParams.get("channelId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!channelId) {
            return new NextResponse("Channel ID missing", { status: 400 });
        }

        let messages = [];

        const query = { channelId };

        if (cursor) {
            query._id = { $lt: mongoose.Types.ObjectId(cursor) };
        }

        messages = await MessageModel.find(query)
            .sort({ createdAt: -1 })
            .limit(MESSAGES_BATCH)

        const populatedMessages = await Promise.all(
            messages.map(async (message) => {
                const populatedMessage = await MessageModel.aggregate([
                    {
                        $match: { _id: message._id },
                    },
                    {
                        $lookup: {
                            from: 'members',
                            localField: 'memberId',
                            foreignField: '_id',
                            as: 'member',
                        },
                    },
                    {
                        $unwind: '$member',
                    },
                    {
                        $lookup: {
                            from: 'profiles',
                            localField: 'member.profileId',
                            foreignField: '_id',
                            as: 'member.profile',
                        },
                    },
                    {
                        $addFields: {
                            member: {
                                $mergeObjects: [
                                    '$member',
                                    { profile: { $arrayElemAt: ['$member.profile', 0] } },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            content: 1,
                            fileUrl: 1,
                            member: 1,
                            channelIdchannelId: 1,
                            deleted: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                ]);

                return populatedMessage[0];
            })
        );


        let nextCursor = null;

        if (messages.length === MESSAGES_BATCH) {
            nextCursor = populatedMessages[MESSAGES_BATCH - 1]._id.toString();
        }

        return NextResponse.json({
            items: populatedMessages,
            nextCursor,
        });
    } catch (error) {
        console.log("[MESSAGES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
