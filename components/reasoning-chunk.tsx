import { Card } from '@/components/ui/card';

interface ToolUse {
  tool_name: string;
  parameters: Record<string, any>;
  tool_result?: {
    tool_name: string;
    result: string;
    latency: number;
  };
}

interface ReasoningChunkProps {
  title: string;
  thought?: string;
  conclusion?: string;
  tooluse?: ToolUse;
  subtasks?: ReasoningChunkProps[];
}

export function ReasoningChunk({
  title,
  thought,
  conclusion,
  tooluse,
  subtasks,
}: ReasoningChunkProps) {
  return (
    <Card className="mb-3 p-3">
      <div className="text-sm">
        <div className="mb-1 font-semibold text-foreground">{title}</div>
        {thought && <div className="text-muted-foreground mb-2">{thought}</div>}
        {conclusion && <div className="text-muted-foreground mb-2">{conclusion}</div>}
        {tooluse && (
          <div className="text-muted-foreground mb-2">
            <div className="font-medium">Tool: {tooluse.tool_name}</div>
            {tooluse.tool_result && (
              <div className="text-xs mt-1">Latency: {tooluse.tool_result.latency.toFixed(2)}s</div>
            )}
          </div>
        )}
        {subtasks && subtasks.length > 0 && (
          <div className="ml-4 mt-2">
            {subtasks.map((subtask, index) => (
              <ReasoningChunk key={index} {...subtask} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
