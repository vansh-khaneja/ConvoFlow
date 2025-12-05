'use client';

import { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { toast } from 'sonner';
import WorkflowExecutor from '@/components/workflow/WorkflowExecutor';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface UseWorkflowExecutionProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setExecutingEdges: (edges: Set<string>) => void;
  setExecutingNodes: (nodes: Set<string>) => void;
  onChatPreview: (preview: { user?: string; bot?: string } | null) => void;
  conversationHistory?: ChatMessage[];
  onConversationUpdate?: (messages: ChatMessage[]) => void;
}

export function useWorkflowExecution({
  nodes,
  edges,
  setNodes,
  setExecutingEdges,
  setExecutingNodes,
  onChatPreview,
  conversationHistory = [],
  onConversationUpdate
}: UseWorkflowExecutionProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);

  const workflowExecutor = WorkflowExecutor({
    nodes,
    edges,
    onExecute: () => {}, // We'll handle execution manually
    isExecuting
  });

  const executeWorkflowWithQuery = async (query: string, isContinued: boolean = false) => {
    setIsExecuting(true);
    setExecutionResults(null);

    // Get updated nodes with the new query if it's a continued conversation
    let updatedNodes = nodes;
    let updatedConversationHistory = conversationHistory;
    
    if (isContinued && query) {
      updatedNodes = nodes.map(node => {
        const nodeSchema = (node.data as any)?.nodeSchema;
        const isQueryNode = nodeSchema?.name === 'QueryNode' || 
                           nodeSchema?.node_id?.toLowerCase?.().includes('query');
        
        if (isQueryNode) {
          return {
            ...node,
            data: {
              ...node.data,
              parameters: {
                ...(node.data as any).parameters,
                query: query
              }
            }
          };
        }
        return node;
      });
      
      // Update the nodes state
      setNodes(updatedNodes);
      
      // Add user message to conversation immediately and track it
      if (onConversationUpdate) {
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          type: 'user',
          content: query,
          timestamp: new Date()
        };
        updatedConversationHistory = [...conversationHistory, userMessage];
        onConversationUpdate(updatedConversationHistory);
      }
    }

    const currentQuery = isContinued && query ? query : (() => {
      try {
        const qNode = updatedNodes.find(n => {
          const nodeSchema = (n.data as any)?.nodeSchema;
          return nodeSchema?.name === 'QueryNode' || 
                 nodeSchema?.node_id?.toLowerCase?.().includes('query');
        }) as any;
        return qNode?.data?.parameters?.query || '';
      } catch {
        return '';
      }
    })();
    
    let previewResponse: string | undefined = undefined;

    // Start animation for all edges
    const allEdgeIds = edges.map(edge => edge.id);
    const allNodeIds = updatedNodes.map(node => node.id);
    setExecutingEdges(new Set(allEdgeIds));
    setExecutingNodes(new Set(allNodeIds));

    try {
      // Create a new executor with updated nodes
      const executor = WorkflowExecutor({
        nodes: updatedNodes,
        edges,
        onExecute: () => {},
        isExecuting: true
      });
      
      const result = await executor.executeWorkflow();
      setExecutionResults(result);
      
      // Check for errors in the execution result
      // Backend now captures errors from all nodes (exceptions and node outputs with success: false or metadata.error)
      const detectedErrors = result.data?.errors || {};
      
      // Check for credential errors specifically (pre-execution validation)
      if (result.data?.missing_credentials) {
        const missingCreds = result.data.missing_credentials;
        const nodeCount = Object.keys(missingCreds).length;
        const allMissingCreds = result.data.all_missing_credentials || [];
        
        // Build a more informative message
        let description = '';
        if (allMissingCreds.length > 0) {
          description = `${nodeCount} node(s) require the following credentials: ${allMissingCreds.join(', ')}. `;
        } else {
          // Fallback to old method if new format not available
          const allCreds = new Set<string>();
          Object.values(missingCreds).forEach((creds: any) => {
            if (Array.isArray(creds)) {
              creds.forEach((c: string) => allCreds.add(c));
            } else {
              allCreds.add(String(creds));
            }
          });
          description = `${nodeCount} node(s) require credentials: ${Array.from(allCreds).join(', ')}. `;
        }
        description += 'Please set them in Settings > Credentials.';
        
        toast.error(`Missing Required Credentials`, {
          description: description,
          duration: 10000
        });
      } else if (detectedErrors && Object.keys(detectedErrors).length > 0) {
        // Show toast notifications for detected errors
        const errorEntries = Object.entries(detectedErrors);
        if (errorEntries.length === 1) {
          const [nodeId, error] = errorEntries[0];
          const errorMsg = String(error).split('\n')[0]; // Get first line of error
          toast.error(`Execution Error: ${errorMsg}`, {
            description: `Node: ${nodeId}`,
            duration: 5000
          });
        } else {
          toast.error(`Execution completed with ${errorEntries.length} error(s)`, {
            description: 'Check the execution results for details',
            duration: 5000
          });
        }
      } else if (result.success) {
        // Show success toast for successful executions
        toast.success('Workflow executed successfully!', {
          description: `Executed ${result.data?.executed_nodes?.length || 0} node(s)`,
          duration: 3000
        });
      }
      
      // Update node data with response information
      if (result.success && result.data?.response_inputs) {
        console.log('[Execution] Response inputs received:', result.data.response_inputs);
        const nodeUpdates: any[] = [];
        
        Object.entries(result.data.response_inputs).forEach(([nodeId, nodeData]: [string, any]) => {
          console.log(`[Execution] Processing node ${nodeId}:`, nodeData);
          
          // Handle ResponseNode - extract final_response and set as response_content
          if (nodeData.final_response) {
            // Get the first response (since we only allow one response node)
            if (!previewResponse) {
              previewResponse = String(nodeData.final_response);
            }
            // Create node update to add response data
            nodeUpdates.push({
              id: nodeId,
              type: 'update',
              data: {
                response: nodeData.final_response,
                response_content: nodeData.final_response
              }
            });
            console.log(`[ResponseNode] Added update for ${nodeId}`);
          }
          
          // Handle DebugNode - extract debug_content directly like ResponseNode extracts final_response
          // DebugNode now returns debug_content as an output, similar to how ResponseNode returns final_response
          if (nodeData.debug_content) {
            console.log(`[DebugNode] Found debug_content for ${nodeId}:`, nodeData.debug_content);
            nodeUpdates.push({
              id: nodeId,
              type: 'update',
              data: {
                node_data: {
                  debug_content: nodeData.debug_content
                }
              }
            });
            console.log(`[DebugNode] Added update for ${nodeId}`);
          } else if (nodeData.__node_data__) {
            // Fallback: use __node_data__ if debug_content is not directly available
            console.log(`[DebugNode] Using __node_data__ for ${nodeId}:`, nodeData.__node_data__);
            nodeUpdates.push({
              id: nodeId,
              type: 'update',
              data: {
                node_data: nodeData.__node_data__
              }
            });
            console.log(`[DebugNode] Added update for ${nodeId} (from __node_data__)`);
          } else if (nodeData.debug_info) {
            // Last fallback: construct from debug_info
            const nodeDataToUse = {
              debug_content: JSON.stringify(nodeData.debug_info, null, 2)
            };
            console.log(`[DebugNode] Constructing from debug_info for ${nodeId}`);
            nodeUpdates.push({
              id: nodeId,
              type: 'update',
              data: {
                node_data: nodeDataToUse
              }
            });
            console.log(`[DebugNode] Added update for ${nodeId} (from debug_info)`);
          }
        });
        
        console.log('[Execution] Total node updates:', nodeUpdates.length, nodeUpdates);
        
        // Apply the node updates manually using setNodes
        if (nodeUpdates.length > 0) {
          console.log('[Execution] Applying node updates to', nodeUpdates.length, 'nodes');
          setNodes(prevNodes => {
            const updated = prevNodes.map(node => {
              const update = nodeUpdates.find(update => update.id === node.id);
              if (update) {
                const newData = {
                  ...node.data,
                  ...update.data
                };
                console.log(`[Execution] Updating node ${node.id}:`, {
                  before: node.data,
                  update: update.data,
                  after: newData
                });
                return {
                  ...node,
                  data: newData
                };
              }
              return node;
            });
            console.log('[Execution] Updated nodes:', updated.filter(n => nodeUpdates.find(u => u.id === n.id)));
            return updated;
          });
        } else {
          console.log('[Execution] No node updates to apply');
        }
      }
      
      // Update conversation history with bot response
      if (previewResponse && onConversationUpdate) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: previewResponse,
          timestamp: new Date()
        };

        if (isContinued) {
          // For continued conversations, add bot response to the updated conversation
          // User message was already added before execution started
          onConversationUpdate([...updatedConversationHistory, botMessage]);
        } else {
          // Initialize conversation for first execution
          const userMessage: ChatMessage = {
            id: `user-${Date.now() - 1}`,
            type: 'user',
            content: currentQuery,
            timestamp: new Date(Date.now() - 1)
          };
          onConversationUpdate([userMessage, botMessage]);
        }
      }

      // Show chat preview (legacy support)
      onChatPreview({
        user: currentQuery,
        bot: previewResponse
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Execution Failed', {
        description: errorMessage,
        duration: 5000
      });
      setExecutionResults({
        success: false,
        data: {},
        error: errorMessage
      });
    } finally {
      setIsExecuting(false);
      setExecutingEdges(new Set());
      setExecutingNodes(new Set());
    }
  };

  const handleExecuteWorkflow = async () => {
    await executeWorkflowWithQuery('', false);
  };

  const handleContinueConversation = async (newQuery: string) => {
    await executeWorkflowWithQuery(newQuery, true);
  };

  return {
    isExecuting,
    executionResults,
    handleExecuteWorkflow,
    handleContinueConversation,
    setExecutionResults
  };
}

