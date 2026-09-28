import React from 'react';
import type { ContextFieldDefinition } from '../../domain/types';
import { Slider } from './base/Slider';
import { Check, HelpCircle } from 'lucide-react';

export interface QuestionRendererProps {
  fields: ContextFieldDefinition[];
  answers: Record<string, any>;
  onAnswerChange: (fieldId: string, value: any) => void;
  className?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  fields,
  answers,
  onAnswerChange,
  className = '',
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {fields.map((field) => {
        const rawValue = answers[field.id];
        const isSkipped = rawValue === 'skip' || rawValue === 'unsure' || rawValue === undefined;

        const handleSkipToggle = () => {
          if (rawValue === 'skip') {
            // Undo skip: clear to undefined or default
            onAnswerChange(field.id, field.type === 'slider' ? 3 : undefined);
          } else {
            // Mark skipped
            onAnswerChange(field.id, 'skip');
          }
        };

        return (
          <fieldset
            key={field.id}
            className="border-b border-[#EDE6DF] pb-8 last:border-b-0 last:pb-0"
          >
            {/* Header: Question & Skip toggle */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <legend className="font-serif text-lg sm:text-xl text-[#2B2233] font-medium leading-snug">
                {field.question}
              </legend>

              {field.allowSkip && (
                <button
                  type="button"
                  onClick={handleSkipToggle}
                  className={`text-xs self-start sm:self-auto py-1 px-2.5 rounded-lg transition-colors cursor-pointer shrink-0 font-sans ${
                    rawValue === 'skip'
                      ? 'bg-[#F2A76B]/15 text-[#9A4638] font-medium'
                      : 'text-[#8C8294] hover:text-[#2B2233] hover:bg-[#F4EFEB]'
                  }`}
                >
                  {rawValue === 'skip' ? 'Skipped (Click to answer)' : 'I’m not sure / skip'}
                </button>
              )}
            </div>

            {/* Helper text / context explanation */}
            {field.helperText && (
              <p className="text-xs sm:text-sm text-[#6E6475] mb-4 flex items-start gap-1.5 leading-relaxed">
                <HelpCircle className="w-4 h-4 text-[#A297A8] shrink-0 mt-0.5" />
                <span>{field.helperText}</span>
              </p>
            )}

            {/* Input by field type (if not skipped) */}
            {rawValue === 'skip' ? (
              <div className="p-3 bg-[#FBF8F4] border border-dashed border-[#D8CCC3] rounded-xl text-xs text-[#6E6475] italic">
                You skipped this question. It will be identified in your Decision Brief as an open question to explore with your clinician.
              </div>
            ) : (
              <div>
                {/* Single Select */}
                {field.type === 'single-select' && field.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {field.options.map((opt) => {
                      const isSelected = rawValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onAnswerChange(field.id, opt.value)}
                          className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'bg-[#FDF8F5] border-[#E07A6B] ring-1 ring-[#E07A6B] shadow-xs'
                              : 'bg-white border-[#EDE6DF] hover:border-[#D8CCC3] hover:bg-[#FDFBF9]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-medium ${
                                isSelected ? 'text-[#2B2233]' : 'text-[#4A3E52]'
                              }`}
                            >
                              {opt.label}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-[#E07A6B] text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          {opt.description && (
                            <p className="text-xs text-[#6E6475] mt-1 leading-normal">
                              {opt.description}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Multi Select */}
                {field.type === 'multi-select' && field.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {field.options.map((opt) => {
                      const selectedList: string[] = Array.isArray(rawValue) ? rawValue : [];
                      const isSelected = selectedList.includes(opt.value);

                      const toggleOption = () => {
                        if (isSelected) {
                          onAnswerChange(
                            field.id,
                            selectedList.filter((v) => v !== opt.value)
                          );
                        } else {
                          onAnswerChange(field.id, [...selectedList, opt.value]);
                        }
                      };

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={toggleOption}
                          className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'bg-[#FDF8F5] border-[#E07A6B] ring-1 ring-[#E07A6B] shadow-xs'
                              : 'bg-white border-[#EDE6DF] hover:border-[#D8CCC3] hover:bg-[#FDFBF9]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-sm font-medium ${
                                isSelected ? 'text-[#2B2233]' : 'text-[#4A3E52]'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isSelected
                                  ? 'bg-[#E07A6B] border-[#E07A6B] text-white'
                                  : 'border-[#D8CCC3] bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                          {opt.description && (
                            <p className="text-xs text-[#6E6475] mt-1 leading-normal">
                              {opt.description}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Slider */}
                {field.type === 'slider' && (
                  <div className="bg-white p-5 rounded-2xl border border-[#EDE6DF]">
                    <Slider
                      value={typeof rawValue === 'number' ? rawValue : 3}
                      min={field.min ?? 1}
                      max={field.max ?? 5}
                      step={field.step ?? 1}
                      unit={field.unit}
                      labels={field.sliderLabels}
                      onChange={(val) => onAnswerChange(field.id, val)}
                    />
                  </div>
                )}

                {/* Boolean Flag with Yes / No / Unsure */}
                {field.type === 'boolean-flag' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                      { value: 'unsure', label: 'I am not sure' },
                    ].map((btn) => {
                      const isSelected = rawValue === btn.value;
                      return (
                        <button
                          key={btn.value}
                          type="button"
                          onClick={() => onAnswerChange(field.id, btn.value)}
                          className={`py-3 px-4 rounded-xl border text-center font-medium text-sm transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'bg-[#FDF8F5] border-[#E07A6B] text-[#2B2233] ring-1 ring-[#E07A6B] shadow-xs'
                              : 'bg-white border-[#EDE6DF] text-[#4A3E52] hover:border-[#D8CCC3] hover:bg-[#FDFBF9]'
                          }`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Text input */}
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={rawValue || ''}
                    placeholder={field.placeholder || 'Type here...'}
                    onChange={(e) => onAnswerChange(field.id, e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#EDE6DF] rounded-xl text-sm text-[#2B2233] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A6B]/50 transition-all placeholder:text-[#A297A8]"
                  />
                )}
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
};
