'use client';

import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Loader2,
  CheckCircle,
  Wrench,
  Search,
  Globe,
  Database,
  FileSearch,
  Activity,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ToolCall {
  parameters: any;
  tool_name: string;
  tool_result: any;
}

interface Task {
  thought?: string;
  title?: string;
  tooluse?: ToolCall;
  subtasks?: Task[];
  conclusion?: string;
}

interface ReasoningDisplayProps {
  reasoning: Task[] | null;
  isRunning: boolean;
  hasResult?: boolean;
  className?: string;
}

// Map tool names to icons and friendly names
const TOOL_INFO: Record<string, { icon: React.ElementType; label: string }> = {
  exa_search: { icon: Search, label: 'Exa Search' },
  exa_crawl: { icon: Globe, label: 'Exa Crawl' },
  exa_find_similar: { icon: FileSearch, label: 'Find Similar' },
  web_search: { icon: Globe, label: 'Web Search' },
  parallel_search: { icon: Database, label: 'Parallel Search' },
  webpage_understanding: { icon: FileSearch, label: 'Page Analysis' },
};

function getToolInfo(toolName: string) {
  return TOOL_INFO[toolName] || { icon: Wrench, label: toolName };
}

function TaskItem({
  task,
  depth = 0,
  defaultExpanded = false,
}: {
  task: Task;
  depth?: number;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Ensure task is defined and has the expected structure
  if (!task) {
    return null;
  }

  const hasSubtasks = task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0;
  const hasToolUse = !!task.tooluse;
  const hasDetails = hasSubtasks || task.thought || task.conclusion;

  // For top-level tasks, show a simplified view
  if (depth === 0) {
    const toolInfo = hasToolUse && task.tooluse ? getToolInfo(task.tooluse.tool_name) : null;
    const Icon = toolInfo?.icon || Activity;

    return (
      <div className="bg-background/50 rounded-lg border p-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="bg-muted mt-0.5 rounded-md p-2">
            <Icon className="text-muted-foreground h-4 w-4" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Title or Tool Use */}
            <div className="flex items-center gap-2">
              {hasToolUse && toolInfo ? (
                <span className="text-sm font-medium">{toolInfo.label}</span>
              ) : task.title ? (
                <span className="text-sm font-medium">{task.title}</span>
              ) : (
                <span className="text-muted-foreground text-sm">Processing...</span>
              )}

              {/* Status indicator */}
              {task.conclusion && (
                <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              )}
            </div>

            {/* Brief description */}
            {hasToolUse && task.tooluse?.parameters?.query && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                Searching: "{task.tooluse.parameters.query}"
              </p>
            )}

            {task.thought && !hasDetails && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{task.thought}</p>
            )}

            {/* Expandable details */}
            {hasDetails && (
              <>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1 text-xs transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      Show details
                    </>
                  )}
                </button>

                {isExpanded && (
                  <div className="border-muted mt-3 space-y-2 border-l-2 pl-2">
                    {task.thought && (
                      <p className="text-muted-foreground text-xs">{task.thought}</p>
                    )}

                    {hasToolUse && task.tooluse && (
                      <div className="space-y-2">
                        {task.tooluse.parameters &&
                          Object.keys(task.tooluse.parameters).length > 0 && (
                            <div className="text-xs">
                              <span className="text-muted-foreground font-medium">Parameters:</span>
                              <pre className="bg-muted/50 mt-1 overflow-x-auto rounded p-2 text-[10px]">
                                {JSON.stringify(task.tooluse.parameters, null, 2)}
                              </pre>
                            </div>
                          )}

                        {task.tooluse.tool_result && (
                          <div className="text-xs">
                            <span className="text-muted-foreground font-medium">Result:</span>
                            <div className="bg-muted/50 mt-1 max-h-32 overflow-y-auto rounded p-2 text-[10px]">
                              {typeof task.tooluse.tool_result === 'string'
                                ? task.tooluse.tool_result
                                : JSON.stringify(task.tooluse.tool_result, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {task.conclusion && (
                      <div className="flex items-start gap-2 text-xs text-green-700 dark:text-green-400">
                        <CheckCircle className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{task.conclusion}</span>
                      </div>
                    )}

                    {hasSubtasks && task.subtasks && (
                      <div className="mt-2 space-y-2">
                        {task.subtasks.map((subtask, index) => (
                          <SubTaskItem key={index} task={subtask} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For nested tasks, show a more compact view
  return <SubTaskItem task={task} />;
}

function SubTaskItem({ task }: { task: Task }) {
  if (!task) return null;

  const hasToolUse = !!task.tooluse;
  const toolInfo = hasToolUse && task.tooluse ? getToolInfo(task.tooluse.tool_name) : null;

  return (
    <div className="space-y-1 text-xs">
      {task.title && (
        <div className="flex items-center gap-2 font-medium">
          {hasToolUse && toolInfo && (
            <span className="text-muted-foreground">{toolInfo.label}:</span>
          )}
          {task.title}
        </div>
      )}
      {task.thought && <div className="text-muted-foreground">{task.thought}</div>}
      {task.conclusion && (
        <div className="flex items-start gap-1 text-green-700 dark:text-green-400">
          <CheckCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{task.conclusion}</span>
        </div>
      )}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="border-muted ml-4 space-y-1 border-l-2 pl-3">
          {task.subtasks.map((subtask, index) => (
            <SubTaskItem key={index} task={subtask} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ReasoningDisplay({
  reasoning,
  isRunning,
  hasResult,
  className,
}: ReasoningDisplayProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse when result is available
  useEffect(() => {
    if (hasResult && !isRunning) {
      setIsCollapsed(true);
    }
  }, [hasResult, isRunning]);

  if (!reasoning || reasoning.length === 0) {
    if (isRunning) {
      return (
        <div className={cn('bg-muted/30 rounded-lg border p-6', className)}>
          <div className="text-muted-foreground flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Initializing agent reasoning...</span>
          </div>
        </div>
      );
    }
    return null;
  }

  const stepCount = reasoning.length;
  const completedSteps = reasoning.filter((r) => r.conclusion).length;

  return (
    <div className={cn('bg-muted/30 rounded-lg border', className)}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-background/50 hover:bg-background/70 w-full border-b p-4 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              Reasoning Process
              {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
            </h3>
            {!isRunning && (
              <span className="text-muted-foreground text-xs">
                ({completedSteps}/{stepCount} steps completed)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasResult && !isRunning && (
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                ✓ Complete
              </span>
            )}
            {isCollapsed ? (
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            )}
          </div>
        </div>
      </button>

      {!isCollapsed && (
        <div className="max-h-[400px] overflow-y-auto p-4">
          <div className="space-y-3">
            {reasoning &&
              Array.isArray(reasoning) &&
              reasoning.map((task, index) => (
                <TaskItem key={index} task={task || {}} defaultExpanded={false} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
