import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { services, MockStorageManager } from '../services';
import type { Decision, DecisionSnapshot } from '../domain/types';
import { TopicRegistry } from '../topics/registry';
import { Button } from '../core/components/base/Button';
import { Modal } from '../core/components/base/Modal';
import { DecisionBriefCard } from '../core/components/DecisionBriefCard';
import { EmptyState } from '../core/components/base/EmptyState';
import {
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useUIStore } from '../state/uiStore';

export const HistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<
    Array<{ decision: Decision; snapshot: DecisionSnapshot }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSnapshot, setSelectedSnapshot] = useState<DecisionSnapshot | null>(null);
  const { showToast } = useUIStore();

  const loadHistory = async () => {
    setIsLoading(true);
    const userId = MockStorageManager.getInstance().getActiveUserId();
    const items = await services.decision.listDecisionHistory(userId);
    setHistoryItems(items);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (decisionId: string) => {
    if (window.confirm('Delete this decision record?')) {
      await services.decision.deleteDecision(decisionId);
      showToast('Decision record deleted', 'info');
      await loadHistory();
    }
  };

  return (
    <div className="min-h-screen paper-grain pb-24">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8 border-b border-[#EDE6DF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294] block mb-1">
              Archival Longitudinal Ledger
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2233] font-medium tracking-tight">
              My Decision History & Frozen Snapshots
            </h1>
            <p className="text-sm text-[#6E6475] mt-1 max-w-2xl">
              Every decision permanently preserves an immutable copy of your health context, clinical considerations, and open questions at that exact moment.
            </p>
          </div>

          <Link to="/">
            <Button variant="primary" size="sm" className="gap-2">
              <span>Start New Decision</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Content list */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#E07A6B] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#8C8294]">Loading decision records...</p>
          </div>
        ) : historyItems.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-7 h-7 text-[#E07A6B]" />}
            title="No decisions recorded yet"
            description="When you complete the 5-stage decision guide and record your choice, an immutable snapshot will appear here."
            actionLabel="Explore Decision Topics"
            onAction={() => (window.location.href = '/')}
          />
        ) : (
          <div className="space-y-6">
            {historyItems.map(({ decision, snapshot }) => {
              const topic = TopicRegistry.getTopic(decision.topicId);
              const formattedDate = new Date(decision.createdAt).toLocaleDateString(
                undefined,
                { year: 'numeric', month: 'short', day: 'numeric' }
              );

              return (
                <article
                  key={decision.id}
                  className="bg-white rounded-[24px] border border-[#EDE6DF] p-6 sm:p-8 shadow-xs hover:border-[#D8CCC3] transition-all space-y-5"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE6DF] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FBF8F4] border border-[#EDE6DF] flex items-center justify-center text-[#E07A6B]">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-serif text-xl text-[#2B2233] font-medium">
                          {topic?.name || decision.topicId}
                        </h2>
                        <div className="text-xs text-[#8C8294] flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Decided on {formattedDate}</span>
                          <span>·</span>
                          <span className="text-[#9A4638] bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                            Frozen Context v{snapshot.contextVersion}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSnapshot(snapshot)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-[#6E6475] hover:text-[#2B2233] border border-[#EDE6DF] hover:bg-[#FBF8F4] transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#E07A6B]" />
                        <span>View Frozen Brief</span>
                      </button>

                      <Link
                        to={`/journey/${decision.topicId}`}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-[#E07A6B] hover:text-[#9A4638] border border-[#E07A6B]/30 hover:bg-[#FDF8F5] transition-colors"
                      >
                        <span>Open Journey</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDelete(decision.id)}
                        aria-label="Delete decision record"
                        className="p-1.5 text-[#8C8294] hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Decision summary details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#FBF8F4] border border-[#EFEAE4]">
                      <span className="text-[10px] uppercase text-[#8C8294] font-semibold block mb-1">
                        Chosen Direction
                      </span>
                      <p className="font-semibold text-sm text-[#2B2233] capitalize">
                        {decision.choice.replace(/_/g, ' ')}
                      </p>
                      {decision.freeTextReason && (
                        <p className="text-[#6E6475] italic mt-1 leading-normal">
                          “{decision.freeTextReason}”
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-[#FBF8F4] border border-[#EFEAE4]">
                      <span className="text-[10px] uppercase text-[#8C8294] font-semibold block mb-1">
                        Stated Reasons
                      </span>
                      <ul className="space-y-1 text-[#4A3E52]">
                        {decision.reasons.map((r, i) => (
                          <li key={i} className="truncate">
                            · {r.replace(/_/g, ' ')}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FBF8F4] border border-[#EFEAE4] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-[#8C8294] font-semibold block mb-1">
                          Snapshot Integrity
                        </span>
                        <p className="text-[#6E6475]">
                          {snapshot.frozenSummary.knownItems.length} known items ·{' '}
                          {snapshot.frozenUnknowns.length} unknowns preserved
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 mt-2 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Deep frozen & tamper-proof</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Snapshot Brief Modal */}
      <Modal
        isOpen={Boolean(selectedSnapshot)}
        onClose={() => setSelectedSnapshot(null)}
        title="Immutable Frozen Decision Brief"
        maxWidth="4xl"
      >
        {selectedSnapshot && (
          <div className="space-y-4">
            <DecisionBriefCard
              brief={selectedSnapshot.frozenBrief}
              isSnapshot={true}
              snapshotCreatedAt={selectedSnapshot.createdAt}
              contextVersion={selectedSnapshot.contextVersion}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
