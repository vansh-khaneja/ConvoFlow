import { apiGet, apiPost, ApiResponse } from './config';

export interface CredentialsResponse {
  credentials: string[];
  count: number;
}

export interface SetCredentialPayload {
  key: string;
  value: string;
}

export interface DeleteCredentialPayload {
  key: string;
}

/**
 * Fetch all credentials
 */
export async function getCredentials(): Promise<CredentialsResponse> {
  const response = await apiGet<CredentialsResponse>(`/api/v1/credentials/`);
  return response.success && response.data
    ? response.data
    : { credentials: [], count: 0 };
}

/**
 * Set/update a credential
 */
export async function setCredential(
  payload: SetCredentialPayload
): Promise<ApiResponse<void>> {
  return apiPost<void>(`/api/v1/credentials/set`, payload);
}

/**
 * Delete a credential
 */
export async function deleteCredential(
  payload: DeleteCredentialPayload
): Promise<ApiResponse<void>> {
  return apiPost<void>(`/api/v1/credentials/delete`, payload);
}

