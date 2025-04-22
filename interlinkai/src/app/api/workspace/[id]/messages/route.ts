import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET handler to fetch messages for a specific chat session
export async function GET(
    _request: Request, // Use underscore if request is not used
    { params }: { params: { id: string } } // Destructure params directly
) {
    const chatId = params.id; // Access id via destructured params
    console.log(`API (/api/workspace/[id]/messages): Received GET request for chatId: ${chatId}`);

    if (!chatId) {
        return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    try {
        const messages = await prisma.chatMessage.findMany({
            where: {
                chatSessionId: chatId,
            },
            orderBy: {
                createdAt: 'asc', // Order messages chronologically
            },
            select: { // Select only the fields needed by the frontend
                id: true,
                sender: true,
                text: true,
                isError: true,
                createdAt: true, // Keep createdAt if needed for display/sorting
            }
        });

        console.log(`API (/api/workspace/[id]/messages): Found ${messages.length} messages for chatId: ${chatId}`);
        return NextResponse.json(messages); // Return the array of messages

    } catch (error) {
        console.error(`API (/api/workspace/[id]/messages): Error fetching messages for chatId ${chatId}:`, error);
        const message = error instanceof Error ? error.message : "Unknown server error";
        return NextResponse.json({ error: `Failed to fetch messages: ${message}` }, { status: 500 });
    }
} 