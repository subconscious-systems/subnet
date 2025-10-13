# Mental Model - How to Think About Building with Subconscious

Source: https://docs.subconscious.dev/mental-model

**Note**: We're currently in research preview! We're excited to share our system with you, and we would love to hear your feedback.

## The Subconscious Approach to Making Agents

Subconscious is a platform for building agents that's innovating at the **model and runtime layer**. Backed by MIT research, we've developed an inference engine that allows for sustained accuracy across tool use and long horizon reasoning beyond existing context limits.

Other platforms for agents (like LangGraph, Crew AI, etc.) have innovated at the software orchestration layer on top of existing LLM calls. Those systems can be extremely useful, but our way of doing things enables more efficient, more flexible, and capable systems **IF** you are willing to give the model control to generate its own workflow.

### Bring Your Goals and Tools

With Subconscious, you bring goals and tools, and our inference engine accomplishes the task (inference engine = model + runtime). Now, you don't have to waste your focus on multi-agent negotiations, orchestration, or context window limits, you only need to focus on giving the agent the right directives and engineering the tools it has access to.

This is a fundamental shift in how to think about agent development. It means you spend more time understanding your project specific goals and building your unique tools, and our API will handle the reasoning to piece them together.

## How to Think Through Your Task

Before building an agent, you should approach the problem like a human expert would:

- **Think through your task**: If a human were to complete this task, what would they do? What tools would they use? What does complete look like? What pitfalls would an experienced person tell them to avoid?
- **Identify the tools needed**: What are the core tools required to accomplish this task? What are tools you might need in weird edge cases?
- **Build missing tools**: If those tools don't exist, you may have to build them before proceeding.
- **Create your goals**: Finally, create your goals for the agent, listing the tools, when to use them, and what pitfalls to avoid.

## Development Process

The development process for working on an agent with Subconscious looks like this:

1. **Develop your tools** - Build the specific tools your agent will need (we're working on ways to make this easier).
2. **Create your prompt with your goals** - Define what you want the agent to accomplish.
3. **Run your agent with an API call** - Let Subconscious handle the execution.
4. **Iterate** - Refine based on results.

## Focus on What Matters

Your time should be spent on software engineering unique tools for your business and prioritizing the instructions for the world you know better than anyone. It should not be spent wrestling with new frameworks, orchestration, context limits, and GPUs. You focus on the domain expertise. We'll make sure your agents perform.
