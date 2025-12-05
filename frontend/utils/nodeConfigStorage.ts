interface NodeConfig {
  nodeId: string;
  parameters: Record<string, any>;
}

// Simple React state management for node configurations
class NodeConfigStorage {
  private static nodeConfigs: Map<string, NodeConfig> = new Map();

  /**
   * Save configuration for a specific node (simple React state update)
   */
  static saveNodeConfig(nodeId: string, parameters: Record<string, any>): void {
    const nodeConfig: NodeConfig = {
      nodeId,
      parameters
    };

    // Store in memory (will be replaced by React state)
    this.nodeConfigs.set(nodeId, nodeConfig);
    console.log(`💾 [CONFIG SAVE] ${nodeId}:`, parameters);
    console.log(`📊 [STATE] Total configs in memory: ${this.nodeConfigs.size}`);
  }

  /**
   * Load configuration for a specific node
   */
  static loadNodeConfig(nodeId: string): NodeConfig | null {
    const config = this.nodeConfigs.get(nodeId);
    if (config) {
      console.log(`📖 [CONFIG LOAD] ${nodeId}:`, config.parameters);
      return config;
    } else {
      console.log(`❌ [CONFIG LOAD] ${nodeId}: No config found`);
      return null;
    }
  }

  /**
   * Get all configurations
   */
  static getAllConfigs(): NodeConfig[] {
    return Array.from(this.nodeConfigs.values());
  }

  /**
   * Clear all configurations
   */
  static clearAllConfigs(): void {
    console.log(`🗑️ [CLEAR] Clearing ${this.nodeConfigs.size} configs`);
    this.nodeConfigs.clear();
  }

  /**
   * Remove configuration for a specific node
   */
  static removeNodeConfig(nodeId: string): void {
    const existed = this.nodeConfigs.has(nodeId);
    this.nodeConfigs.delete(nodeId);
    console.log(`🗑️ [REMOVE] ${nodeId}: ${existed ? 'Removed' : 'Not found'}`);
  }

  /**
   * Initialize configs from workflow data
   */
  static initializeFromWorkflowNodes(nodes: any[]): void {
    console.log(`🔄 [INIT] Initializing from ${nodes.length} nodes`);
    this.clearAllConfigs();

    nodes.forEach((node, index) => {
      if (node.data?.parameters) {
        this.saveNodeConfig(node.id, node.data.parameters);
        console.log(`📥 [NODE ${index + 1}] ${node.id}:`, node.data.parameters);
      }
    });

    console.log(`✅ [INIT] Initialized ${this.nodeConfigs.size} configurations`);
  }
}

// Make debug functions available globally for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugNodeConfigs = () => {
    console.log('🔍 [DEBUG] Current configurations:');
    NodeConfigStorage.getAllConfigs().forEach((config, index) => {
      console.log(`   ${index + 1}. ${config.nodeId}:`, config.parameters);
    });
    console.log(`📊 [DEBUG] Total: ${NodeConfigStorage.getAllConfigs().length} configurations`);
  };
  (window as any).clearNodeConfigs = () => NodeConfigStorage.clearAllConfigs();
  console.log('💡 Debug functions available in console:');
  console.log('   - debugNodeConfigs() - Show all cached configurations');
  console.log('   - clearNodeConfigs() - Clear all cached configurations');
}

export default NodeConfigStorage;
