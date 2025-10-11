'use client';

import Link from 'next/link';
import type { Agent } from '@/lib/types';
import {
  Card,
  CardAuthor,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { AVAILABLE_TOOLS } from '@/lib/types';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface AgentCardProps {
  agent: Agent;
  agentMap?: Record<string, Agent>;
  onDelete?: (agentId: string) => void;
}

export function AgentCard({ agent, agentMap, onDelete }: AgentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getParentAgentName = () => {
    if (!agent.fork_ref) return null;
    const parentAgent = agentMap?.[agent.fork_ref];
    return parentAgent ? parentAgent.title : '[Deceased Agent]';
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${agent.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    const agentTitle = agent.title;

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      toast.success(`Agent "${agentTitle}" deleted`);
      onDelete?.(agent.id);
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl">{agent.title}</CardTitle>
            <div className="flex items-center gap-1">
              <CardAuthor>Author: {agent.author} </CardAuthor>
              {agent.fork_ref && (
                <CardAuthor className="text-muted-foreground italic">
                  (Fork of "{getParentAgentName()}")
                </CardAuthor>
              )}
            </div>
            <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
          </div>
          <div className="flex gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/edit/${agent.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Edit Agent</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Delete Agent</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <p className="text-muted-foreground text-sm font-medium">Tools:</p>
          <div className="flex flex-wrap gap-2">
            {agent.tools.slice(0, 2).map((tool) => (
              <Badge key={tool} variant="secondary" className="text-xs">
                {AVAILABLE_TOOLS.find((t) => t.value === tool)?.label}
              </Badge>
            ))}
            {agent.tools.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{agent.tools.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/run/${agent.id}`} className="w-full">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
            View Agent
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
