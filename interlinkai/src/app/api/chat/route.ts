import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { GoogleGenerativeAI } from "@google/generative-ai";


// -------  Setup  ------------------------------------
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const DEFAULT_MODEL = 'gemini-1.5-flash-latest'; 


// ---- Request handlers  ------------------------------------
export async function POST(request: Request) {
//    console.log('Aapi request reived for /api/chat');
    try {
        // Getting the data from incoming/client request (should get here the "prompt" (usermessage") and the chatId)
        const { prompt, chatId } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 }); // 400 ie bad request (part of invalid request umbrella double check)
        }
        if (!chatId) {
             return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
        }

        // Check chat session exist. 
        const Chatsession = await prisma.chatSession.findUnique({ 
            where: { id: chatId }, // checking the chatid we getting matched a unique id in the db
            select: { modelName: true } // needed for the request sending   
        });
        if (!Chatsession) {
            console.error(`API: Chat session not found for ID: ${chatId}`);
            return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
        }

        // saving user  msg to db 
        await prisma.chatMessage.create({
            data: {
                chatSessionId: chatId,
                sender: 'user',
                text: prompt,
            },
        });
        console.log(`API: Saved user message for chat ${chatId}`);

        // Here  add here fetching options / setting etc for models put down in priority atm though.
        // Well maybe structure it some better way when start add models

        // Request to the AI with the user massage (prompt)
        const modelName = Chatsession.modelName || DEFAULT_MODEL;
            console.log(`model: ${modelName} , chat ${chatId}`);
        const model = genAI.getGenerativeModel({ model: modelName }); 
        const result = await model.generateContent(prompt); 
        const aiResponseText = result.response.text();

        // Saving AI response to the database
        const savedAiMessage = await prisma.chatMessage.create({
            data: {
                chatSessionId: chatId,
                sender: 'ai',
                text: aiResponseText,
            },
            select: {
                id: true,
                sender: true,
                text: true,
                isError: true,
                createdAt: true,
            }
        });
        console.log(`API: Saved AI response for chat ${chatId}`);
        console.log(`API: Sending saved AI message object for chat ${chatId}`);

        // returning the response to the client - "resolving the promise"
        return NextResponse.json(savedAiMessage); // 

    } 
    
    
    catch (error) {
        console.error('API: Error processing chat message:', error);
        let message = 'Failed to process chat message';
        let status = 500;
        if (error instanceof Error) {
            message = error.message;
        }
        return NextResponse.json(
            { error: message }, 
            { status: status }
        );
    }
}


