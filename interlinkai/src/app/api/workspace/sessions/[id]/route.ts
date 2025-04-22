import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE handler to remove a specific chat session
export async function DELETE(
    request: Request, // Not typically used for DELETE by ID, but required
    { params }: { params: { id: string } }
) {
    const chatId = params.id;
    console.log(`API (/api/workspace/sessions/[id]): Received DELETE request for chatId: ${chatId}`);

    if (!chatId) {
        return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    try {
        // TODO: Add authentication check here to ensure user owns this session

        // Attempt to delete the session
        // onDelete: Cascade in the schema should automatically delete related ChatMessages
        await prisma.chatSession.delete({
            where: {
                id: chatId,
            },
        });

        console.log(`API (/api/workspace/sessions/[id]): Successfully deleted session ${chatId}`);
        // Return a success response, maybe with the deleted ID or just status
        return NextResponse.json({ message: `Session ${chatId} deleted successfully.` }, { status: 200 });
        // Or return NextResponse.json(null, { status: 204 }); // 204 No Content is also common for DELETE

    } catch (error: any) {
        console.error(`API (/api/workspace/sessions/[id]): Error deleting session ${chatId}:`, error);

        // Handle specific Prisma error for record not found
        if (error.code === 'P2025') { // Prisma error code for Record to delete does not exist.
            return NextResponse.json({ error: `Chat session with ID ${chatId} not found.` }, { status: 404 });
        }

        const message = error instanceof Error ? error.message : "Unknown server error";
        return NextResponse.json({ error: `Failed to delete chat session: ${message}` }, { status: 500 });
    }
}

// PATCH handler to update the chat title
export async function PATCH(
    request: Request, 
    { params }: { params: { id: string } }
) {
    const sessionId = params.id;
    console.log(`API (/api/workspace/sessions/[id]): Received PATCH request for sessionId: ${sessionId}`);

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { title } = body;

        if (typeof title !== 'string' || title.trim().length === 0) {
            return NextResponse.json({ error: 'New title must be a non-empty string.' }, { status: 400 });
        }
        const newTitle = title.trim(); // Trim whitespace

        // TODO: Add authentication check here to ensure user owns this session

        // Update the session title
        const updatedSession = await prisma.chatSession.update({
            where: {
                id: sessionId,
            },
            data: {
                title: newTitle,
            },
            select: { // Return the updated session info (optional)
                id: true,
                title: true,
                updatedAt: true,
            }
        });

        console.log(`API (/api/workspace/sessions/[id]): Successfully updated title for session ${sessionId}`);
        return NextResponse.json(updatedSession, { status: 200 });

    } catch (error: any) {
        console.error(`API (/api/workspace/sessions/[id]): Error updating session ${sessionId}:`, error);
        // Handle specific Prisma error for record not found
        if (error.code === 'P2025') { // Prisma error code for Record to update does not exist.
            return NextResponse.json({ error: `Chat session with ID ${sessionId} not found.` }, { status: 404 });
        }
        const message = error instanceof Error ? error.message : "Unknown server error";
        return NextResponse.json({ error: `Failed to update chat session: ${message}` }, { status: 500 });
    }
} 