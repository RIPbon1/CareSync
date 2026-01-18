import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        // Supabase Auth removed 
        const session = { user: { email: 'guest@caresync.app' } };

        const { messages, familyContext } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        // Prepare context about the family's recent tasks if available
        // In a full implementation, we would fetch relevant documents/tasks from vector store
        // For now, we rely on what the client sends or generic helpfulness

        const systemPrompt = `You are CareSync, a Sentient Care Assistant. 
    Your goal is to help families manage complex healthcare journeys with empathy, clarity, and intelligence.
    
    Traits:
    - Empathetic and supportive tone.
    - Proactive in suggesting care tasks.
    - Knowledgeable about general medical terms (but always clarify you are an AI, not a doctor).
    - Concise and action-oriented.

    Context:
    You are assisting the family of ${session?.user?.email}.
    ${familyContext ? `Current Family Context: ${JSON.stringify(familyContext)}` : ''}
    
    Always format your response with clean Markdown. Use bullet points for lists.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
            stream: true,
        });

        // Handle streaming response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
