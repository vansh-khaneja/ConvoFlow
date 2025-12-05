'use client';

import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface WorkflowExecutorProps {
  nodes: Node[];
  edges: Edge[];
  onExecute: () => void;
  isExecuting: boolean;
}

export default function WorkflowExecutor({
  nodes,
  edges,
  onExecute,
  isExecuting
}: WorkflowExecutorProps) {
  const convertWorkflowForExecution = () => {
    const executionNodes: Record<string, any> = {};
    const executionEdges: any[] = [];

    // Map display names to registry IDs (backend uses __name__.lower())
    const nodeTypeMapping: Record<string, string> = {
      'QueryNode': 'querynode',
      'ResponseNode': 'responsenode',
      'LanguageModelNode': 'languagemodelnode'
    };

    nodes.forEach(node => {
      const nodeSchema = (node.data as any).nodeSchema;
      const nodeParams = (node.data as any).parameters || {};
      const registryType = nodeTypeMapping[nodeSchema.name] || nodeSchema.name.toLowerCase();

      // Ensure required parameters have values, set defaults if needed
      const executionParams = { ...nodeParams };

      for (const param of nodeSchema.parameters || []) {
        if (param.required && (!executionParams[param.name] || executionParams[param.name] === '')) {
          // Set default values for common required parameters
          if (param.name === 'query' && nodeSchema.name === 'QueryNode') {
            executionParams[param.name] = 'Hi there!';
          } else if (param.name === 'service' && nodeSchema.name === 'LanguageModelNode') {
            executionParams[param.name] = 'openai';
          } else if (param.default_value !== undefined) {
            executionParams[param.name] = param.default_value;
          }
        }
      }

      executionNodes[node.id] = {
        type: registryType,
        parameters: executionParams
      };
    });

    edges.forEach(edge => {
      const sourceOutput = edge.sourceHandle?.replace('output-', '') || 'result';
      const targetInput = edge.targetHandle?.replace('input-', '') || 'query';

      executionEdges.push({
        from: {
          node: edge.source,
          output: sourceOutput
        },
        to: {
          node: edge.target,
          input: targetInput
        }
      });
    });

    return {
      nodes: executionNodes,
      edges: executionEdges
    };
  };

  const validateWorkflow = () => {
    if (nodes.length === 0) {
      toast.error('Please add nodes to the workflow before executing');
      return false;
    }

    // Validate workflow has required nodes
    const nodeTypes = nodes.map(node => {
      const nodeSchema = (node.data as any).nodeSchema;
      const nodeTypeMapping: Record<string, string> = {
        'QueryNode': 'querynode',
        'ResponseNode': 'responsenode',
        'LanguageModelNode': 'languagemodelnode'
      };
      return nodeTypeMapping[nodeSchema.name] || nodeSchema.name.toLowerCase();
    });

    const hasQueryNode = nodeTypes.some(type => type.toLowerCase() === 'querynode');
    const hasResponseNode = nodeTypes.some(type => type.toLowerCase() === 'responsenode');

    if (!hasQueryNode || !hasResponseNode) {
      toast.error('Workflow must include at least one QueryNode and one ResponseNode');
      return false;
    }

    // Check for critical missing parameters that don't have defaults
    for (const node of nodes) {
      const nodeSchema = (node.data as any).nodeSchema;
      const nodeParams = (node.data as any).parameters || {};

      for (const param of nodeSchema.parameters || []) {
        if (param.required && (!nodeParams[param.name] || nodeParams[param.name] === '')) {
          // Only alert for parameters that don't have defaults set in the conversion function
          if (param.name === 'query' && nodeSchema.name === 'QueryNode') {
            // This will get a default value, so no alert needed
            continue;
          } else if (param.name === 'service' && nodeSchema.name === 'LanguageModelNode') {
            // This will get a default value, so no alert needed
            continue;
          } else if (param.default_value !== undefined) {
            // This will get a default value, so no alert needed
            continue;
          } else {
            // Toast for truly missing required parameters without defaults
            toast.error(`Node "${nodeSchema.name}" is missing required parameter: ${param.name}`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const executeWorkflow = async () => {
    if (!validateWorkflow()) return;

    try {
      const workflowData = convertWorkflowForExecution();
      
      try {
        const response = await fetch(`${API_BASE}/api/v1/nodes/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workflowData),
        });

        const responseText = await response.text();
        
        if (!response.ok) {
          // Try to parse error response as JSON to extract error details
          let errorData: any = {};
          try {
            errorData = JSON.parse(responseText);
          } catch {
            // If not JSON, use the text as error message
            errorData = { error: responseText, detail: responseText };
          }
          
          // Handle credential errors specifically
          if (errorData.detail?.missing_credentials) {
            // Format credential errors for display with node names
            const credErrors: Record<string, string> = {};
            const nodeInfo = errorData.detail.node_info || {};
            
            Object.entries(errorData.detail.missing_credentials).forEach(([nodeId, creds]: [string, any]) => {
              const credsList = Array.isArray(creds) ? creds : [creds];
              const nodeDisplayName = nodeInfo[nodeId]?.display_name || nodeId;
              credErrors[nodeId] = `${nodeDisplayName}: Missing ${credsList.join(', ')}. Please set them in Settings > Credentials.`;
            });
            
            return {
              success: false,
              data: {
                errors: credErrors,
                missing_credentials: errorData.detail.missing_credentials,
                node_info: errorData.detail.node_info || {},
                all_missing_credentials: errorData.detail.all_missing_credentials || [],
                error_messages: errorData.detail.errors || []
              },
              error: errorData.detail.message || 'Missing required credentials for workflow execution'
            };
          }
          
          // Handle execution errors (new format from backend)
          if (errorData.detail?.errors && typeof errorData.detail.errors === 'object') {
            return {
              success: false,
              data: {
                errors: errorData.detail.errors,
                executed_nodes: errorData.detail.executed_nodes || [],
                skipped_nodes: errorData.detail.skipped_nodes || [],
                response_inputs: {} // Empty response_inputs since execution failed
              },
              error: errorData.detail.message || 'Workflow execution failed'
            };
          }
          
          // Handle generic errors (old format or unexpected errors)
          const errorMessage = typeof errorData.detail === 'string' ? errorData.detail : 
                             errorData.message || 
                             errorData.error || 
                             `HTTP error! status: ${response.status}`;
          
          return {
            success: false,
            data: {
              errors: { 'workflow_error': errorMessage },
              response_inputs: {} // Empty response_inputs
            },
            error: errorMessage
          };
        }

        let result: any;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('[WorkflowExecutor] Failed to parse response:', parseError, 'Response text:', responseText);
          return {
            success: false,
            data: {},
            error: `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`
          };
        }
        
        // Log the result for debugging
        console.log('[WorkflowExecutor] Parsed result:', result);
        
        // Ensure result has proper structure - always include data even if empty
        const formattedResult = {
          success: result?.success !== false,
          data: result?.data || result || {},
          error: result?.error || null,
          ...result
        };
        
        // Ensure data is always an object
        if (!formattedResult.data || typeof formattedResult.data !== 'object') {
          formattedResult.data = {};
        }
        
        console.log('[WorkflowExecutor] Formatted result:', formattedResult);
        
        return formattedResult;
        
      } catch (fetchError) {
        throw fetchError;
      }
    } catch (error) {
      // Return error result instead of throwing
      return {
        success: false,
        data: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  return {
    executeWorkflow,
    validateWorkflow,
    convertWorkflowForExecution
  };
}
