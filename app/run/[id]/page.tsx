'use client';

import type React from 'react';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Agent } from '@/lib/types';
import { AVAILABLE_TOOLS } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import { parse } from 'partial-json';
import { cn } from '@/lib/utils';
import { LoaderCircle, AlertTriangle } from 'lucide-react';
import { ReasoningDisplay } from '@/components/reasoning-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RunAgentPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reasoningRef = useRef<HTMLPreElement>(null);

  const getToolLabel = (toolValue: string) => {
    const tool = AVAILABLE_TOOLS.find((t) => t.value === toolValue);
    return tool?.label || toolValue;
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
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`/api/agents/${agent.id}/run`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to start agent (${response.status})`);
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
        console.log('Accumulated text', accumulatedText);
        setResult(parse(accumulatedText));
      }

      setIsRunning(false);
    } catch (error: any) {
      console.error('Error running agent:', error);

      // Determine the error message
      let errorMessage = 'Failed to run agent. Please try again.';

      if (error.message?.includes('SUBCONSCIOUS_API_KEY')) {
        errorMessage =
          'API key not configured. Please check your Subconscious API key configuration.';
      } else if (error.message?.includes('404')) {
        errorMessage = 'Agent not found. Please refresh the page and try again.';
      } else if (error.message?.includes('500')) {
        errorMessage =
          'Server error. The Subconscious API may be experiencing issues. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setResult(null);
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
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
                <p className="text-muted-foreground text-sm">{agent.description}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                Back
              </Button>
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
                {(result || error) && (
                  <Button variant="outline" onClick={handleReset} disabled={isRunning}>
                    Reset
                  </Button>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Reasoning Display */}
                  <ReasoningDisplay
                    reasoning={result?.reasoning}
                    isRunning={isRunning}
                    hasResult={!!result?.answer}
                  />

                  {/* Final Answer - Moved to top and made more prominent */}
                  {result?.answer && (
                    <div className="bg-background rounded-lg border p-6">
                      <h3 className="mb-4 text-lg font-semibold">Final Result</h3>
                      <div className="prose prose-sm text-foreground max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                            h1: ({ children }) => (
                              <h1 className="mt-4 mb-3 text-xl font-bold">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="mt-3 mb-2 text-lg font-semibold">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="mt-2 mb-2 text-base font-semibold">{children}</h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>
                            ),
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => (
                              <strong className="font-semibold">{children}</strong>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-muted my-4 border-l-4 pl-4 italic">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children, ...props }) =>
                              (props as any).inline ? (
                                <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-muted my-3 block overflow-x-auto rounded-md p-3">
                                  <code>{children}</code>
                                </pre>
                              ),
                          }}
                        >
                          {result?.answer}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
