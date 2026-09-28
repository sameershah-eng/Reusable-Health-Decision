import type { TopicConfig } from '../../domain/types';
import { thermageRules } from './rules';

export const thermageConfig: TopicConfig = {
  id: 'thermage',
  name: 'Thermage Radiofrequency Skin Tightening',
  shortDescription:
    'Evaluate non-invasive monopolar radiofrequency for collagen remodeling, skin firmness, and subtle facial contouring with zero downtime.',
  fullDescription:
    'Thermage uses patented monopolar radiofrequency technology to deliver uniform volumetric heating deep into the dermis and subcutaneous tissue, causing immediate collagen fibril contraction followed by progressive neocollagenesis over 3–6 months. This decision support tool helps set realistic clinical expectations.',
  category: 'Aesthetic Dermatology',
  iconName: 'Activity',
  contentVersion: '1.0.0',
  disclaimerOverride:
    'This decision-support tool helps frame aesthetic goals and consultation questions. Thermage outcomes vary significantly based on patient age, baseline skin thickness, and subcutaneous fat distribution. Final suitability must be established with a licensed medical practitioner.',

  fieldGroups: [
    {
      id: 'concerns_area',
      title: 'Target Area & Priorities',
      description: 'Which regions and aesthetic goals are top of mind for you.',
    },
    {
      id: 'skin_profile',
      title: 'Skin Characteristics & Preferences',
      description: 'Baseline elasticity, comfort expectations, and downtime tolerance.',
    },
  ],

  contextFields: [
    {
      id: 'treatment_area',
      groupId: 'concerns_area',
      groupTitle: 'Target Area & Priorities',
      question: 'Which anatomical area are you considering treating?',
      helperText: 'Thermage uses distinct procedural tips engineered for specific anatomical depths.',
      type: 'single-select',
      options: [
        { value: 'lower_face', label: 'Lower face & jawline', description: 'Early jowls and cheek laxity' },
        { value: 'periorbital', label: 'Upper / lower eyelids', description: 'Hooded lids and fine crepiness' },
        { value: 'neck_submental', label: 'Neck & under-chin', description: 'Submental laxity and neck lines' },
        { value: 'body_abdomen', label: 'Abdomen or body', description: 'Post-pregnancy or weight-loss skin loose texture' },
      ],
      allowSkip: true,
      skipValue: 'unsure',
    },
    {
      id: 'laxity_degree',
      groupId: 'skin_profile',
      groupTitle: 'Skin Characteristics & Preferences',
      question: 'How would you rate the current degree of skin laxity in this area?',
      helperText: 'Non-invasive radiofrequency performs most effectively for mild-to-moderate laxity.',
      type: 'slider',
      min: 1,
      max: 5,
      step: 1,
      unit: 'laxity',
      sliderLabels: {
        min: '1 - Very mild, subtle softness',
        mid: '3 - Noticeable loose skin on movement',
        max: '5 - Significant deep sagging / folds',
      },
      allowSkip: true,
      skipValue: null,
    },
    {
      id: 'priorities',
      groupId: 'concerns_area',
      groupTitle: 'Target Area & Priorities',
      question: 'What is your primary treatment objective?',
      helperText: 'Helps balance whether radiofrequency or alternative modalities best suit you.',
      type: 'multi-select',
      options: [
        { value: 'preventive_collagen', label: 'Collagen maintenance & prevention', description: 'Banking collagen in late 30s/40s' },
        { value: 'tighten_jawline', label: 'Crisper jawline & cheek firming', description: 'Subtle non-surgical contour tightening' },
        { value: 'zero_downtime', label: 'Strict zero-downtime requirement', description: 'Cannot afford visible bruising or peeling' },
      ],
      allowSkip: true,
      skipValue: [],
    },
    {
      id: 'pain_sensitivity',
      groupId: 'skin_profile',
      groupTitle: 'Skin Characteristics & Preferences',
      question: 'How sensitive is your tolerance for heat or aesthetic procedure discomfort?',
      helperText: 'Guides discussion of pre-treatment analgesia or vibration levels with your provider.',
      type: 'single-select',
      options: [
        { value: 'low', label: 'Low sensitivity / high tolerance' },
        { value: 'moderate', label: 'Moderate sensitivity' },
        { value: 'high', label: 'High sensitivity / nervous about pain' },
      ],
      allowSkip: true,
      skipValue: 'unsure',
    },
  ],

  perspectives: {
    yourselfPrompts: [
      'Are you seeking subtle, natural skin firming that only you might notice up close, or are you hoping for a dramatic visible lift?',
      'How important is having zero social downtime compared to potentially stronger single-procedure results that require recovery days?',
    ],
    valuesClarifications: [
      {
        id: 'val_expectations',
        prompt: 'Which outcome expectation matches your preference?',
        options: [
          'I prefer subtle, non-surgical maintenance that keeps my skin healthy over time.',
          'I want noticeable tightening, but I refuse to undergo surgery or injections.',
          'I am open to whatever energy-based device provides the highest evidence-backed return.',
        ],
      },
    ],
  },

  decisionOptions: [
    {
      id: 'book_thermage_consult',
      label: 'Book a formal Thermage FLX clinical consultation',
      description: 'Have a physician evaluate laxity in person, verify tip pulse counts, and plan treatment.',
    },
    {
      id: 'explore_alternate_modality',
      label: 'Explore alternative devices (e.g. Ultherapy or RF microneedling)',
      description: 'Consult on whether micro-focused ultrasound or needle delivery better matches skin thickness.',
    },
    {
      id: 'skincare_retinoids_first',
      label: 'Optimize medical-grade skincare (topical retinoids & peptides) first',
      description: 'Strengthen the epidermal moisture barrier and cell turnover before investing in energy devices.',
    },
    {
      id: 'discuss_with_clinician_first',
      label: 'Discuss options with my dermatologist before deciding',
      description: 'Bring the Decision Brief to an aesthetic consultation.',
    },
    {
      id: 'not_decided_yet',
      label: 'Not decided yet (taking time to reflect)',
      description: 'Pause to research and budget before committing.',
    },
  ],

  reasonOptions: [
    { id: 'want_zero_downtime', label: 'Requirement for zero social downtime or bruising' },
    { id: 'single_session_convenience', label: 'Convenience of a single annual session versus multi-visit series' },
    { id: 'subtle_natural_improvement', label: 'Preference for subtle, gradual, natural collagen remodeling' },
    { id: 'unsure_of_device_superiority', label: 'Need physician confirmation on RF vs Ultrasound suitability' },
    { id: 'cost_evaluation', label: 'Need to clarify total treatment package costs with clinic' },
  ],

  observationMetrics: [
    {
      id: 'skin_firmness_rating',
      name: 'Skin Firmness & Elastic Rebound',
      description: 'Tactile bounce and firmness when touching the treated facial area.',
      unit: 'firmness rating',
      scaleMin: 1,
      scaleMax: 5,
      minLabel: '1 - Soft, loose rebound',
      maxLabel: '5 - Tight, firm, resilient bounce',
      higherIsBetter: true,
    },
    {
      id: 'jawline_contour_satisfaction',
      name: 'Jawline & Contour Definition',
      description: 'Visual sharpness along the jaw border and lower cheeks in photos.',
      unit: 'contour score',
      scaleMin: 1,
      scaleMax: 5,
      minLabel: '1 - Soft, undefined jowls',
      maxLabel: '5 - Crisply defined contour',
      higherIsBetter: true,
    },
  ],

  rules: thermageRules,

  copy: {
    contextIntro:
      'Answer a few focused questions on your target aesthetic area and skin goals. Skip any questions you wish.',
    understandIntro:
      'Review clinical radiofrequency evidence, your personal downtime priorities, and anonymized real-patient journeys.',
    decisionIntro:
      'Your Aesthetic Decision Brief summarizes key considerations for your provider. Record your current leaning and tracking metrics.',
    observeIntro:
      'Collagen neocollagenesis develops over 6 to 12 weeks. Simulate your follow-up check-in to observe changes.',
    learnIntro:
      'Reflect on your before-and-after results, track metric shifts, and save a permanent record for your skincare journey.',
    briefSummaryKicker: 'Aesthetic Consultation Brief',
  },
};
