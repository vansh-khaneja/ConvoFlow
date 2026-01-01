import { Node, Edge } from '@xyflow/react';

/**
 * Transforms nodes to include execution state and update parameters callback
 */
export function transformNodesForExecution(
  nodes: Node[],
  executingNodes: Set<string>,
  onUpdateParameters?: (nodeId: string, parameters: any) => void
): Node[] {
  return nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      isExecuting: executingNodes.has(node.id),
      onUpdateParameters: onUpdateParameters
    }
  }));
}

/**
 * Transforms edges to include execution animation styles
 */
export function transformEdgesForExecution(
  edges: Edge[],
  executingEdges: Set<string>
): Edge[] {
  return edges.map(edge => ({
    ...edge,
    style: executingEdges.has(edge.id) ? {
      strokeDasharray: '5,5',
      animation: 'dash 1s linear infinite',
      stroke: '#10b981',
      strokeWidth: 2
    } : undefined
  }));
}

/**
 * Validates if the workflow can be executed
 * Requires at least one query node and one response node
 */
export function canExecuteWorkflow(nodes: Node[]): boolean {
  try {
    const types = nodes.map((n: any) => (n.data?.nodeSchema?.name || '').toLowerCase());
    const hasQuery = types.some(t => t.includes('query'));
    const hasResponse = types.some(t => t.includes('response'));
    return hasQuery && hasResponse;
  } catch {
    return false;
  }
}

