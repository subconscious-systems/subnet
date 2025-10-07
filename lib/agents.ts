"use client"

import type { Agent } from "./types"

const STORAGE_KEY = "agents"

export function getAgents(): Agent[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getAgent(id: string): Agent | undefined {
  return getAgents().find((agent) => agent.id === id)
}

export function saveAgent(agent: Agent): void {
  const agents = getAgents()
  const existingIndex = agents.findIndex((a) => a.id === agent.id)

  if (existingIndex >= 0) {
    agents[existingIndex] = agent
  } else {
    agents.push(agent)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents))
}

export function deleteAgent(id: string): void {
  const agents = getAgents().filter((agent) => agent.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents))
}
