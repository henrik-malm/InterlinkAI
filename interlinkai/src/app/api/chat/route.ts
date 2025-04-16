import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { GoogleGenerativeAI } from "@google/generative-ai";

// Check for the key - movign up to global , move a new struc when adding all models. 
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const DEFAULT_MODEL = 'gemini-1.5-flash-latest'; // for next step struct just as a placeholder for me


// POST to Gememini / gonan be extended with the otehr models. 
export async function POST(request: Request) {
    console.log('API: Received request to /api/chat');
    try {
        const { prompt, chatId } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }
        if (!chatId) {
             return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
        }

        // Check chat session exist. 
        const session = await prisma.chatSession.findUnique({ 
            where: { id: chatId },
            select: { modelName: true } // Select only the modelName
        });
        if (!session) {
            console.error(`API: Chat session not found for ID: ${chatId}`);
            return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
        }

        // Saving user msg to
        await prisma.chatMessage.create({
            data: {
                chatSessionId: chatId,
                sender: 'user',
                text: prompt,
            },
        });
        console.log(`API: Saved user message for chat ${chatId}`);

        // Gonan add here fetching options / setting etc for models put down in priority atm though

        // AI call model
        const modelName = session.modelName || DEFAULT_MODEL;
        console.log(`API: Using model ${modelName} for chat ${chatId}`);
        const model = genAI.getGenerativeModel({ model: modelName }); 
        const result = await model.generateContent(prompt); 
        const aiResponseText = result.response.text();

        // Reponse db save
        await prisma.chatMessage.create({
            data: {
                chatSessionId: chatId,
                sender: 'ai',
                text: aiResponseText,
            },
        });
        console.log(`API: Saved AI response for chat ${chatId}`);

        console.log(`API: Sending AI reply for chat ${chatId}`);
        return NextResponse.json({ reply: aiResponseText });

    } catch (error) {
        console.error('API: Error processing chat message:', error);
        let message = 'Failed to process chat message';
        let status = 500;
        if (error instanceof Error) {
            message = error.message;
        }
        return NextResponse.json(
            { error: message }, 
            { status: status }
        );//gonna improve this error handling
    }
}

// --- B415 TODO: above noted 