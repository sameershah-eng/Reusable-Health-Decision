import type { EvidenceItem, ExperienceStory } from '../../domain/types';

export const thermageEvidence: EvidenceItem[] = [
  {
    id: 'thermage_ev_collagen',
    topicId: 'thermage',
    category: 'benefit',
    title: 'Monopolar capacitive radiofrequency bulk heating',
    summary:
      'Uniform volumetric dermal heating to 65–75°C contracts existing collagen fibrils and triggers a 6-month wound-healing neocollagenesis cascade.',
    detailedBody:
      'Histological skin biopsies confirm significant increases in Type I and Type III procollagen mRNA expression following monopolar radiofrequency delivery. Clinical blinded photographic reviews demonstrate measurable jawline tightening and brow elevation in 80–87% of appropriately selected patients with mild-to-moderate laxity.',
    strength: 'Moderate',
    sourceReference: 'Dermatologic Surgery Journal Multi-Center Clinical Evaluation (Fabi et al., 2021)',
    tags: ['Radiofrequency', 'Collagen', 'Skin tightening'],
  },
  {
    id: 'thermage_ev_expectations',
    topicId: 'thermage',
    category: 'uncertainty',
    title: 'Longevity, gradual onset & responder variability',
    summary:
      'Results are gradual over 2 to 6 months and last approximately 12 to 18 months, but individual biological collagen response varies.',
    detailedBody:
      'Unlike surgical excisions or deep plane rhytidectomy, radiofrequency does not reposition deep muscular aponeurotic systems (SMAS). Patients with high baseline elastin degradation (from extensive photodamage or smoking) or significant submental volume show lower response amplitudes. Zero social downtime remains the primary patient satisfaction driver.',
    strength: 'Moderate',
    sourceReference: 'Aesthetic Plastic Surgery Systematic Review (Alster & Tanzi Consensus, 2022)',
    tags: ['Downtime', 'Expectations', 'Responder rates'],
  },
];

export const thermageStories: ExperienceStory[] = [
  {
    id: 'thermage_story_chloe',
    topicId: 'thermage',
    personaName: 'Chloe',
    ageRange: '44 years old',
    headline: 'Treated lower face and jawline with Thermage FLX',
    situation:
      'Chloe noticed slight soft jowling along her lower jawline on video calls. She works full-time with clients and could not take time off for surgical bruising.',
    choiceMade:
      'She completed a single 900-pulse Thermage FLX session focused on her lower cheeks and jawline.',
    outcome:
      'She returned to work immediately the next morning with mild rosy redness that faded in hours. By month 4, photos showed a crisper jawline angle and firmer tactile bounce.',
    quote:
      '“It wasn’t an artificial change—it just looked like I had slept for two weeks straight and my skin snapped back when touched.”',
    reflection:
      'Chloe plans to repeat the treatment every 18 months as preventive collagen banking.',
    isIllustrative: true,
  },
  {
    id: 'thermage_story_amara',
    topicId: 'thermage',
    personaName: 'Amara',
    ageRange: '56 years old',
    headline: 'Consulted for Thermage, decided on combination microneedling & topical retinoids',
    situation:
      'Amara wanted treatment for neck banding and eyelid crepiness, but felt hesitant about the $2,500 single-session cost.',
    choiceMade:
      'During her dermatology consultation, the physician explained that her fine surface crinkling would benefit more from a series of RF microneedling treatments paired with prescription tretinoin.',
    outcome:
      'She saved on upfront costs and addressed fine surface texture over 4 sessions, keeping full-face RF in reserve for the future.',
    quote:
      '“Having the consultation brief made me ask the right questions about surface texture versus deep laxity. I chose the modality suited to my skin type.”',
    reflection:
      'Amara appreciated that a consultation is about exploring modalities, not feeling pressured into the most marketed brand.',
    isIllustrative: true,
  },
];
