import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ToolUse {
  tool_name: string;
  parameters: Record<string, any>;
  tool_result?: {
    tool_name: string;
    result: string;
    latency: number;
  };
}

interface ReasoningStep {
  title: string;
  thought?: string;
  conclusion?: string;
  tooluse?: ToolUse;
  subtasks?: ReasoningStep[];
}

export function ReasoningStep({ title, thought, conclusion, tooluse, subtasks }: ReasoningStep) {
  const [showThought, setShowThought] = useState(false);

  return (
    <Card className="mb-3 p-3">
      <div className="text-sm">
        <div className="text-foreground mb-1 font-semibold">{title}</div>
        {thought && (
          <Collapsible open={showThought} onOpenChange={setShowThought}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground mb-1 h-auto p-0 text-xs font-normal"
              >
                <span className="flex items-center gap-1">
                  {showThought ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  {showThought ? 'Hide' : 'Show'} thought process
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1">
              <div className="text-muted-foreground bg-muted/30 mb-2 rounded p-2 text-xs">
                {thought}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        {conclusion && <div className="text-muted-foreground mb-2">{conclusion}</div>}
        {tooluse && (
          <div className="text-muted-foreground mb-2">
            <div className="font-medium">Tool: {tooluse.tool_name}</div>
            {tooluse.tool_result && (
              <div className="mt-1 text-xs">Latency: {tooluse.tool_result.latency.toFixed(2)}s</div>
            )}
          </div>
        )}
        {subtasks && subtasks.length > 0 && (
          <div className="mt-2 ml-4">
            {subtasks.map((subtask, index) => (
              <ReasoningStep key={index} {...subtask} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
