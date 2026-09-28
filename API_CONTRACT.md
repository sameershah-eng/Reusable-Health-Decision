# Clara Health — API Contract Specification

This document defines the 1:1 REST API contract mirroring the TypeScript interfaces in `/src/services/interfaces.ts`.

When switching from the client-side mock provider to a production microservice backend, configure:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=https://api.clarahealth.example.com/v1
```

---

## Standard Error Format

All failure responses return HTTP status codes ($\ge 400$) with a consistent JSON body:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Field 'symptom_severity' must be an integer between 1 and 5",
    "details": [
      {
        "field": "symptom_severity",
        "issue": "Expected integer <= 5, received 7"
      }
    ],
    "timestamp": "2026-09-28T10:00:00.000Z"
  }
}
```

---

## 1. Context Service

### `GET /contexts/:topicId?userId=:userId`
Retrieves the user's active context for a specific topic.

**Response `200 OK`**:
```json
{
  "id": "ctx_98124",
  "userId": "usr_patient_44",
  "topicId": "hrt",
  "version": 1,
  "answers": {
    "age_range": "50_54",
    "menopause_stage": "perimenopause",
    "main_symptoms": ["hot_flashes", "night_sweats"],
    "symptom_severity": 4,
    "intact_uterus": "yes",
    "history_clots": "no"
  },
  "updatedAt": "2026-09-28T10:15:00.000Z"
}
```

### `POST /contexts/:topicId`
Updates context answers and increments the context `version` number.

**Request Body**:
```json
{
  "userId": "usr_patient_44",
  "answers": {
    "symptom_severity": 5,
    "history_clots": "yes"
  }
}
```

**Response `200 OK`**:
```json
{
  "id": "ctx_98124",
  "userId": "usr_patient_44",
  "topicId": "hrt",
  "version": 2,
  "answers": {
    "age_range": "50_54",
    "menopause_stage": "perimenopause",
    "main_symptoms": ["hot_flashes", "night_sweats"],
    "symptom_severity": 5,
    "intact_uterus": "yes",
    "history_clots": "yes"
  },
  "updatedAt": "2026-09-28T10:20:00.000Z"
}
```

---

## 2. Decision & Snapshot Service

### `POST /decisions`
Records a decision and creates an immutable snapshot of the active context version.

**Request Body**:
```json
{
  "userId": "usr_patient_44",
  "topicId": "hrt",
  "choice": "start_systemic_hrt",
  "reasons": ["frequent_vasomotor", "chronic_insomnia"],
  "freeTextReason": "Need restful sleep before next quarter.",
  "confidence": 4,
  "observationMetricIds": ["hot_flash_frequency", "sleep_quality"],
  "contextSnapshotInputs": {
    "contextVersion": 2,
    "contentVersion": "1.4.0"
  }
}
```

**Response `201 Created`**:
```json
{
  "decision": {
    "id": "dec_61029",
    "userId": "usr_patient_44",
    "topicId": "hrt",
    "choice": "start_systemic_hrt",
    "reasons": ["frequent_vasomotor", "chronic_insomnia"],
    "freeTextReason": "Need restful sleep before next quarter.",
    "confidence": 4,
    "observationMetricIds": ["hot_flash_frequency", "sleep_quality"],
    "snapshotId": "snap_99214",
    "createdAt": "2026-09-28T10:30:00.000Z",
    "status": "decided"
  },
  "snapshot": {
    "id": "snap_99214",
    "decisionId": "dec_61029",
    "topicId": "hrt",
    "contextVersion": 2,
    "frozenContext": { ... },
    "frozenSummary": { ... },
    "frozenUnknowns": [ ... ],
    "frozenBrief": { ... },
    "contentVersion": "1.4.0",
    "createdAt": "2026-09-28T10:30:00.000Z"
  }
}
```

### `GET /snapshots/:snapshotId`
Retrieves an immutable snapshot.

**Response `200 OK`**: (Returns `DecisionSnapshot` schema)

### `GET /decisions/history?userId=:userId`
Returns chronological list of all past decisions and their snapshots for the user.

---

## 3. Observation Service

### `POST /decisions/:decisionId/observations`
Records baseline or follow-up symptom ratings.

**Request Body**:
```json
{
  "observations": [
    {
      "metricId": "hot_flash_frequency",
      "phase": "followup",
      "value": 2,
      "note": "Down from 5 at baseline"
    },
    {
      "metricId": "sleep_quality",
      "phase": "followup",
      "value": 4,
      "note": "Restful unbroken sleep"
    }
  ]
}
```

### `POST /decisions/:decisionId/simulate-followup`
Advances mock timeline clock.

**Request Body**:
```json
{
  "daysAhead": 42
}
```

---

## 4. Learning Service

### `POST /decisions/:decisionId/learning`
Saves retrospective learning record attached to the decision.

**Request Body**:
```json
{
  "reflections": {
    "surpriseOrDifference": "Relief arrived earlier than expected.",
    "nextConversationWithClinician": "Ask about keeping the current transdermal patch dose."
  },
  "wouldDecideAgain": "yes",
  "deltas": [ ... ]
}
```
