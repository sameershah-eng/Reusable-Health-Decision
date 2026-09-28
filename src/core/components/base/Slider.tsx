import React from 'react';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  labels?: {
    min: string;
    max: string;
    mid?: string;
  };
  onChange: (val: number) => void;
  disabled?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  unit,
  labels,
  onChange,
  disabled = false,
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#6E6475] font-normal">Intensity / Scale</span>
        <span className="font-serif text-lg font-medium text-[#2B2233] tabular-nums">
          {value}
          <span className="text-xs font-sans text-[#6E6475] font-normal ml-1">
            / {max} {unit}
          </span>
        </span>
      </div>

      <div className="relative py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2.5 bg-[#EDE6DF] rounded-lg appearance-none cursor-pointer accent-[#E07A6B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A6B]/50 transition-all"
          style={{
            background: `linear-gradient(to right, #E07A6B 0%, #F2A76B ${percentage}%, #EDE6DF ${percentage}%, #EDE6DF 100%)`,
          }}
        />
        {/* Step ticks */}
        <div className="flex justify-between px-1 mt-1.5 text-[11px] text-[#A297A8] tabular-nums">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
            <span
              key={num}
              className={`transition-colors ${
                num === value ? 'font-semibold text-[#2B2233]' : ''
              }`}
            >
              {num}
            </span>
          ))}
        </div>
      </div>

      {labels && (
        <div className="flex items-center justify-between text-xs text-[#6E6475] pt-1">
          <span className="max-w-[40%]">{labels.min}</span>
          {labels.mid && <span className="text-center">{labels.mid}</span>}
          <span className="text-right max-w-[40%]">{labels.max}</span>
        </div>
      )}
    </div>
  );
};
