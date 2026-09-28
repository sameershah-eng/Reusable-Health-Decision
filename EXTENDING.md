# Extending Clara: Adding a New Decision Topic

Clara is built on an **agnostic decision-support architecture**. Adding an entirely new health or aesthetic decision topic requires **zero modifications to shared code** (`/src/core`).

This guide details how **Thermage Radiofrequency Skin Tightening** was integrated alongside Hormone Replacement Therapy (HRT), and how you can register any subsequent clinical topic (e.g., *Egg Freezing*, *Non-Hormonal Osteoporosis Therapies*, *Endometriosis Pain Management*).

---

## The 4 Required Topic Files

Every topic lives in `/src/topics/<topicId>/` and exports:

1. `config.ts`: Metadata, field groups, context inputs, decision options, reason options, and tracking metrics.
2. `content.ts`: Graded evidence summaries (with synthetic citations) and illustrative patient stories.
3. `rules.ts`: Unknown detectors, clinical rule evaluators, and clinician question generators.
4. `index.ts`: Barrel export.

---

## Worked Example: Thermage

### Step 1: Create the Topic Directory

```bash
mkdir -p src/topics/thermage
```

### Step 2: Define Rules (`rules.ts`)

Pure functions defining:
- `unknownDetectors`: Functions returning an `UnknownItem` when critical inputs are skipped or uncertain.
- `evaluateConsiderations`: Generates advisory or priority notes for the clinician.
- `suggestQuestions`: Generates tailored consultation questions.
- `suggestMetrics`: Suggests default longitudinal observation metrics.

```typescript
// src/topics/thermage/rules.ts
import type { TopicRules, UnknownItem, ClinicalConsideration } from '../../domain/types';

export const thermageRules: TopicRules = {
  unknownDetectors: [
    (answers) => {
      if (!answers['laxity_degree'] || answers['laxity_degree'] === 'skip') {
        return {
          fieldId: 'laxity_degree',
          fieldName: 'Degree of skin laxity',
          reasonWhyItMatters: 'Thermage is FDA-cleared for mild-to-moderate laxity; severe laxity may require surgical options.',
          suggestedAction: 'Ask your dermatologist whether radiofrequency or alternative lifting aligns with your skin grade.'
        };
      }
      return null;
    }
  ],
  evaluateConsiderations: (answers) => {
    const list: ClinicalConsideration[] = [];
    if (Number(answers['laxity_degree']) >= 4) {
      list.push({
        id: 'c_advanced_laxity',
        title: 'Expectation setting for advanced laxity',
        description: 'Non-invasive RF provides collagen contraction rather than surgical SMAS repositioning.',
        severity: 'advisory',
        matchedRule: 'Skin laxity >= 4'
      });
    }
    return list;
  },
  suggestQuestions: () => [
    'Which generation device (CPT vs. FLX) does your clinic use, and what pulse count is planned?',
    'What timeline should I anticipate between immediate contraction and peak collagen remodeling?'
  ],
  suggestMetrics: () => ['skin_firmness_rating', 'jawline_contour_satisfaction']
};
```

---

### Step 3: Define Content (`content.ts`)

Provide evidence items categorized into `benefit`, `risk`, or `uncertainty`, and 2–4 illustrative patient stories:

```typescript
// src/topics/thermage/content.ts
import type { EvidenceItem, ExperienceStory } from '../../domain/types';

export const thermageEvidence: EvidenceItem[] = [
  {
    id: 'thermage_ev_collagen',
    topicId: 'thermage',
    category: 'benefit',
    title: 'Monopolar radiofrequency volumetric dermal heating',
    summary: 'Uniform heating triggers immediate collagen contraction and 6-month neocollagenesis.',
    detailedBody: 'Clinical blinded photographic reviews demonstrate measurable jawline tightening...',
    strength: 'Moderate',
    sourceReference: 'Dermatologic Surgery Journal Multi-Center Clinical Evaluation (2021)'
  }
];

export const thermageStories: ExperienceStory[] = [
  {
    id: 'thermage_story_chloe',
    topicId: 'thermage',
    personaName: 'Chloe',
    ageRange: '44 years old',
    headline: 'Treated lower face with Thermage FLX for zero downtime',
    situation: 'Noticed cheek softness on video calls but could not afford surgical bruising.',
    choiceMade: 'Completed 900 pulses of Thermage FLX.',
    outcome: 'Returned to work next day; firmer bounce noted by month 4.',
    quote: '“It just looked like I had slept for two weeks straight.”',
    reflection: 'Re-evaluating every 18 months as preventive collagen banking.',
    isIllustrative: true
  }
];
```

---

### Step 4: Define Topic Configuration (`config.ts`)

Connect metadata, field groups, typed field definitions, and copy overrides:

```typescript
// src/topics/thermage/config.ts
import type { TopicConfig } from '../../domain/types';
import { thermageRules } from './rules';

export const thermageConfig: TopicConfig = {
  id: 'thermage',
  name: 'Thermage Radiofrequency Skin Tightening',
  shortDescription: 'Evaluate monopolar radiofrequency for collagen remodeling and skin firmness.',
  fullDescription: '...',
  category: 'Aesthetic Dermatology',
  iconName: 'Activity',
  contentVersion: '1.0.0',
  fieldGroups: [
    { id: 'concerns_area', title: 'Target Area & Priorities', description: '...' },
    { id: 'skin_profile', title: 'Skin Characteristics', description: '...' }
  ],
  contextFields: [
    {
      id: 'treatment_area',
      groupId: 'concerns_area',
      groupTitle: 'Target Area & Priorities',
      question: 'Which anatomical area are you considering treating?',
      type: 'single-select',
      options: [
        { value: 'lower_face', label: 'Lower face & jawline' },
        { value: 'periorbital', label: 'Eyelids' }
      ],
      allowSkip: true
    }
  ],
  decisionOptions: [
    { id: 'book_thermage_consult', label: 'Book clinical consultation', description: '...' },
    { id: 'discuss_with_clinician_first', label: 'Discuss with dermatologist first', description: '...' }
  ],
  reasonOptions: [
    { id: 'want_zero_downtime', label: 'Zero social downtime requirement' }
  ],
  observationMetrics: [
    {
      id: 'skin_firmness_rating',
      name: 'Skin Firmness & Elastic Rebound',
      description: 'Tactile bounce when touching facial tissue.',
      unit: 'rating',
      scaleMin: 1,
      scaleMax: 5,
      minLabel: '1 - Loose',
      maxLabel: '5 - Firm',
      higherIsBetter: true
    }
  ],
  rules: thermageRules,
  copy: { ... }
};
```

---

### Step 5: Register the Topic in `TopicRegistry`

In `/src/topics/registry.ts`:

```typescript
import { thermageConfig, thermageEvidence, thermageStories } from './thermage';

// Inside TopicRegistry constructor:
this.registerTopic(thermageConfig, thermageEvidence, thermageStories);
```

**That is all.** The topic automatically:
- Appears on the Home screen topic picker.
- Generates its dedicated `/journey/thermage` route.
- Renders all context fields, unknown chips, and perspectives.
- Freezes immutable decision briefs and evaluates 6-week observation deltas.
- Records into the patient's longitudinal history.
