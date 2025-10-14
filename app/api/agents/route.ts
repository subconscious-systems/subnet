import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agentsTable } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

// GET /api/agents - Get first 50 agents
export async function GET() {
  try {
    const agents = await db
      .select({
        id: agentsTable.id,
        name: agentsTable.name,
        description: agentsTable.description,
        prompt: agentsTable.prompt,
        tools: agentsTable.tools,
        author: agentsTable.author,
        fork_ref: agentsTable.fork_ref,
        fork_count: sql<number>`(
          SELECT COUNT(*)::int
          FROM agents AS forks
          WHERE forks.fork_ref = agents.id
        )`.as('fork_count'),
      })
      .from(agentsTable)
      .orderBy(desc(agentsTable.id))
      .limit(50);

    console.log('AGENTS', agents);

    // Map database fields to match Agent interface
    const mappedAgents = agents.map((agent) => ({
      id: agent.id.toString(),
      title: agent.name,
      description: agent.description,
      prompt: agent.prompt,
      tools: (agent.tools as string[]) || [],
      author: agent.author,
      fork_ref: agent.fork_ref?.toString(),
      fork_count: agent.fork_count,
    }));

    return NextResponse.json(mappedAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, prompt, tools, author, fork_ref } = body;

    if (!title || !description || !prompt || !author) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newAgent] = await db
      .insert(agentsTable)
      .values({
        name: title,
        description,
        prompt,
        tools: tools || [],
        author,
        fork_ref: fork_ref ? parseInt(fork_ref) : undefined,
      })
      .returning();

    // Map database fields to match Agent interface
    const mappedAgent = {
      id: newAgent.id.toString(),
      title: newAgent.name,
      description: newAgent.description,
      prompt: newAgent.prompt,
      tools: (newAgent.tools as string[]) || [],
      author: newAgent.author,
      fork_ref: newAgent.fork_ref?.toString(),
    };

    return NextResponse.json(mappedAgent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
