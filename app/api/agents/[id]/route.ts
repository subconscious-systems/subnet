import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { agentsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/agents/[id] - Get a specific agent
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, agentId)).limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Map database fields to match Agent interface
    const mappedAgent = {
      id: agent.id.toString(),
      title: agent.name,
      description: agent.description,
      prompt: agent.prompt,
      tools: (agent.tools as string[]) || [],
      author: agent.author,
      fork_ref: agent.fork_ref?.toString(),
    };

    return NextResponse.json(mappedAgent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}

// PUT /api/agents/[id] - Update a specific agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.author || !body.description || !body.prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build update object with complete agent data
    // Note: id and fork_ref are immutable and not included
    const updateData = {
      name: body.title,
      author: body.author,
      description: body.description,
      prompt: body.prompt,
      tools: body.tools || [],
    };

    const [updatedAgent] = await db
      .update(agentsTable)
      .set(updateData)
      .where(eq(agentsTable.id, agentId))
      .returning();

    if (!updatedAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Map database fields to match Agent interface
    const mappedAgent = {
      id: updatedAgent.id.toString(),
      title: updatedAgent.name,
      description: updatedAgent.description,
      prompt: updatedAgent.prompt,
      tools: (updatedAgent.tools as string[]) || [],
      author: updatedAgent.author,
      fork_ref: updatedAgent.fork_ref?.toString(),
    };

    return NextResponse.json(mappedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

// DELETE /api/agents/[id] - Delete a specific agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const [deletedAgent] = await db
      .delete(agentsTable)
      .where(eq(agentsTable.id, agentId))
      .returning();

    if (!deletedAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
