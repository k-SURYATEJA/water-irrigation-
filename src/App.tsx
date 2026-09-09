import React, { useState, useEffect } from 'react';
import { Sidebar, NavSection } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { FieldModal } from './components/FieldModal.js';
import { OptimizationModal } from './components/OptimizationModal.js';
import { HowItWorksModal } from './components/HowItWorksModal.js';
import { GlossaryModal } from './components/GlossaryModal.js';
import { ViewModeProvider } from './context/ViewModeContext.js';

import { DashboardPage } from './pages/DashboardPage.js';
import { FieldsCropsPage } from './pages/FieldsCropsPage.js';
import { WaterResourcesPage } from './pages/WaterResourcesPage.js';
import { WeatherSoilPage } from './pages/WeatherSoilPage.js';
import { OptimizationPage } from './pages/OptimizationPage.js';
import { SchedulePage } from './pages/SchedulePage.js';
import { WhatIfSimulationPage } from './pages/WhatIfSimulationPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { AlertsPage } from './pages/AlertsPage.js';
import { AboutPage } from './pages/AboutPage.js';

import {
  fetchFields,
  saveField,
  deleteField,
  fetchWaterResources,
  fetchCanals,
  fetchPumps,
  fetchWeather,
  fetchDemandEstimation,
  fetchSchedule,
  runOptimization,
  fetchAlerts,
  acknowledgeAlerts,
  resetDemoData,
} from './services/api.js';

import {
  Field,
  WaterResource,
  Canal,
  Pump,
  WeatherData,
  WaterDemandEstimation,
  OptimizationResult,
  Alert,
  SystemStatus,
} from './types.js';

const AppContent: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [fields, setFields] = useState<Field[]>([]);
  const [waterResources, setWaterResources] = useState<WaterResource[]>([]);
  const [canals, setCanals] = useState<Canal[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [demands, setDemands] = useState<WaterDemandEstimation[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState<boolean>(false);
  const [isOptModalOpen, setIsOptModalOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

  // Compute System Status
  const computeSystemStatus = (): SystemStatus => {
    if (!optimizationResult) return 'Normal';
    const shortage = optimizationResult.metrics.waterShortage;
    const avail = optimizationResult.metrics.totalAvailableWater;
    if (shortage > 2000 || avail < 4000) return 'Critical';
    if (shortage > 0 || avail < 8000) return 'Water Stress';
    return 'Normal';
  };

  const systemStatus = computeSystemStatus();

  // Load Initial Data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [f, wr, c, p, w, d, a] = await Promise.all([
        fetchFields(),
        fetchWaterResources(),
        fetchCanals(),
        fetchPumps(),
        fetchWeather(),
        fetchDemandEstimation(),
        fetchAlerts(),
      ]);

      setFields(f);
      setWaterResources(wr);
      setCanals(c);
      setPumps(p);
      setWeatherMap(w);
      setDemands(d);
      setAlerts(a);

      // Run initial optimization if none exists
      const opt = await runOptimization();
      setOptimizationResult(opt);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handler: Run Quantum Optimization
  const handleRunOptimization = async (options: any = {}) => {
    setIsOptimizing(true);
    setIsOptModalOpen(true);
    try {
      const res = await runOptimization(options);
      setOptimizationResult(res);
      // Reload alerts in case any changed
      const a = await fetchAlerts();
      setAlerts(a);
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handler: Save Field
  const handleSaveField = async (field: Field) => {
    await saveField(field);
    const updated = await fetchFields();
    setFields(updated);
    // Re-run optimization with new field
    const opt = await runOptimization();
    setOptimizationResult(opt);
  };

  // Handler: Delete Field
  const handleDeleteField = async (id: string) => {
    if (confirm(`Are you sure you want to delete field ${id}?`)) {
      await deleteField(id);
      const updated = await fetchFields();
      setFields(updated);
      const opt = await runOptimization();
      setOptimizationResult(opt);
    }
  };

  // Handler: Acknowledge Alerts
  const handleAcknowledgeAlerts = async (id?: string) => {
    await acknowledgeAlerts(id);
    const a = await fetchAlerts();
    setAlerts(a);
  };

  // Handler: Reset Demo Data
  const handleResetData = async () => {
    if (confirm('Reset demo data to original seed values?')) {
      await resetDemoData();
      await loadAllData();
    }
  };

  // Handler: Export CSV
  const handleExportCsv = () => {
    if (!optimizationResult?.schedule) return;
    const headers = ['Time Slot', 'Field ID', 'Crop', 'Water (Liters)', 'Canal', 'Pump', 'Priority', 'Decision', 'Reason', 'Cost (INR)'];
    const rows = optimizationResult.schedule.map((s) => [
      s.timeSlot,
      s.fieldId,
      s.crop,
      s.waterLiters,
      s.canalName,
      s.pumpName,
      s.priority,
      s.decision,
      `"${s.reason}"`,
      s.energyCost,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `irrigation_schedule_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'dashboard':
        return 'Krishna-Godavari Command Dashboard';
      case 'fields':
        return 'Agricultural Fields & Crops';
      case 'resources':
        return 'Water Resources & Conveyance';
      case 'weather':
        return 'Weather & Soil Hydrology';
      case 'optimization':
        return 'Quantum-Inspired QUBO Engine';
      case 'schedule':
        return 'Optimized Irrigation Schedule';
      case 'simulation':
        return 'What-If Climate Simulation';
      case 'analytics':
        return 'Efficiency & Hydraulic Analytics';
      case 'alerts':
        return 'Alerts & Operational Warnings';
      case 'about':
        return 'Architecture & System Documentation';
    }
  };

  const unreadAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        unreadAlertCount={unreadAlertCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          systemStatus={systemStatus}
          metrics={optimizationResult?.metrics || null}
          onRunOptimization={() => handleRunOptimization()}
          onResetData={handleResetData}
          isOptimizing={isOptimizing}
          sectionTitle={getSectionTitle()}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {loading ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">
                  Bootstrapping Krishna-Godavari Hydraulic Models &amp; SQLite State...
                </p>
              </div>
            </div>
          ) : (
            <>
              {currentSection === 'dashboard' && (
                <DashboardPage
                  optimizationResult={optimizationResult}
                  waterResources={waterResources}
                  fields={fields}
                  systemStatus={systemStatus}
                  onNavigateToSchedule={() => setCurrentSection('schedule')}
                  onNavigateToSimulation={() => setCurrentSection('simulation')}
                  onRunOptimization={() => handleRunOptimization()}
                  onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
                />
              )}

              {currentSection === 'fields' && (
                <FieldsCropsPage
                  fields={fields}
                  onAddField={() => {
                    setEditingField(null);
                    setIsFieldModalOpen(true);
                  }}
                  onEditField={(field) => {
                    setEditingField(field);
                    setIsFieldModalOpen(true);
                  }}
                  onDeleteField={handleDeleteField}
                />
              )}

              {currentSection === 'resources' && (
                <WaterResourcesPage
                  resources={waterResources}
                  canals={canals}
                  pumps={pumps}
                />
              )}

              {currentSection === 'weather' && (
                <WeatherSoilPage
                  fields={fields}
                  weatherMap={weatherMap}
                  demands={demands}
                />
              )}

              {currentSection === 'optimization' && (
                <OptimizationPage
                  optimizationResult={optimizationResult}
                  onRunOptimization={handleRunOptimization}
                  isOptimizing={isOptimizing}
                  onNavigateToSchedule={() => setCurrentSection('schedule')}
                />
              )}

              {currentSection === 'schedule' && (
                <SchedulePage
                  schedule={optimizationResult?.schedule || []}
                  onExportCsv={handleExportCsv}
                />
              )}

              {currentSection === 'simulation' && (
                <WhatIfSimulationPage
                  onApplySimulationResult={(res) => setOptimizationResult(res)}
                />
              )}

              {currentSection === 'analytics' && (
                <AnalyticsPage
                  optimizationResult={optimizationResult}
                  fields={fields}
                />
              )}

              {currentSection === 'alerts' && (
                <AlertsPage
                  alerts={alerts}
                  onAcknowledge={handleAcknowledgeAlerts}
                />
              )}

              {currentSection === 'about' && <AboutPage />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <FieldModal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        onSave={handleSaveField}
        initialField={editingField}
      />

      <OptimizationModal
        isOpen={isOptModalOpen}
        onClose={() => setIsOptModalOpen(false)}
        result={optimizationResult}
        onViewSchedule={() => setCurrentSection('schedule')}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ViewModeProvider>
      <AppContent />
    </ViewModeProvider>
  );
};

export default App;
