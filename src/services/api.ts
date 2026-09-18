// =============================================================================
// AquaSentinel AI — API Service Layer
// =============================================================================
// Centralized API service. All backend communication goes through this module.
//
// BACKEND INTEGRATION:
// 1. Set VITE_API_BASE_URL in .env to your Python backend URL
// 2. Each function maps to a backend endpoint
// 3. Replace the mock-data fallback in useApiData hook when ready
// =============================================================================

import type {
  ApiResponse,
  DashboardData,
  SensorParameters,
  AnomalyRecord,
  AnomalyResult,
  RiskPrediction,
  EarlyWarning,
  AllSensorHealth,
  HistoricalRecord,
  PaginatedResponse,
  ConnectionStatus,
  SystemSettings,
} from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ─── HTTP Helper ────────────────────────────────────────────────────────────────

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ─── Dashboard ──────────────────────────────────────────────────────────────────

export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
  return fetchApi<DashboardData>('/dashboard');
}

// ─── Water Quality ──────────────────────────────────────────────────────────────

export async function getWaterQuality(
  timeRange?: string
): Promise<ApiResponse<SensorParameters>> {
  const params = timeRange ? `?range=${timeRange}` : '';
  return fetchApi<SensorParameters>(`/water-quality${params}`);
}

// ─── Anomalies ──────────────────────────────────────────────────────────────────

export async function getAnomalies(params?: {
  parameter?: string;
  severity?: string;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<{ summary: AnomalyResult; records: PaginatedResponse<AnomalyRecord> }>> {
  const searchParams = new URLSearchParams();
  if (params?.parameter) searchParams.set('parameter', params.parameter);
  if (params?.severity) searchParams.set('severity', params.severity);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return fetchApi(`/anomalies${query}`);
}

// ─── Risk Prediction ────────────────────────────────────────────────────────────

export async function getRiskPrediction(): Promise<ApiResponse<RiskPrediction>> {
  return fetchApi<RiskPrediction>('/risk-prediction');
}

// ─── Early Warnings ─────────────────────────────────────────────────────────────

export async function getWarnings(params?: {
  severity?: string;
  status?: string;
  parameter?: string;
}): Promise<ApiResponse<EarlyWarning[]>> {
  const searchParams = new URLSearchParams();
  if (params?.severity) searchParams.set('severity', params.severity);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.parameter) searchParams.set('parameter', params.parameter);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return fetchApi<EarlyWarning[]>(`/warnings${query}`);
}

export async function acknowledgeWarning(id: string): Promise<ApiResponse<EarlyWarning>> {
  return fetchApi<EarlyWarning>(`/warnings/${id}/acknowledge`, { method: 'POST' });
}

// ─── Sensor Health ──────────────────────────────────────────────────────────────

export async function getSensorHealth(): Promise<ApiResponse<AllSensorHealth>> {
  return fetchApi<AllSensorHealth>('/sensor-health');
}

// ─── Historical Data ────────────────────────────────────────────────────────────

export async function getHistoricalData(params?: {
  startDate?: string;
  endDate?: string;
  parameter?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}): Promise<ApiResponse<PaginatedResponse<HistoricalRecord>>> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.parameter) searchParams.set('parameter', params.parameter);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params?.search) searchParams.set('search', params.search);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return fetchApi<PaginatedResponse<HistoricalRecord>>(`/historical${query}`);
}

export async function exportHistoricalCsv(params?: {
  startDate?: string;
  endDate?: string;
  parameter?: string;
}): Promise<Blob> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.parameter) searchParams.set('parameter', params.parameter);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const url = `${BASE_URL}/historical/export${query}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Export failed');
  return response.blob();
}

// ─── Connection / Settings ──────────────────────────────────────────────────────

export async function getConnectionStatus(): Promise<ApiResponse<ConnectionStatus>> {
  return fetchApi<ConnectionStatus>('/status');
}

export async function getSettings(): Promise<ApiResponse<SystemSettings>> {
  return fetchApi<SystemSettings>('/settings');
}

export async function updateSettings(
  settings: Partial<SystemSettings>
): Promise<ApiResponse<SystemSettings>> {
  return fetchApi<SystemSettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}
