'use client';

import { useState, useEffect, useCallback } from 'react';
import { Node, Edge, useNodesState, useEdgesState, Connection, addEdge } from '@xyflow/react';
import { getNodes, NodesResponse } from '../api/nodes';

export function useWorkflowState() {
  const [nodesData, setNodesData] = useState<NodesResponse | null>(null);
  const [showNodeSidebar, setShowNodeSidebar] = useState(false);
  const [showConfigSidebar, setShowConfigSidebar] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [executingEdges, setExecutingEdges] = useState<Set<string>>(new Set());
  const [executingNodes, setExecutingNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const fetchNodes = async () => {
    try {
      const data = await getNodes();
      setNodesData(data);
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
      // Set a default empty state so the app doesn't break
      setNodesData({
        nodes: [],
        schemas: {},
        total_count: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleAddNode = () => {
    setShowNodeSidebar(true);
  };

  const handleNodeSelect = (nodeType: string) => {
    if (!nodesData) return;

    const nodeSchema = nodesData.schemas[nodeType];
    
    // Check if trying to add a response node and one already exists
    const isResponseNode = nodeType.toLowerCase().includes('response');
    if (isResponseNode) {
      const hasResponseNode = nodes.some(node => {
        const schema = (node.data as any)?.nodeSchema;
        return schema?.node_id?.toLowerCase().includes('response');
      });
      
      if (hasResponseNode) {
        alert('Only one Response Node is allowed per workflow. Please remove the existing Response Node first.');
        return;
      }
    }
    
    // Check if trying to add a query node and one already exists
    const isQueryNode = nodeType.toLowerCase().includes('query') && !nodeType.toLowerCase().includes('textinput');
    if (isQueryNode) {
      const hasQueryNode = nodes.some(node => {
        const schema = (node.data as any)?.nodeSchema;
        return schema?.node_id?.toLowerCase() === 'querynode';
      });
      
      if (hasQueryNode) {
        alert('Only one Query Node is allowed per workflow. Please remove the existing Query Node first.');
        return;
      }
    }
    
    // Initialize parameters with default values
    const initialParameters: Record<string, any> = {};
    if (nodeSchema.parameters) {
      nodeSchema.parameters.forEach((param: any) => {
        if (param.default_value !== undefined) {
          initialParameters[param.name] = param.default_value;
        }
      });
    }
    
    // Calculate position based on node type
    // QueryNode goes on the left, ResponseNode on the right, others in center
    let position: { x: number; y: number };
    const centerY = 250; // Center vertically on canvas
    
    if (isQueryNode) {
      // QueryNode: position on the left
      position = { x: 200, y: centerY };
    } else if (isResponseNode) {
      // ResponseNode: position on the right
      position = { x: 900, y: centerY };
    } else {
      // Other nodes: random position in center area
      position = { x: 400 + Math.random() * 200, y: centerY + (Math.random() - 0.5) * 200 };
    }
    
    const newNode: Node = {
      id: `${nodeType}_${Date.now()}`,
      type: 'custom',
      position,
      data: {
        nodeSchema,
        parameters: initialParameters,
        onDelete: handleNodeDelete
      },
    };

    setNodes(prev => [...prev, newNode]);
    setShowNodeSidebar(false);
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowConfigSidebar(true);
  };

  const handleNodeDelete = (nodeId: string) => {
    // Remove the node
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    // Remove all edges connected to this node
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    // Close config sidebar if this node was selected
    if (selectedNode?.id === nodeId) {
      setShowConfigSidebar(false);
      setSelectedNode(null);
    }
  };

  const handleSaveNodeConfig = (nodeId: string, parameters: Record<string, any>) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...(node.data as any), parameters } }
          : node
      )
    );
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  return {
    // State
    nodesData,
    showNodeSidebar,
    showConfigSidebar,
    selectedNode,
    isExecuting,
    executionResults,
    executingEdges,
    executingNodes,
    loading,
    nodes,
    edges,
    
    // Actions
    setNodes,
    setEdges,
    setShowNodeSidebar,
    setShowConfigSidebar,
    setSelectedNode,
    setIsExecuting,
    setExecutionResults,
    setExecutingEdges,
    setExecutingNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleAddNode,
    handleNodeSelect,
    handleNodeClick,
    handleNodeDelete,
    handleSaveNodeConfig,
    fetchNodes
  };
}
