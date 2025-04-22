import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    console.log("API (/api/workspace/sessions): Received GET request.");
    try {
        // TODO: Add authentication check here to fetch sessions only for the logged-in user

        const sessions = await prisma.chatSession.findMany({
            // where: { userId: loggedInUserId }, // Add filtering by user when auth is implemented
            orderBy: {
                updatedAt: 'desc', // Show most recently active chats first
            },
            select: {
                id: true,
                updatedAt: true,
                title: true, // Select the new title field
                // Include the first message ONLY if title is null/empty (fallback)
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 1,
                    select: { text: true } // Only need the text of the first message
                }
            }
        });

        console.log(`API (/api/workspace/sessions): Found ${sessions.length} sessions.`);

        // Format data: Use stored title if available, otherwise generate from first message
        const formattedSessions = sessions.map(session => ({
            id: session.id,
            updatedAt: session.updatedAt,
            // Use user-set title if it exists and isn't empty, otherwise use first message fallback
            title: session.title?.trim() ? session.title.trim() 
                   : session.messages[0]?.text?.substring(0, 40).trim() || 'New Chat' 
        }));

        return NextResponse.json(formattedSessions); // Return formatted sessions

    } catch (error) {
        console.error("API (/api/workspace/sessions): Error fetching sessions:", error);
        const message = error instanceof Error ? error.message : "Unknown server error";
        return NextResponse.json({ error: `Failed to fetch chat sessions: ${message}` }, { status: 500 });
    }
} 