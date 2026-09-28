import React, { useState } from 'react';
import type {
  TopicConfig,
  UserContext,
  EvidenceItem,
  ExperienceStory,
  ContextSummary,
} from '../../domain/types';
import { EvidenceCard } from './EvidenceCard';
import { StoryCard } from './StoryCard';
import { Sparkles, Compass, Users } from 'lucide-react';

export interface PerspectiveTabsProps {
  topic: TopicConfig;
  userContext: UserContext;
  summary: ContextSummary;
  evidence: EvidenceItem[];
  stories: ExperienceStory[];
  className?: string;
}

export const PerspectiveTabs: React.FC<PerspectiveTabsProps> = ({
  topic,
  summary,
  evidence,
  stories,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'yourself' | 'science' | 'others'>('yourself');
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'benefit' | 'risk' | 'uncertainty'>('all');
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({});

  const filteredEvidence = evidence.filter((item) => {
    if (evidenceFilter === 'all') return true;
    return item.category === evidenceFilter;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Segmented Control */}
      <div className="flex p-1.5 bg-[#EFEAE4]/70 rounded-2xl border border-[#EDE6DF] max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('yourself')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'yourself'
              ? 'bg-white text-[#2B2233] shadow-xs'
              : 'text-[#6E6475] hover:text-[#2B2233]'
          }`}
        >
          <Compass className="w-4 h-4 text-[#E07A6B]" />
          <span>1. Yourself (Values)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('science')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'science'
              ? 'bg-white text-[#2B2233] shadow-xs'
              : 'text-[#6E6475] hover:text-[#2B2233]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#8FB39A]" />
          <span>2. Science (Evidence)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('others')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'others'
              ? 'bg-white text-[#2B2233] shadow-xs'
              : 'text-[#6E6475] hover:text-[#2B2233]'
          }`}
        >
          <Users className="w-4 h-4 text-[#B8A4E3]" />
          <span>3. Others (Stories)</span>
        </button>
      </div>

      {/* Tab 1: Yourself */}
      {activeTab === 'yourself' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Reflection Hero Banner */}
          <div className="bg-gradient-to-br from-[#FBF8F4] via-white to-[#F9F4EE] rounded-[20px] p-6 sm:p-8 border border-[#EDE6DF] shadow-xs">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294] block mb-2">
              Reflective Mirror
            </span>
            <h3 className="font-serif text-2xl text-[#2B2233] font-medium leading-snug mb-3">
              Reflecting your values & daily priorities back to you
            </h3>
            <p className="text-sm text-[#6E6475] max-w-2xl leading-relaxed">
              Medical choices are never just about numbers; they are about how you want your daily life and peace of mind to feel. Here is what stands out from your context.
            </p>

            {/* User priorities reflection cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-5 rounded-2xl bg-white border border-[#EFEAE4]">
                <h4 className="text-xs uppercase tracking-wider text-[#E07A6B] font-semibold mb-2">
                  What You Emphasized Most
                </h4>
                {summary.priorities.length > 0 ? (
                  <ul className="space-y-1.5 text-sm text-[#2B2233]">
                    {summary.priorities.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E07A6B]" />
                        <span>{p.replace(/_/g, ' ')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#8C8294] italic">
                    No specific priorities selected yet. You can update this anytime.
                  </p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EFEAE4]">
                <h4 className="text-xs uppercase tracking-wider text-[#6E6475] font-semibold mb-2">
                  Hesitations & Considerations
                </h4>
                {summary.concerns.length > 0 ? (
                  <ul className="space-y-1.5 text-sm text-[#2B2233]">
                    {summary.concerns.map((c, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C8294]" />
                        <span>{c.replace(/_/g, ' ')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#8C8294] italic">
                    No particular concerns flagged.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Prompts for reflection */}
          <div className="space-y-4">
            <h4 className="font-serif text-xl text-[#2B2233] font-medium">
              Guided Reflection Prompts
            </h4>
            <p className="text-xs text-[#6E6475]">
              These prompts help you formulate thoughts before entering the Decision stage. You can jot down brief thoughts for yourself.
            </p>

            <div className="space-y-4">
              {topic.perspectives.yourselfPrompts.map((prompt, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-[#EDE6DF] space-y-3"
                >
                  <p className="text-sm font-medium text-[#2B2233] leading-relaxed">
                    <span className="font-serif text-base text-[#E07A6B] mr-2">
                      {idx + 1}.
                    </span>
                    {prompt}
                  </p>
                  <textarea
                    rows={2}
                    placeholder="Your private reflection notes (optional)..."
                    value={reflectionAnswers[idx] || ''}
                    onChange={(e) =>
                      setReflectionAnswers({ ...reflectionAnswers, [idx]: e.target.value })
                    }
                    className="w-full text-xs sm:text-sm p-3 bg-[#FBF8F4] border border-[#E8DFD8] rounded-xl text-[#2B2233] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A6B]/50 resize-y"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Science */}
      {activeTab === 'science' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Evidence Category Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#EDE6DF]">
            <div>
              <h3 className="font-serif text-xl text-[#2B2233] font-medium">
                Clinical Evidence Synthesis
              </h3>
              <p className="text-xs text-[#6E6475] mt-0.5">
                Neutral, peer-reviewed study conclusions with graded certainty levels.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#F4EFEB] rounded-xl text-xs">
              {(
                [
                  { id: 'all', label: 'All Findings' },
                  { id: 'benefit', label: 'Benefits' },
                  { id: 'risk', label: 'Risks' },
                  { id: 'uncertainty', label: 'Uncertainties' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setEvidenceFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    evidenceFilter === f.id
                      ? 'bg-white text-[#2B2233] font-medium shadow-xs'
                      : 'text-[#6E6475] hover:text-[#2B2233]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Evidence Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredEvidence.map((item) => (
              <EvidenceCard key={item.id} item={item} />
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#FBF8F4] border border-[#EDE6DF] text-xs text-[#8C8294] text-center">
            All citations refer to synthetic summaries of real medical consensus guidelines (NAMS, Endocrine Society, Cochrane, BMS).
          </div>
        </div>
      )}

      {/* Tab 3: Others */}
      {activeTab === 'others' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-serif text-xl text-[#2B2233] font-medium">
              Illustrative Journeys of Others
            </h3>
            <p className="text-xs text-[#6E6475] mt-0.5">
              Read how women with different situations, risk appetites, and goals weighed their options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
