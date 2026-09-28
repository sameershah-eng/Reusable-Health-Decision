import type {
  TopicRules,
  UnknownItem,
  ClinicalConsideration,
} from '../../domain/types';

export const thermageRules: TopicRules = {
  unknownDetectors: [
    (answers: Record<string, any>): UnknownItem | null => {
      const laxity = answers['laxity_degree'];
      if (laxity === undefined || laxity === null || laxity === 'skip' || laxity === 'unsure') {
        return {
          fieldId: 'laxity_degree',
          fieldName: 'Degree of skin laxity',
          reasonWhyItMatters:
            'Thermage monopolar radiofrequency is FDA-cleared for mild-to-moderate laxity. For severe elastosis or deep platysmal sagging, results may not meet surgical-level expectations.',
          suggestedAction:
            'Have a board-certified dermatologist assess whether your tissue responds better to radiofrequency, ultrasound (Ultherapy), or surgical lifting.',
        };
      }
      return null;
    },
    (answers: Record<string, any>): UnknownItem | null => {
      const area = answers['treatment_area'];
      if (!area || area === 'unsure' || area === 'skip') {
        return {
          fieldId: 'treatment_area',
          fieldName: 'Target anatomical treatment area',
          reasonWhyItMatters:
            'Different tips and energy depths are utilized for periorbital (eyelid) tightening versus lower face/jawline contouring.',
          suggestedAction:
            'Specify the single area causing the most concern to get an accurate consultation estimate.',
        };
      }
      return null;
    },
  ],

  evaluateConsiderations: (answers: Record<string, any>): ClinicalConsideration[] => {
    const considerations: ClinicalConsideration[] = [];

    const laxity = Number(answers['laxity_degree']);
    if (laxity >= 4) {
      considerations.push({
        id: 'c_advanced_laxity',
        title: 'Realistic expectation setting for advanced laxity',
        description:
          'Because you noted moderate-to-high skin laxity, non-invasive radiofrequency will provide subtle collagen contraction rather than dramatic structural repositioning. A frank discussion on realistic outcome limits is advised.',
        severity: 'advisory',
        matchedRule: 'Skin laxity >= 4',
      });
    }

    if (answers['pain_sensitivity'] === 'high') {
      considerations.push({
        id: 'c_comfort_management',
        title: 'In-procedure comfort protocol',
        description:
          'Modern Thermage FLX incorporates vibrational cooling tips, but higher energy passes can still cause sharp heat spikes. Discuss oral analgesia or topical nerve blocks with your provider beforehand.',
        severity: 'info',
        matchedRule: 'High pain sensitivity reported',
      });
    }

    return considerations;
  },

  suggestQuestions: (_answers: Record<string, any>): string[] => {
    return [
      'Am I an optimal candidate for monopolar radiofrequency, or would targeted micro-focused ultrasound or combination treatment produce better collagen stimulation?',
      'Which generation machine (Thermage CPT vs. FLX) does your clinic use, and what pulse count is planned for my treatment area?',
      'What specific timeline should I expect for initial collagen tightening versus peak neocollagenesis at 3 to 6 months?',
    ];
  },

  suggestMetrics: (): string[] => {
    return ['skin_firmness_rating', 'jawline_contour_satisfaction'];
  },
};
