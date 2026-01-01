/**
 * Utility functions for creating and comparing workflow snapshots
 * Used for change detection (excluding position data)
 */

import { Node, Edge } from 'reactflow';

/**
 * Create a snapshot of the workflow without position data (for change detection)
 * Excludes position and execution-related data (response, response_content)
 */
export function createWorkflowSnapshot(nodes: Node[], edges: Edge[]): string {
  const nodesWithoutPositions = nodes.map(node => {
    // Exclude position and execution-related data (response, response_content)
    const { response, response_content, onDelete, ...relevantData } = node.data as any;
    return {
      id: node.id,
      type: node.type,
      data: relevantData
    };
  });

  const edgesData = edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle
  }));

  return JSON.stringify({ nodes: nodesWithoutPositions, edges: edgesData });
}

/**
 * Check if two workflows are different (ignoring positions)
 */
export function workflowsAreDifferent(snapshot1: string, snapshot2: string): boolean {
  return snapshot1 !== snapshot2;
}

