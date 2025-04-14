
import { NextResponse, NextRequest } from 'next/server';

const GEMINI_MODEL = 'gemini-1.5-flash-latest'; // 


interface RequestBody {
  prompt: string;
}


export async function POST(request:NextRequest) {
  // problem response check
  console.log('[POST Function Start] GEMINI_API_KEY:', process.env.GEMINI_API_KEY);


  try {
    const body: RequestBody = await request.json();
     // logging the body from the request from the client for debugging pruposes if needed
    console.log('Received request body:', body);
     const userPrompt = body.prompt;

    const apiKey = process.env.GEMINI_API_KEY;

    
    if (!userPrompt) {
      console.error('Error: Missing prompt in request body');
      return NextResponse.json({ error: 'Missing prompt in request' }, { status: 400 });
    }
    if (!apiKey) {
      console.error('Error: Missing GEMINI_API_KEY environment variable');
      return NextResponse.json({ error: 'API key not configured on server' }, { status: 500 });
    }

    // -- 215:18 "Construct the URL for the Gemini API."
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;


  

    // -- 215:18 "Prepare the request payload for the Gemini API."
    const requestPayload = {
      contents: [{
        parts: [{
          text: userPrompt
        }]
      }]
      // Add generationConfig here if needed (temperature, maxOutputTokens, etc.)
      // "generationConfig": {
      //   "temperature": 0.7,
      //   "maxOutputTokens": 1000
      // }
    };

    // -- 215:18 "Log the outgoing request details (excluding the key from the URL log for safety)."
    console.log(`Sending request to Gemini API: ${apiURL.split('?key=')[0]}?key=...`);
    // console.log('Request payload:', JSON.stringify(requestPayload)); // Uncomment to debug payload if needed









    // -- Fetch request to the Gemini API
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });



    // -- 215:18 "Check if the API call was successful."
    if (!response.ok) {
      const errorBody = await response.text(); // Read error body as text
      console.error(`Error from Gemini API: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`); // Throw an error to be caught below
    }



    // -->  const data = await response.json();
    // -- 215:18 "Parse the JSON response from the Gemini API."
    // -- 215:18 "Define a basic type for the expected Gemini response structure (adjust as needed)"
    interface GeminiResponse {
      candidates?: Array<{
          content?: {
              parts?: Array<{
                  text: string;
              }>;
          };
      }>;
  }
  const data: GeminiResponse = await response.json();

    // -- 215:18 "Safely extract the generated text from the response."
    // -- 215:18 "The response structure might vary slightly, so optional chaining is used."
    const aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // -- 215:18 "Handle cases where the response structure is unexpected or text is missing."
    if (!aiResponseText) {
      console.error('Error: Could not extract text from Gemini response', JSON.stringify(data, null, 2));
      throw new Error('Failed to parse AI response');
    }

    // -- 215:18 "Log the successful AI response."
    console.log('Received AI response:', aiResponseText);

    // -- 215:18 "Send the AI's response back to the client."
   // return NextResponse.json({ reply: aiResponseText }) --> 215:18 "Typing the response payload" for clarity
    return NextResponse.json<{ reply: string }>({ reply: aiResponseText });








// catch block - handles any errors that occur in the try block. So here we hadnling it by logging the error to the server console and sending a more informative error message to the client.
// see notation done in seperate files for more details and the question asked in the prompt.

  } catch (error) {
    // -- 215:18 "Handle errors from request parsing, API key issues, or the Gemini API call itself."
    console.error('Error processing POST request:', error);

     // -- 215:18 "Infer error type or default to unknown"
     const message = error instanceof Error ? error.message : 'An unknown error occurred';
  
    // -- 215:18 "Return a generic server error message to the client."
    // -- 215:18 "Avoid sending detailed internal error messages like API keys or stack traces."
  // -- 215:18 "Typing the error response payload"
    return NextResponse.json<{error: string }>(
        { error: message || 'Failed to process request' },
        { status: 500 }
    );
  }
}

// END COMMENT OF FILE 
// Later we just extend our restAPI with the methods we need - GET, PUT, DELETE here if needed