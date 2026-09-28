import React from 'react';
import { Link } from 'react-router-dom';
import { TopicRegistry } from '../topics/registry';
import { ShieldAlert, ArrowRight, Sparkles, Activity, CheckCircle2, BookOpen } from 'lucide-react';

export const HomePage: React.FC = () => {
  const topics = TopicRegistry.listTopics();

  return (
    <div className="min-h-screen paper-grain pb-20">
      {/* Calm, Non-Alarming Top Disclaimer */}
      <div className="bg-[#FAF4EE] border-b border-[#EFE5DC] py-3 px-4 text-center text-xs text-[#6E6475]">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#E07A6B] shrink-0" />
          <span>
            <strong>Calm Health Notice:</strong> This tool supports your thinking. It does not give medical advice. Talk to your clinician before making health decisions.
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 text-center space-y-6">
        <span className="text-xs uppercase tracking-widest font-semibold text-[#8C8294] block">
          Evidence-Grounded Healthcare Architecture
        </span>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#2B2233] font-normal tracking-tight max-w-3xl mx-auto leading-[1.15]">
          A calm space to think through your health decisions
        </h1>

        <p className="text-base sm:text-lg text-[#6E6475] max-w-2xl mx-auto leading-relaxed font-sans">
          Clara provides a structured 5-stage framework for women weighing health and aesthetic transitions. Organize your symptoms, synthesize peer-reviewed evidence, and prepare a collaborative brief for your doctor.
        </p>

        {/* Quiet 3-point framework principles */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6E6475]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#8FB39A]" /> No medical prescriptions or chatbots
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#8FB39A]" /> Immutable clinical snapshots
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#8FB39A]" /> Longitudinal follow-up tracking
          </span>
        </div>
      </section>

      {/* Topic Picker Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-8 border-b border-[#EDE6DF] pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2233] font-medium">
              Select a Decision Topic
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6475] mt-1">
              Every topic runs on the same agnostic 5-stage engine.
            </p>
          </div>
          <span className="text-xs text-[#8C8294]">
            {topics.length} Configured Topics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {topics.map((t) => {
            const isHrt = t.id === 'hrt';
            return (
              <div
                key={t.id}
                className="bg-white rounded-[24px] border border-[#EDE6DF] shadow-[0_4px_20px_rgba(43,34,51,0.03)] hover:shadow-[0_8px_30px_rgba(43,34,51,0.06)] hover:border-[#D8CCC3] transition-all duration-300 p-7 sm:p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294]">
                      {t.category}
                    </span>
                    <span className="text-[11px] text-[#A297A8]">
                      v{t.contentVersion}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FBF8F4] to-[#F4EFEB] flex items-center justify-center text-[#E07A6B] border border-[#EDE6DF]">
                    {isHrt ? (
                      <Sparkles className="w-6 h-6 text-[#E07A6B]" />
                    ) : (
                      <Activity className="w-6 h-6 text-[#8FB39A]" />
                    )}
                  </div>

                  <h3 className="font-serif text-2xl text-[#2B2233] font-medium leading-snug">
                    {t.name}
                  </h3>

                  <p className="text-sm text-[#6E6475] leading-relaxed">
                    {t.shortDescription}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2 text-xs text-[#8C8294]">
                    <span>{t.contextFields.length} structured inputs</span>
                    <span>·</span>
                    <span>{t.decisionOptions.length} choice paths</span>
                    <span>·</span>
                    <span>{t.observationMetrics.length} tracking metrics</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EDE6DF]">
                  <Link
                    to={`/journey/${t.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-[#E07A6B] to-[#F2A76B] hover:brightness-105 active:scale-98 transition-all shadow-xs"
                  >
                    <span>Begin Decision Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5-Stage Stepper Explanation Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="bg-white rounded-[24px] border border-[#EDE6DF] p-8 sm:p-10 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8294]">
              How It Works
            </span>
            <h3 className="font-serif text-3xl text-[#2B2233] font-medium">
              The 5-Stage Longitudinal Journey
            </h3>
            <p className="text-sm text-[#6E6475]">
              Designed around how human beings actually make and learn from health decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-4">
            {[
              {
                step: '01',
                title: 'Context',
                desc: 'Enter symptoms & history with complete freedom to skip any field.',
              },
              {
                step: '02',
                title: 'Understand',
                desc: 'See unknowns identified softly alongside randomized evidence & stories.',
              },
              {
                step: '03',
                title: 'Decision',
                desc: 'Generate a printable clinician brief and freeze your baseline snapshot.',
              },
              {
                step: '04',
                title: 'Observe',
                desc: 'Advance a mock clock (+6 wks) to record follow-up metrics.',
              },
              {
                step: '05',
                title: 'Learn',
                desc: 'Compare before-and-after deltas with Recharts visuals & reflection prompts.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="p-4 rounded-xl bg-[#FBF8F4] border border-[#EFEAE4] space-y-2"
              >
                <span className="font-serif font-semibold text-lg text-[#E07A6B]">
                  {s.step}
                </span>
                <h4 className="font-serif font-medium text-base text-[#2B2233]">
                  {s.title}
                </h4>
                <p className="text-xs text-[#6E6475] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
