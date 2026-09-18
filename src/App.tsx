import { lazy, Suspense, useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoadingState from './components/LoadingState';
import { useApiData } from './hooks/useApiData';
import { getDashboardData } from './services/api';
import { mockDashboardData } from './data/mockData';
import type { DashboardData } from './types/api';

// Lazy-load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WaterQuality = lazy(() => import('./pages/WaterQuality'));
const AnomalyDetection = lazy(() => import('./pages/AnomalyDetection'));
const RiskPrediction = lazy(() => import('./pages/RiskPrediction'));
const EarlyWarnings = lazy(() => import('./pages/EarlyWarnings'));
const SensorHealth = lazy(() => import('./pages/SensorHealth'));
const HistoricalData = lazy(() => import('./pages/HistoricalData'));
const Settings = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div className="p-6">
      <LoadingState type="card" count={3} />
    </div>
  );
}

export default function App() {
  // Top-level connection check to pass to layout
  const fetchFn = useCallback(() => getDashboardData(), []);
  const { loading, lastUpdated, isUsingMock, refetch } = useApiData<DashboardData>({
    fetchFn,
    mockData: mockDashboardData,
    refreshInterval: 0, // Pages manage their own refresh
  });

  const isConnected = !isUsingMock;

  return (
    <Routes>
      <Route
        element={
          <MainLayout
            isConnected={isConnected}
            isUsingMock={isUsingMock}
            lastUpdated={lastUpdated}
            onRefresh={refetch}
            loading={loading}
          />
        }
      >
        <Route path="/" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="/water-quality" element={<Suspense fallback={<PageLoader />}><WaterQuality /></Suspense>} />
        <Route path="/anomaly-detection" element={<Suspense fallback={<PageLoader />}><AnomalyDetection /></Suspense>} />
        <Route path="/risk-prediction" element={<Suspense fallback={<PageLoader />}><RiskPrediction /></Suspense>} />
        <Route path="/early-warnings" element={<Suspense fallback={<PageLoader />}><EarlyWarnings /></Suspense>} />
        <Route path="/sensor-health" element={<Suspense fallback={<PageLoader />}><SensorHealth /></Suspense>} />
        <Route path="/historical-data" element={<Suspense fallback={<PageLoader />}><HistoricalData /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
      </Route>
    </Routes>
  );
}
