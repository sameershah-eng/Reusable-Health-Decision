import type {
  TopicRules,
  UnknownItem,
  ClinicalConsideration,
} from '../../domain/types';

export const hrtRules: TopicRules = {
  unknownDetectors: [
    (answers: Record<string, any>): UnknownItem | null => {
      const uterus = answers['intact_uterus'];
      if (uterus === undefined || uterus === 'unsure' || uterus === 'skip') {
        return {
          fieldId: 'intact_uterus',
          fieldName: 'Uterine status (intact uterus vs. prior hysterectomy)',
          reasonWhyItMatters:
            'If you have a uterus, systemic estrogen must be paired with progesterone to protect the endometrial lining. Knowing this is essential for safe prescription choices.',
          suggestedAction:
            'Confirm with your clinician whether your surgical history involved complete or partial hysterectomy.',
        };
      }
      return null;
    },
    (answers: Record<string, any>): UnknownItem | null => {
      const clots = answers['history_clots'];
      if (clots === undefined || clots === 'unsure' || clots === 'skip') {
        return {
          fieldId: 'history_clots',
          fieldName: 'Personal or family history of blood clots / DVT',
          reasonWhyItMatters:
            'Oral estrogen undergoes first-pass liver metabolism and slightly increases thrombotic risk, whereas transdermal patches or gels bypass this effect.',
          suggestedAction:
            'Note any past episodes of unexplained leg swelling, pulmonary embolism, or family clotting disorders to mention.',
        };
      }
      return null;
    },
    (answers: Record<string, any>): UnknownItem | null => {
      const bleeding = answers['unexplained_bleeding'];
      if (bleeding === undefined || bleeding === 'unsure' || bleeding === 'skip') {
        return {
          fieldId: 'unexplained_bleeding',
          fieldName: 'Recent unexplained or irregular vaginal bleeding',
          reasonWhyItMatters:
            'Unscheduled bleeding in perimenopause or postmenopause requires diagnostic ultrasound or biopsy before starting any hormone therapy.',
          suggestedAction:
            'Mention any spotting or bleeding intervals occurring outside expected cycle windows to your clinician.',
        };
      }
      return null;
    },
  ],

  evaluateConsiderations: (answers: Record<string, any>): ClinicalConsideration[] => {
    const considerations: ClinicalConsideration[] = [];

    // Rule 1: Intact Uterus & Progesterone Protection
    if (answers['intact_uterus'] === 'yes') {
      considerations.push({
        id: 'c_uterus_protection',
        title: 'Endometrial protection required with estrogen',
        description:
          'Because your uterus is intact, any systemic estrogen regimen must include adequate progestogen (e.g. micronized oral progesterone or an intrauterine system) to keep the uterine lining thin and prevent hyperplasia.',
        severity: 'priority',
        matchedRule: 'Intact uterus confirmed',
      });
    }

    // Rule 2: Unexplained bleeding safety check
    if (answers['unexplained_bleeding'] === 'yes') {
      considerations.push({
        id: 'c_bleeding_investigation',
        title: 'Investigate unexpected bleeding before treatment',
        description:
          'Reported irregular or unexpected bleeding should be diagnostically investigated (such as with a pelvic ultrasound) prior to introducing or altering hormone doses.',
        severity: 'priority',
        matchedRule: 'Unexplained bleeding reported',
      });
    }

    // Rule 3: Clot history -> transdermal route
    if (answers['history_clots'] === 'yes') {
      considerations.push({
        id: 'c_transdermal_preference',
        title: 'Thrombotic safety & transdermal delivery',
        description:
          'Given your personal or familial blood clot history, clinical guidelines strongly favor transdermal estradiol (patches, gels, sprays) over oral tablets, as transdermal administration does not increase venous thromboembolism risk in observed clinical trials.',
        severity: 'advisory',
        matchedRule: 'History of blood clots reported',
      });
    }

    // Rule 4: Breast cancer history
    if (answers['history_breast_cancer'] === 'yes') {
      considerations.push({
        id: 'c_oncology_consultation',
        title: 'Oncologic history requires coordinated consultation',
        description:
          'A personal history of hormone-receptor-positive breast cancer is generally a contraindication for systemic HRT. Non-hormonal evidence-based prescription options (such as SSRIs/SNRIs, fezolinetant, or gabapentin) and vaginal moisturizers should be discussed.',
        severity: 'priority',
        matchedRule: 'History of breast cancer reported',
      });
    }

    // Rule 5: Timing hypothesis (Age > 60 or >10 years post-menopause)
    if (answers['age_range'] === '60_plus' || answers['menopause_stage'] === 'post_late') {
      considerations.push({
        id: 'c_timing_window',
        title: 'Initiation timing window considerations',
        description:
          'Medical consensus (NAMS / Endocrine Society) highlights that the benefit-risk ratio is most favorable when HRT is initiated within 10 years of menopause or before age 60. Starting later warrants closer cardiovascular and cognitive risk-benefit analysis.',
        severity: 'advisory',
        matchedRule: 'Age 60+ or extended postmenopausal duration',
      });
    }

    // Rule 6: High symptom severity
    const severity = Number(answers['symptom_severity']);
    if (severity >= 4) {
      considerations.push({
        id: 'c_high_burden',
        title: 'High quality-of-life burden',
        description:
          'You noted high symptom severity (rating 4–5/5). Clinical guidelines recognize moderate-to-severe vasomotor symptoms as the primary indication where symptom-relief benefits typically outweigh potential risks for eligible women.',
        severity: 'info',
        matchedRule: 'Symptom severity >= 4',
      });
    }

    return considerations;
  },

  suggestQuestions: (answers: Record<string, any>): string[] => {
    const questions: string[] = [
      'Given my medical history and symptom profile, what are the safest delivery routes (e.g. transdermal patch vs. oral pill)?',
      'If we start therapy, what is the expected timeline for noticeable symptom improvement, and what side effects should I watch for in the first 8 weeks?',
      'How often will we review my dosage and assess whether to continue, adjust, or taper?',
    ];

    if (answers['intact_uterus'] === 'yes') {
      questions.push(
        'What type of progesterone (such as bioidentical micronized progesterone) would be most suitable to protect my uterine lining with minimal side effects?'
      );
    }

    if (answers['history_clots'] === 'yes') {
      questions.push(
        'Can you confirm whether transdermal estrogen is safe for me given my clot history, or whether non-hormonal prescription alternatives would be preferred?'
      );
    }

    if (answers['menopause_stage'] === 'perimenopause') {
      questions.push(
        'Since my periods are still irregular, how will we coordinate HRT with any lingering contraceptive needs?'
      );
    }

    return questions;
  },

  suggestMetrics: (_answers: Record<string, any>, _reasons: string[]): string[] => {
    return ['hot_flash_frequency', 'sleep_quality', 'mood_stability'];
  },
};
