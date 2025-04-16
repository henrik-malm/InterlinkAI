
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
const DEFAULT_MODEL = 'gemini-1.5-flash-latest';

export async function POST() {
    console.log('API: Received request to create new chat session.');
    try {
        const newSession = await prisma.chatSession.create({
            data: {
                modelName: DEFAULT_MODEL,
            },
            select: {
                id: true, 
            }
        });
        console.log(`API: Created new chat session with ID: ${newSession.id}`);
        return NextResponse.json({ chatId: newSession.id });
    } catch (error) {
        console.error('API: Error creating new chat session:', error);
        const message = error instanceof Error ? error.message : 'Failed to create chat session';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

// END COMMENT OF FILE 
