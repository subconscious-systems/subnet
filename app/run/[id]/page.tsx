'use client';

import type React from 'react';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardAuthor, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { Agent } from '@/lib/types';
import { AVAILABLE_TOOLS } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import { parse } from 'partial-json';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';
import { ReasoningStep } from '@/components/reasoning-step';

import { RiArrowGoBackFill, RiExternalLinkFill, RiGitForkFill } from 'react-icons/ri';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RunAgentPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<any[]>([]);
  const [showRawJson, setShowRawJson] = useState(false);
  const [reasoningTitles, setReasoningTitles] = useState<string[]>([]);
  const reasoningRef = useRef<HTMLPreElement>(null);
  const [shareTooltip, setShareTooltip] = useState('Share Agent');
  const [shareTooltipOpen, setShareTooltipOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getToolLabel = (toolValue: string) => {
    const tool = AVAILABLE_TOOLS.find((t) => t.value === toolValue);
    return tool?.label || toolValue;
  };

  // Extract all titles from reasoning array, including subtasks
  const extractTitles = (reasoningArray: any[]): string[] => {
    const titles: string[] = [];

    const processChunk = (chunk: any) => {
      if (chunk?.title) {
        titles.push(chunk.title);
      }

      if (chunk?.subtasks && Array.isArray(chunk.subtasks)) {
        chunk.subtasks.forEach((subtask: any) => processChunk(subtask));
      }
    };

    reasoningArray.forEach((chunk) => processChunk(chunk));
    return titles;
  };

  useEffect(() => {
    async function fetchAgent() {
      const id = params.id as string;

      try {
        const response = await fetch(`/api/agents/${id}`);

        if (!response.ok) {
          router.push('/');
          return;
        }

        const data = await response.json();
        setAgent(data);
      } catch (error) {
        console.error('Error fetching agent:', error);
        router.push('/');
      }
    }

    fetchAgent();
  }, [params.id, router]);

  // Scroll to bottom when result updates
  useEffect(() => {
    if (reasoningRef.current) {
      reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
    }
  }, [result]);

  const handleRun = async () => {
    if (isRunning || !agent) return;

    setIsRunning(true);
    setResult('');
    setReasoningTitles([]);

    try {
      const response = await fetch(`/api/agents/${agent.id}/run`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start agent');
      }

      // Get the readable stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      // Read the stream
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and accumulate it
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        const parsedResult = parse(accumulatedText);
        setResult(parsedResult);

        // Extract and display reasoning titles as they arrive
        if (parsedResult?.reasoning && Array.isArray(parsedResult.reasoning)) {
          const titles = extractTitles(parsedResult.reasoning);
          setReasoningTitles(titles);
        }
      }

      // After streaming is complete, process the reasoning array into chunks
      const finalResult = parse(accumulatedText);
      if (finalResult?.reasoning && Array.isArray(finalResult.reasoning)) {
        setReasoningSteps(finalResult.reasoning);
      }

      setIsRunning(false);
    } catch (error) {
      console.error('Error running agent:', error);
      setResult('Error: Failed to run agent. Please try again.');
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setResult('');
    setReasoningSteps([]);
    setReasoningTitles([]);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareTooltip('Link copied to clipboard');
      setShareTooltipOpen(true);
      setTimeout(() => {
        setShareTooltip('Share Agent');
        setShareTooltipOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDelete = async () => {
    if (!agent || !confirm(`Are you sure you want to delete "${agent.title}"?`)) {
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
      router.push('/');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent. Please try again.');
      setIsDeleting(false);
    }
  };

  if (!agent) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="mb-1 text-xl">{agent.title}</CardTitle>
                <CardAuthor>Author: {agent.author}</CardAuthor>
                <p className="text-muted-foreground text-sm">{agent.description}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/edit/${agent.id}`)}
                    className="hover:bg-yellow-100 hover:text-yellow-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Edit Agent</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Delete Agent</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/fork/${agent.id}`)}
                    className="hover:bg-green-100 hover:text-green-600"
                  >
                    <RiGitForkFill />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Fork Agent</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip open={shareTooltipOpen} onOpenChange={setShareTooltipOpen}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="hover:bg-purple-100 hover:text-purple-600"
                  >
                    <RiExternalLinkFill />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{shareTooltip}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                    <RiArrowGoBackFill />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Back to Home page</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agent.tools.map((tool) => (
                <Badge key={tool} variant="secondary" className="text-xs">
                  {getToolLabel(tool)}
                </Badge>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Collapsible open={showPrompt} onOpenChange={setShowPrompt}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  {showPrompt ? 'Hide' : 'Show'} Instruction Set
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="prose prose-sm text-foreground bg-muted/50 max-h-96 max-w-none overflow-y-auto rounded-md border p-3 text-xs">
                  <ReactMarkdown>{agent.prompt}</ReactMarkdown>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="border-t pt-4">
              <div className="mb-4 flex gap-2">
                <Button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                >
                  {isRunning ? 'Running...' : 'Run Agent'}
                </Button>
                {result && (
                  <Button variant="outline" onClick={handleReset} disabled={isRunning}>
                    Reset
                  </Button>
                )}
              </div>

              {result && (
                <div>
                  {result?.answer && (
                    <div className="mt-4">
                      <h3 className="text-medium mb-2 font-semibold"> Conclusion</h3>
                      <div className="prose prose-sm text-foreground bg-muted/50 max-w-none rounded-md border p-3">
                        <ReactMarkdown>{result?.answer}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          'text-medium mb-2 font-semibold',
                          isRunning && 'animate-pulse text-gray-400',
                        )}
                      >
                        Reasoning & Tool Usage{' '}
                      </h3>
                      {isRunning && (
                        <div className="mb-2 flex items-center gap-2">
                          <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Live Reasoning Titles During Streaming */}
                    {isRunning && reasoningTitles.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {reasoningTitles
                          .slice(0, reasoningTitles.length - 1)
                          .map((title, index) => (
                            <div key={index} className="text-sm">
                              {title} ✅
                            </div>
                          ))}
                        <div className="flex items-center gap-2">
                          <div
                            key={reasoningTitles[reasoningTitles.length - 1]}
                            className="text-muted-foreground animate-pulse text-sm font-bold"
                          >
                            {reasoningTitles[reasoningTitles.length - 1]}
                          </div>
                          <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      </div>
                    )}

                    {/* Rendered Reasoning Steps */}
                    {!isRunning && reasoningSteps.length > 0 && (
                      <div className="mb-4">
                        {reasoningSteps.map((chunk, index) => (
                          <ReasoningStep key={index} {...chunk} />
                        ))}
                      </div>
                    )}

                    {/* Raw JSON Toggle */}
                    <Collapsible open={showRawJson} onOpenChange={setShowRawJson}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground mb-2 text-xs"
                        >
                          {showRawJson ? 'Hide' : 'Show'} Raw JSON
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="prose prose-sm text-foreground bg-muted/50 max-w-none rounded-md border p-3">
                          <pre
                            ref={reasoningRef}
                            className="bg-background max-h-[200px] overflow-y-auto rounded p-2 text-xs break-words whitespace-pre-wrap"
                          >
                            <code className="break-words whitespace-pre-wrap">
                              {JSON.stringify(result?.reasoning, null, 2)}
                            </code>
                          </pre>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
