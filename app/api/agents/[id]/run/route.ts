import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/db';
import { agentsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Initialize the client with Subconscious endpoint
const client = new OpenAI({
  baseURL: 'https://api.subconscious.dev/v1',
  apiKey: process.env.SUBCONSCIOUS_API_KEY || '',
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    // Fetch the agent from the database
    const agent = await db.select().from(agentsTable).where(eq(agentsTable.id, agentId)).limit(1);

    if (!agent || agent.length === 0) {
      return new Response('Agent not found', { status: 404 });
    }

    const agentData = agent[0];

    // Parse tools from the agent data
    const toolsArray = Array.isArray(agentData.tools) ? agentData.tools : [];

    // Map tools to the format expected by Subconscious API
    const tools = toolsArray.map((tool: string) => ({
      type: tool as any,
    })) as any;

    console.log('Tools', tools);

    // Create a streaming response using ReadableStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await client.chat.completions.create({
            model: 'tim-large',
            messages: [
              {
                role: 'user',
                content: agentData.prompt,
              },
            ],
            tools: tools.length > 0 ? tools : [],
            stream: true,
          });

          console.log('API KEY', process.env.SUBCONSCIOUS_API_KEY);
          console.log('Response type:', typeof response);
          console.log('Response keys:', Object.keys(response));
          console.log('All response properties:', Object.getOwnPropertyNames(response));
          console.log(
            'Response prototype methods:',
            Object.getOwnPropertyNames(Object.getPrototypeOf(response)),
          );

          // Check if it has common streaming methods
          console.log('Has toReadableStream?', typeof (response as any).toReadableStream);
          console.log('Has [Symbol.asyncIterator]?', typeof response[Symbol.asyncIterator]);

          // Stream the response
          let chunkCount = 0;
          for await (const chunk of response) {
            chunkCount++;
            console.log(`Chunk ${chunkCount}:`, chunk);

            // Handle different possible chunk structures
            if (!chunk.choices || chunk.choices.length === 0) {
              console.log('No choices in chunk', chunk);
              continue;
            }

            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              console.log('Content in chunk', content);
              controller.enqueue(encoder.encode(content));
            }
          }

          console.log(`Finished iterating. Total chunks: ${chunkCount}`);

          controller.close();
        } catch (error) {
          console.error('Error streaming response:', error);
          controller.error(error);
        }
      },
    });

    // Return the stream
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in run API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
