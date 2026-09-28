import React, { useState } from 'react';
import { useJourneyStore } from '../../state/journeyStore';
import { useUIStore } from '../../state/uiStore';
import { MockStorageManager } from '../../services/mock';
import { SEED_PERSONAS } from '../../data/seed/personas';
import {
  Wrench,
  X,
  RotateCcw,
  FastForward,
  Download,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  ChevronUp,
} from 'lucide-react';
import { Button } from './base/Button';

export const DemoToolsDrawer: React.FC = () => {
  const {
    demoDrawerOpen,
    setDemoDrawerOpen,
    apiMode,
    toggleApiMode,
    showToast,
  } = useUIStore();

  const {
    topicId,
    loadPersonaSeed,
    simulateFollowUpTime,
    resetAllJourneyData,
    decision,
  } = useJourneyStore();

  const [activePersonaId, setActivePersonaId] = useState<string>('');

  const handleSelectPersona = async (personaId: string) => {
    setActivePersonaId(personaId);
    await loadPersonaSeed(personaId);
    const p = SEED_PERSONAS.find((s) => s.id === personaId);
    showToast(`Loaded Persona: ${p?.name}`, 'success');
  };

  const handleExportJson = () => {
    const data = MockStorageManager.getInstance().getRawData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clara_health_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('All journey data exported as JSON', 'info');
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo data back to default synthetic seeds?')) {
      await resetAllJourneyData();
      showToast('All state reset to default synthetic personas', 'info');
    }
  };

  const handleAdvanceFollowUp = async () => {
    if (!decision) {
      showToast('Please make or load a decision before simulating follow-up', 'warning');
      return;
    }
    await simulateFollowUpTime(42);
    showToast('Clock advanced +6 weeks for follow-up observation', 'success');
  };

  return (
    <aside aria-label="Reviewer demo tools" className="no-print fixed bottom-4 right-4 z-40">
      {/* Collapsed Pill Button */}
      {!demoDrawerOpen && (
        <button
          onClick={() => setDemoDrawerOpen(true)}
          className="flex items-center gap-2 py-2 px-3.5 bg-[#2B2233] text-white rounded-full shadow-lg hover:bg-[#3D3048] active:scale-95 transition-all text-xs font-medium cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5 text-[#F2A76B]" />
          <span>Demo Tools</span>
          <ChevronUp className="w-3.5 h-3.5 text-[#EDE6DF]/70" />
        </button>
      )}

      {/* Expanded Floating Drawer */}
      {demoDrawerOpen && (
        <div className="w-80 sm:w-96 bg-white border border-[#EDE6DF] rounded-2xl shadow-2xl p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EDE6DF] pb-3">
            <div className="flex items-center gap-2 font-medium text-sm text-[#2B2233]">
              <Wrench className="w-4 h-4 text-[#E07A6B]" />
              <span>Reviewer & Test Scenarios</span>
            </div>
            <button
              onClick={() => setDemoDrawerOpen(false)}
              className="p-1 text-[#8C8294] hover:text-[#2B2233] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: 4 Synthetic Persona Seeds */}
          <div className="space-y-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#8C8294] block">
              Load Seed Persona
            </span>
            <div className="space-y-1.5">
              {SEED_PERSONAS.map((p) => {
                const isSelected = activePersonaId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FDF8F5] border-[#E07A6B] text-[#2B2233] font-medium'
                        : 'bg-[#FBF8F4] border-[#EDE6DF] hover:bg-white text-[#4A3E52]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs">{p.label}</span>
                      <span className="text-[10px] uppercase text-[#8C8294]">
                        {p.topicId.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E6475] mt-0.5 leading-snug">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Quick Action Controls */}
          <div className="space-y-2 pt-2 border-t border-[#EDE6DF]">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#8C8294] block">
              Quick Actions
            </span>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAdvanceFollowUp}
                className="gap-1.5 text-[11px]"
              >
                <FastForward className="w-3.5 h-3.5 text-[#E07A6B]" />
                <span>Simulate +6 wks</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportJson}
                className="gap-1.5 text-[11px]"
              >
                <Download className="w-3.5 h-3.5 text-[#8FB39A]" />
                <span>Export JSON</span>
              </Button>
            </div>

            <Button
              variant="subtle"
              size="sm"
              onClick={handleResetData}
              className="w-full gap-1.5 text-[11px] text-rose-700 hover:text-rose-800 hover:bg-rose-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all data to default seed</span>
            </Button>
          </div>

          {/* Section 3: API Mode Toggle */}
          <div className="pt-2 border-t border-[#EDE6DF] flex items-center justify-between text-xs">
            <span className="text-[#6E6475]">API Provider Mode:</span>
            <button
              onClick={toggleApiMode}
              className="flex items-center gap-1.5 font-medium px-2 py-1 rounded bg-[#F4EFEB] hover:bg-[#EAE4DC] transition-colors cursor-pointer text-[#2B2233]"
            >
              {apiMode === 'mock' ? (
                <>
                  <ToggleLeft className="w-4 h-4 text-[#8FB39A]" />
                  <span>Mock (localStorage)</span>
                </>
              ) : (
                <>
                  <ToggleRight className="w-4 h-4 text-[#E07A6B]" />
                  <span>HTTP Fetch Stubs</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
