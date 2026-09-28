import type { EvidenceItem, ExperienceStory } from '../../domain/types';

export const hrtEvidence: EvidenceItem[] = [
  {
    id: 'hrt_ev_vasomotor',
    topicId: 'hrt',
    category: 'benefit',
    title: 'Hot flash and night sweat frequency reduction',
    summary:
      'Systemic estrogen therapy reduces vasomotor symptom frequency by approximately 75% to 85% and significantly dampens severity.',
    detailedBody:
      'Multiple randomized double-blind placebo-controlled trials and meta-analyses demonstrate that transdermal and oral estrogen provide rapid, clinically robust reduction in vasomotor symptoms within 2 to 6 weeks. It remains the gold standard treatment recognized by international menopause societies for moderate-to-severe hot flashes.',
    strength: 'Strong',
    sourceReference: 'Cochrane Systematic Review (MacLennan et al., 2021 update)',
    tags: ['Hot flashes', 'Night sweats', 'Vasomotor'],
    relevanceTags: ['hot_flashes', 'night_sweats'],
  },
  {
    id: 'hrt_ev_sleep',
    topicId: 'hrt',
    category: 'benefit',
    title: 'Sleep architecture and nocturnal awakening relief',
    summary:
      'Reduces nighttime awakenings caused by nocturnal vasomotor spikes and increases restorative slow-wave sleep duration.',
    detailedBody:
      'Polysomnographic sleep monitoring shows that relief of nocturnal hot flashes directly cuts wakefulness after sleep onset. In addition, micronized progesterone taken at bedtime exerts mild GABAergic calming actions that can independently improve sleep latency and ease restless awakenings.',
    strength: 'Moderate',
    sourceReference: 'North American Menopause Society (NAMS) Position Statement (2022)',
    tags: ['Sleep', 'Insomnia', 'Fatigue'],
    relevanceTags: ['sleep_disruption', 'energy_loss'],
  },
  {
    id: 'hrt_ev_bone',
    topicId: 'hrt',
    category: 'benefit',
    title: 'Bone mineral density preservation & fracture prevention',
    summary:
      'Estrogen halts osteoclast-mediated bone resorption, decreasing vertebral and hip fracture rates by up to 30% to 40% during active therapy.',
    detailedBody:
      'Long-term follow-up of the Women\'s Health Initiative and extensive epidemiological registries establish that hormone therapy maintains trabecular and cortical bone mass during the rapid bone loss phase of early postmenopause. Bone density gains slowly taper after discontinuation unless maintained through other anti-resorptive medications.',
    strength: 'Strong',
    sourceReference: 'Endocrine Society Clinical Practice Guideline on Menopause (2023)',
    tags: ['Bone health', 'Osteoporosis', 'Fractures'],
    relevanceTags: ['bone_health'],
  },
  {
    id: 'hrt_ev_gsm',
    topicId: 'hrt',
    category: 'benefit',
    title: 'Genitourinary symptoms (vaginal dryness & discomfort)',
    summary:
      'Local low-dose vaginal estrogens restore mucosal thickness, natural lubrication, and vaginal pH with negligible systemic absorption.',
    detailedBody:
      'Genitourinary syndrome of menopause (GSM) affects up to 50% of postmenopausal women and does not self-resolve over time. Topical vaginal creams, pessaries, or rings act directly on localized estrogen receptors. Because systemic serum estradiol levels remain within normal postmenopausal ranges, localized therapy does not require accompanying progestogen protection.',
    strength: 'Strong',
    sourceReference: 'British Menopause Society (BMS) Consensus Statement (2023)',
    tags: ['Genitourinary', 'Vaginal dryness', 'Comfort'],
    relevanceTags: ['vaginal_dryness'],
  },
  {
    id: 'hrt_ev_breast_risk',
    topicId: 'hrt',
    category: 'risk',
    title: 'Breast cancer risk profile by regimen and duration',
    summary:
      'Risk varies substantially depending on whether estrogen is combined with synthetic progestin or taken alone / with natural micronized progesterone.',
    detailedBody:
      'The WHI trial noted an absolute excess of approximately 4 to 8 additional cases per 1,000 women after 5 years of continuous combined conjugated estrogens plus medroxyprogesterone acetate (MPA). In contrast, estrogen alone in women without a uterus showed no increased risk (and a slight reduction in incidence). Observational European cohorts suggest micronized bioidentical progesterone and dydrogesterone confer lower associated risks than synthetic progestins.',
    strength: 'Moderate',
    sourceReference: 'Lancet Collaborative Group on Hormonal Factors in Breast Cancer (2019 / WHI 20-Year Follow-up)',
    tags: ['Breast cancer', 'Risks', 'Progesterone differences'],
    relevanceTags: ['cancer_risk'],
  },
  {
    id: 'hrt_ev_vte_risk',
    topicId: 'hrt',
    category: 'risk',
    title: 'Venous thromboembolism (blood clot) route dependence',
    summary:
      'Oral estrogen roughly doubles baseline clot risk, whereas transdermal estradiol (patches, gels) does not elevate clot risk in prospective studies.',
    detailedBody:
      'Oral administration exposes the hepatic portal system to high estradiol concentrations, activating pro-coagulant clotting factors and suppression of protein S. Transdermal administration bypasses the liver entirely. Large multi-center studies (ESTHER, E3N, and UK General Practice Research Database) repeatedly found zero statistical elevation in DVT or pulmonary embolism among transdermal estradiol users.',
    strength: 'Strong',
    sourceReference: 'French ESTHER Study Group & Cochrane Review on Thrombosis (Canonico et al.)',
    tags: ['Blood clots', 'DVT', 'Transdermal vs Oral'],
    relevanceTags: ['blood_clots'],
  },
  {
    id: 'hrt_ev_cognition_timing',
    topicId: 'hrt',
    category: 'uncertainty',
    title: 'Long-term cognitive outcomes and the "critical window"',
    summary:
      'Evidence remains mixed: observational studies suggest early initiation preserves cognitive function, but randomized trials show neutral or adverse effects if initiated after age 65.',
    detailedBody:
      'The "timing hypothesis" posits that estrogen supports neuronal metabolic function in healthy brain tissue during perimenopause, but can exacerbate neuroinflammatory processes once neurodegenerative changes have already taken hold in later decades. Current clinical consensus does not endorse initiating HRT solely for dementia prevention.',
    strength: 'Uncertain',
    sourceReference: 'KEEPS-Cognitive and WHIMS-Young Cohort Studies (Maki et al., 2022)',
    tags: ['Brain fog', 'Dementia', 'Cognitive window'],
    relevanceTags: ['brain_fog', 'cognition'],
  },
  {
    id: 'hrt_ev_side_effects',
    topicId: 'hrt',
    category: 'uncertainty',
    title: 'Early adjustment symptoms & unscheduled spotting',
    summary:
      'Mild breast tenderness, temporary bloating, or breakthrough spotting often occur in the initial 1 to 3 months before settling.',
    detailedBody:
      'Up to 30% of women initiate dose titration adjustments in the first trimester. While nuisance side effects generally resolve as receptor down-regulation equilibrates, unexpected spotting after 6 months of therapy requires clinical surveillance to evaluate the uterine endometrial stripe.',
    strength: 'Moderate',
    sourceReference: 'Royal College of Obstetricians and Gynaecologists (RCOG) Green-top Guideline',
    tags: ['Side effects', 'Titration', 'Spotting'],
    relevanceTags: ['side_effects'],
  },
];

export const hrtStories: ExperienceStory[] = [
  {
    id: 'hrt_story_elena',
    topicId: 'hrt',
    personaName: 'Elena',
    ageRange: '51 years old',
    headline: 'Started transdermal patch + oral micronized progesterone',
    situation:
      'Elena experienced severe nocturnal drenching sweats waking her 4–5 times a night, accompanied by brain fog that disrupted her senior leadership meetings.',
    choiceMade:
      'After checking with her gynecologist and reviewing normal mammogram findings, she started a low-dose transdermal estradiol patch (0.025 mg) and cyclical micronized progesterone (100 mg at bedtime).',
    outcome:
      'Within three weeks, nocturnal awakenings dropped from four to zero. She felt clear-headed during the workday and noticed joint stiffness subsided.',
    quote:
      '“I spent nine months hoping it would pass on its own. The patch gave me my sleep back within weeks. Having my doctor explain transdermal safety made the difference.”',
    reflection:
      'Elena has annual check-ins scheduled with her clinician to re-evaluate lowest effective dose and continued wellness goals.',
    isIllustrative: true,
  },
  {
    id: 'hrt_story_miriam',
    topicId: 'hrt',
    personaName: 'Miriam',
    ageRange: '48 years old',
    headline: 'Chose non-hormonal lifestyle and targeted sleep strategies',
    situation:
      'Miriam had moderate hot flashes (3–4 per day) and mild sleep restlessness. Her maternal aunt had a history of premenopausal breast cancer, which left Miriam deeply anxious about taking systemic hormones.',
    choiceMade:
      'After structured discussion with her nurse practitioner, Miriam chose to try cooling mattress bedding, regular morning resistance training, and a low-dose SSRI (escitalopram) for vasomotor damping.',
    outcome:
      'Her daytime flushes decreased by about 50%, and her anxiety about cancer risk stayed calm and manageable. She felt confident having chosen the path aligned with her personal values.',
    quote:
      '“The most comforting realization was that I didn\'t have to take hormones to take my symptoms seriously. There are structured medical steps either way.”',
    reflection:
      'Miriam keeps an open mind and agreed with her team to reassess if symptom intensity escalates.',
    isIllustrative: true,
  },
  {
    id: 'hrt_story_rachel',
    topicId: 'hrt',
    personaName: 'Rachel',
    ageRange: '54 years old',
    headline: 'Started with local vaginal estrogen only, deferring systemic therapy',
    situation:
      'Rachel had minimal daytime hot flashes, but painful intercourse and frequent urinary urgency were severely affecting her marital intimacy and confidence.',
    choiceMade:
      'Because her primary symptom was isolated genitourinary discomfort without systemic disruption, she opted for low-dose vaginal estradiol cream twice weekly rather than systemic pills or patches.',
    outcome:
      'Over 8 weeks, natural tissue elasticity and moisture recovered completely without any systemic hormone exposure or the need for oral progesterone.',
    quote:
      '“I didn\'t know vaginal estrogen had virtually zero systemic absorption. It solved my exact problem directly without needing to take a body-wide medication.”',
    reflection:
      'Rachel brought her questions directly to her routine well-woman exam and created a focused treatment plan in one visit.',
    isIllustrative: true,
  },
  {
    id: 'hrt_story_sophia',
    topicId: 'hrt',
    personaName: 'Sophia',
    ageRange: '53 years old',
    headline: 'Used HRT for two years through acute transition, then tapered off',
    situation:
      'Sophia started HRT during the most disruptive phase of perimenopause when palpitations and sudden mood swings caused significant distress.',
    choiceMade:
      'She used combined HRT for 24 months, tracking her symptoms monthly in collaboration with her physician.',
    outcome:
      'At age 53, feeling grounded and having established consistent lifestyle habits, she gradually tapered her dose over 3 months under clinical supervision without rebound flushes.',
    quote:
      '“HRT was the bridge I needed during the storm. Knowing I could revisit it anytime made transitioning off feel completely natural.”',
    reflection:
      'Sophia learned that menopause support is an evolving dialogue, not a lifetime binding contract.',
    isIllustrative: true,
  },
];
