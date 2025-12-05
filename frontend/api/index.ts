/**
 * API Module - Centralized API functions
 * 
 * This module exports all API functions organized by domain:
 * - workflows: Workflow CRUD operations
 * - deployments: Deployment management
 * - credentials: Credential management
 * - templates: Template operations
 * - nodes: Node schema fetching
 */

// Config
export { API_BASE } from './config';
export type { ApiResponse } from './config';

// Workflows
export * from './workflows';

// Deployments
export * from './deployments';

// Credentials
export * from './credentials';

// Templates
export * from './templates';

// Nodes
export * from './nodes';

