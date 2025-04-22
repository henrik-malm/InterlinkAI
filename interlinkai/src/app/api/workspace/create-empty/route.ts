import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEFAULT_MODEL = 'gemini-1.5-flash-latest'; // Keep consistency

// POST handler to create an empty chat session
export async function POST(request: Request) {
    console.log('API (/api/workspace/create-empty): Received request.');
    let newSessionId: string | null = null;
    let firstMessage: string | null = null;

    try {
        // Try to parse body, but don't fail if it's empty (for button clicks)
        try {
            const body = await request.json();
            firstMessage = body?.firstMessage?.trim() || null;
        } catch (e) {
            // Ignore error if body is empty or not JSON - means it was likely button click
            console.log('API (/api/workspace/create-empty): No message body found, proceeding with empty session.');
        }

        // 1. Create the session 
        const newSession = await prisma.chatSession.create({
            data: {
                modelName: DEFAULT_MODEL,
            },
            select: { id: true }
        });

        if (!newSession?.id) {
            throw new Error("Prisma failed to create chat session or return an ID.");
        }
        newSessionId = newSession.id;
        console.log(`API (/api/workspace/create-empty): Created session ID: ${newSessionId}`);

        // 2. OPTIONALLY update title if firstMessage was provided
        if (newSessionId && firstMessage) {
            const defaultTitle = firstMessage.substring(0, 30);
            try {
                await prisma.chatSession.update({
                    where: { id: newSessionId },
                    data: { title: defaultTitle },
                });
                console.log(`API (/api/workspace/create-empty): Set default title for session ${newSessionId}`);
            } catch (updateError) {
                console.error(`API (/api/workspace/create-empty): Failed to set default title for ${newSessionId}:`, updateError);
                // Continue without failing the whole request if title update fails
            }
        }

        // 3. Return the ID
        return NextResponse.json({ chatId: newSessionId }, { status: 201 });

    } catch (error) {
        console.error("API (/api/workspace/create-empty): Error creating session:", error);
        const message = error instanceof Error ? error.message : "Unknown server error";
        return NextResponse.json({ error: `Failed to create session: ${message}` }, { status: 500 });
    }
} 