import type { TopicConfig } from '../../domain/types';
import { hrtRules } from './rules';

export const hrtConfig: TopicConfig = {
  id: 'hrt',
  name: 'Hormone Replacement Therapy (HRT)',
  shortDescription:
    'Explore personalized considerations for vasomotor symptoms, bone health, sleep, and overall quality of life during the menopausal transition.',
  fullDescription:
    'Hormone Replacement Therapy (also termed Menopausal Hormone Therapy or MHT) replenishes declining estrogen and progesterone levels during perimenopause and postmenopause. This decision-support tool synthesizes clinical evidence, clarifies individual safety profiles, and prepares you for a collaborative conversation with your clinician.',
  category: "Women's Health",
  iconName: 'Sparkles',
  contentVersion: '1.4.0',
  disclaimerOverride:
    'This decision-support tool helps organize your personal health context and questions. It does not provide medical diagnoses or prescriptions. Individual suitability for HRT depends on clinical examination, mammography, and personalized risk evaluation with your physician.',

  fieldGroups: [
    {
      id: 'demographics',
      title: 'Your Stage & Timing',
      description: 'Your age and where you are in the menopausal transition shape how your body interacts with hormones.',
    },
    {
      id: 'symptoms',
      title: 'Current Symptoms & Intensity',
      description: 'The nature and severity of symptoms determine the expected therapeutic benefits of therapy.',
    },
    {
      id: 'history',
      title: 'Health & Medical Background',
      description: 'Specific personal and family medical history points guide the safest routes and formulations.',
    },
    {
      id: 'priorities',
      title: 'Personal Priorities & Concerns',
      description: 'What matters most to your wellbeing, day-to-day comfort, and peace of mind right now.',
    },
  ],

  contextFields: [
    // Group 1: Stage & Timing
    {
      id: 'age_range',
      groupId: 'demographics',
      groupTitle: 'Your Stage & Timing',
      question: 'What is your current age range?',
      helperText:
        'Evidence suggests the benefit-risk balance is most favorable when HRT is started under age 60 or within 10 years of menopause.',
      type: 'single-select',
      options: [
        { value: 'under_45', label: 'Under 45 years', description: 'Early or premature transition context' },
        { value: '45_49', label: '45 – 49 years', description: 'Common perimenopausal window' },
        { value: '50_54', label: '50 – 54 years', description: 'Median age of natural menopause' },
        { value: '55_59', label: '55 – 59 years', description: 'Late transition / early postmenopause' },
        { value: '60_plus', label: '60 years or older', description: 'Initiation requires nuanced cardiovascular review' },
      ],
      allowSkip: true,
      skipValue: 'unsure',
    },
    {
      id: 'menopause_stage',
      groupId: 'demographics',
      groupTitle: 'Your Stage & Timing',
      question: 'Which best describes your menstrual cycle or menopause stage?',
      helperText:
        'Perimenopause involves fluctuating hormone levels; postmenopause is defined after 12 consecutive months without a period.',
      type: 'single-select',
      options: [
        { value: 'perimenopause', label: 'Perimenopause', description: 'Irregular cycles, cycle length variations, emerging symptoms' },
        { value: 'post_early', label: 'Early Postmenopause', description: 'No periods for 1 to 5 years' },
        { value: 'post_late', label: 'Later Postmenopause', description: 'More than 5–10 years since final period' },
        { value: 'surgical', label: 'Surgical or Induced Menopause', description: 'Ovaries removed surgically, or induced by chemotherapy/radiation' },
      ],
      allowSkip: true,
      skipValue: 'unsure',
    },

    // Group 2: Symptoms
    {
      id: 'main_symptoms',
      groupId: 'symptoms',
      groupTitle: 'Current Symptoms & Intensity',
      question: 'Which symptoms are currently most noticeable or bothersome?',
      helperText: 'Select all that apply. This helps tailor relevant research and observation metrics.',
      type: 'multi-select',
      options: [
        { value: 'hot_flashes', label: 'Hot flashes & sudden flushes', description: 'Sudden sensations of intense heat' },
        { value: 'night_sweats', label: 'Night sweats & drenching chills', description: 'Nocturnal sweats disrupting rest' },
        { value: 'sleep_disruption', label: 'Difficulty falling or staying asleep', description: 'Frequent awakenings or restlessness' },
        { value: 'mood_changes', label: 'Mood swings, irritability, or anxiety', description: 'Emotional volatility or lower resilience' },
        { value: 'brain_fog', label: 'Brain fog & forgetfulness', description: 'Word retrieval or concentration difficulty' },
        { value: 'joint_pain', label: 'Joint stiffness & muscle aches', description: 'Aching in hands, knees, or hips' },
        { value: 'vaginal_dryness', label: 'Vaginal dryness or painful intimacy', description: 'Genitourinary discomfort or stinging' },
        { value: 'energy_loss', label: 'Persistent daytime fatigue', description: 'Depleted energy despite rest' },
      ],
      allowSkip: true,
      skipValue: [],
    },
    {
      id: 'symptom_severity',
      groupId: 'symptoms',
      groupTitle: 'Current Symptoms & Intensity',
      question: 'Overall, how significantly do these symptoms interfere with your daily life?',
      helperText: 'Rate how much your symptoms disrupt your work, sleep, relationships, or daily energy.',
      type: 'slider',
      min: 1,
      max: 5,
      step: 1,
      unit: 'intensity',
      sliderLabels: {
        min: '1 - Mild, manageable',
        mid: '3 - Moderate, noticeable daily',
        max: '5 - Severe, deeply disruptive',
      },
      allowSkip: true,
      skipValue: null,
    },

    // Group 3: Medical Background
    {
      id: 'intact_uterus',
      groupId: 'history',
      groupTitle: 'Health & Medical Background',
      question: 'Do you have an intact uterus (no hysterectomy)?',
      helperText:
        'Crucial for safety: having a uterus means estrogen must be paired with progesterone to protect the endometrial lining.',
      type: 'boolean-flag',
      options: [
        { value: 'yes', label: 'Yes, I have an intact uterus' },
        { value: 'no', label: 'No, I have had a hysterectomy' },
        { value: 'unsure', label: 'Not sure / partial surgery' },
      ],
      allowSkip: true,
      skipValue: 'unsure',
    },
    {
      id: 'history_clots',
      groupId: 'history',
      groupTitle: 'Health & Medical Background',
      question: 'Do you have a personal or immediate family history of deep vein thrombosis (DVT) or pulmonary embolism?',
      helperText:
        'A history of blood clots strongly favors transdermal delivery routes (patches or gels) over oral tablets.',
      type: 'boolean-flag',
      options: [
        { value: 'no', label: 'No history of blood clots' },
        { value: 'yes', label: 'Yes, personal or family history' },
        { value: 'unsure', label: 'I am not sure' },
      ],
      allowSkip: true,
      skipValue: 'unsure',
    },
    {
      id: 'history_breast_cancer',
      groupId: 'history',
      groupTitle: 'Health & Medical Background',
      question: 'Do you have a personal history of breast cancer or high-risk genetic mutations (e.g. BRCA1/2)?',
      helperText:
        'Personal hormone-sensitive cancer history typically precludes systemic HRT, though localized or non-hormonal solutions exist.',
      type: 'boolean-flag',
      options: [
        { value: 'no', label: 'No history or known high risk' },
        { value: 'yes', label: 'Yes, personal history or mutation' },
        { value: 'unsure', label: 'Not sure / family only' },
      ],
      allowSkip: true,
      skipValue: 'unsure',
    },
    {
      id: 'unexplained_bleeding',
      groupId: 'history',
      groupTitle: 'Health & Medical Background',
      question: 'Have you had any unexplained or abnormal vaginal bleeding recently?',
      helperText:
        'Unscheduled bleeding must be investigated by ultrasound or biopsy before initiating any hormone regimen.',
      type: 'boolean-flag',
      options: [
        { value: 'no', label: 'No unexplained bleeding' },
        { value: 'yes', label: 'Yes, unexplained spotting or bleeding' },
        { value: 'unsure', label: 'Not sure / hard to distinguish from cycles' },
      ],
      allowSkip: true,
      skipValue: 'unsure',
    },

    // Group 4: Priorities and Concerns
    {
      id: 'priorities',
      groupId: 'priorities',
      groupTitle: 'Personal Priorities & Concerns',
      question: 'What are your primary health priorities right now?',
      helperText: 'Select up to 3 goals that matter most to you.',
      type: 'multi-select',
      options: [
        { value: 'symptom_relief', label: 'Rapid symptom relief', description: 'Calming hot flashes and nocturnal flushes' },
        { value: 'restorative_sleep', label: 'Restorative sleep', description: 'Unbroken nighttime rest and waking refreshed' },
        { value: 'bone_protection', label: 'Long-term bone density', description: 'Preventing osteoporosis and fragility fractures' },
        { value: 'mental_clarity', label: 'Cognitive clarity & focus', description: 'Minimizing brain fog and memory pauses' },
        { value: 'intimacy_comfort', label: 'Pelvic & intimacy comfort', description: 'Pain-free intimacy and bladder comfort' },
        { value: 'emotional_calm', label: 'Mood stability', description: 'Reclaiming emotional equilibrium and patience' },
      ],
      allowSkip: true,
      skipValue: [],
    },
    {
      id: 'concerns',
      groupId: 'priorities',
      groupTitle: 'Personal Priorities & Concerns',
      question: 'What are your main concerns or hesitations about HRT?',
      helperText: 'Acknowledging concerns ensures your consultation addresses your genuine uncertainties.',
      type: 'multi-select',
      options: [
        { value: 'cancer_risk', label: 'Breast cancer risk', description: 'Concerns about elevated oncologic risk' },
        { value: 'blood_clots', label: 'Thrombosis or stroke', description: 'Concerns about clotting or vascular events' },
        { value: 'side_effects', label: 'Unpleasant side effects', description: 'Bloating, breast tenderness, or spotting' },
        { value: 'dependency', label: 'Stopping or dependency', description: 'Worry about what happens when tapering off' },
        { value: 'natural_approach', label: 'Desire for natural alternatives', description: 'Preference for non-pharmaceutical options' },
        { value: 'cost_access', label: 'Cost & specialist access', description: 'Out-of-pocket costs or finding a certified provider' },
      ],
      allowSkip: true,
      skipValue: [],
    },
  ],

  perspectives: {
    yourselfPrompts: [
      'Reflecting on your priorities, how much of your current lifestyle or work is actively constrained by these symptoms?',
      'If you could experience a 70% reduction in your most bothersome symptom within 4 weeks, what daily activities would feel easier?',
      'What feels more comfortable to you: starting with the lowest effective dose for a defined trial period (e.g., 3 months), or exhausting non-hormonal measures first?',
    ],
    valuesClarifications: [
      {
        id: 'val_philosophy',
        prompt: 'Which health philosophy aligns closest to your intuition today?',
        options: [
          'I value biological replenishment to feel like myself and protect future bone health.',
          'I prefer to let my body navigate natural transitions with gentle lifestyle support.',
          'I want evidence-based symptom relief, using the lowest effective dose with regular check-ins.',
        ],
      },
      {
        id: 'val_risk_appetite',
        prompt: 'How do you weigh potential medication side effects against your current symptom burden?',
        options: [
          'My symptoms are disruptive enough that I am comfortable accepting small, well-quantified risks for relief.',
          'I am cautious; I need substantial reassurances and clear monitoring guidelines before trying anything.',
          'I am undecided and want my clinician to explain the numbers directly to me.',
        ],
      },
    ],
  },

  decisionOptions: [
    {
      id: 'start_systemic_hrt',
      label: 'Start systemic HRT (transdermal patch/gel + progesterone if indicated)',
      description:
        'Initiate low-dose systemic therapy for comprehensive relief of vasomotor, sleep, and bone symptoms with a planned 3-month review.',
    },
    {
      id: 'start_vaginal_estrogen_only',
      label: 'Start localized vaginal estrogen therapy only',
      description:
        'Target genitourinary symptoms, dryness, or urinary discomfort directly without systemic hormone levels.',
    },
    {
      id: 'try_non_hormonal_meds',
      label: 'Try non-hormonal medical prescriptions (e.g. fezolinetant, low-dose SSRI/SNRI)',
      description:
        'Address hot flashes and sleep disruption using modern non-hormonal pharmaceuticals.',
    },
    {
      id: 'lifestyle_and_monitoring',
      label: 'Focus on lifestyle modifications and monitor symptoms for 3 months',
      description:
        'Adopt targeted resistance training, temperature management, and sleep hygiene before considering prescriptions.',
    },
    {
      id: 'discuss_with_clinician_first',
      label: 'Discuss options with my clinician before deciding',
      description:
        'Bring the Decision Brief to an appointment, review mammography or lab results, and finalize together.',
    },
    {
      id: 'not_decided_yet',
      label: 'Not decided yet (taking more time to reflect)',
      description:
        'Pause and digest the evidence and personal reflections without rushing into a choice today.',
    },
  ],

  reasonOptions: [
    { id: 'frequent_vasomotor', label: 'Severe hot flashes or night sweats disrupting daily function', category: 'Symptom Relief' },
    { id: 'chronic_insomnia', label: 'Chronic sleep disruption and daytime exhaustion', category: 'Symptom Relief' },
    { id: 'bone_density_concern', label: 'Desire to preserve bone density and prevent osteopenia', category: 'Preventative Health' },
    { id: 'cognitive_fog', label: 'Brain fog affecting focus, memory, and workplace performance', category: 'Cognition' },
    { id: 'genitourinary_comfort', label: 'Need for relief from vaginal dryness or pain with intimacy', category: 'Quality of Life' },
    { id: 'family_history_caution', label: 'Family health history requires detailed specialist review', category: 'Safety' },
    { id: 'desire_lowest_intervention', label: 'Preference to explore non-pharmacological approaches first', category: 'Values' },
    { id: 'awaiting_mammogram', label: 'Need to complete scheduled mammogram or pelvic ultrasound first', category: 'Diagnostics' },
  ],

  observationMetrics: [
    {
      id: 'hot_flash_frequency',
      name: 'Hot Flash & Night Sweat Frequency',
      description: 'Daily occurrences and disruption from sudden heat flushes or sweats.',
      unit: 'daily frequency rating',
      scaleMin: 1,
      scaleMax: 5,
      minLabel: '1 - None or negligible',
      maxLabel: '5 - 8+ intense episodes per day',
      higherIsBetter: false,
    },
    {
      id: 'sleep_quality',
      name: 'Sleep Restfulness & Duration',
      description: 'Quality of overnight rest and ease of falling/staying asleep.',
      unit: 'restfulness score',
      scaleMin: 1,
      scaleMax: 5,
      minLabel: '1 - Broken, wake exhausted',
      maxLabel: '5 - Deep, restorative, unbroken',
      higherIsBetter: true,
    },
    {
      id: 'daytime_energy',
      name: 'Daytime Energy & Vitality',
      description: 'Physical stamina and afternoon vitality to engage in daily routines.',
      unit: 'energy level',
      scaleMin: 1,
      scaleMax: 5,
      minLabel: '1 - Profound fatigue',
      maxLabel: '5 - Vibrant, sustained energy',
      higherIsBetter: true,
    },
    {
      id: 'mood_stability',
      name: 'Mood & Emotional Resilience',
      description: 'Sense of calm, emotional stability, and resilience under everyday stress.',
      unit: 'calm score',
      scaleMin: 1,
      scaleMax: 5,
      minLabel: '1 - Anxious, highly reactive',
      maxLabel: '5 - Calm, balanced, resilient',
      higherIsBetter: true,
    },
    {
      id: 'intimacy_comfort',
      name: 'Pelvic & Intimacy Comfort',
      description: 'Absence of dryness, stinging, burning, or discomfort during intimate moments.',
      unit: 'comfort score',
      scaleMin: 1,
      scaleMax: 5,
      minLabel: '1 - Severe pain / dryness',
      maxLabel: '5 - Completely comfortable',
      higherIsBetter: true,
    },
  ],

  rules: hrtRules,

  copy: {
    contextIntro:
      'Answer a few calm questions about your symptoms, personal health history, and what matters most right now. Skip any question you prefer not to answer.',
    understandIntro:
      'We have synthesized your background against published clinical evidence. Explore how your priorities look, what randomized studies tell us, and how other women have navigated similar choices.',
    decisionIntro:
      'Here is your printable Decision Brief. Review your open questions for your doctor, record your current leaning, and choose metrics you want to observe over time.',
    observeIntro:
      'Tracking how your symptoms evolve provides clear feedback. Simulate a 6-week follow-up to record your progress and see how your snapshot preserves your original baseline.',
    learnIntro:
      'Compare your baseline to where you are today. See visual metric shifts, record what you have learned, and save a permanent Learning Record for future healthcare discussions.',
    briefSummaryKicker: 'Personal Health Context Brief',
  },
};
