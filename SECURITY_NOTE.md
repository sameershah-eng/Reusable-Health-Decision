# Production Data & Security Architecture Note

**Subject**: Clara Health Decision Support Framework  
**Classification**: Engineering & Security Architecture Brief  
**Compliance Target**: HIPAA Security Rule (45 CFR Part 160/164) & SOC 2 Type II

---

## 1. Authentication & Authorization

- **Zero-Trust Identity**: Patient sessions authenticate via OAuth 2.0 / OIDC with short-lived access tokens (JWT, 15-minute TTL) and secure HTTP-only refresh tokens.
- **Role-Based Access Control (RBAC)**: Strict segregation between `Patient`, `AttendingClinician`, `ClinicalAuditor`, and `SystemAdmin`. Clinicians may only view patient records upon explicit, time-bounded patient authorization or active clinical episode assignment.
- **Multi-Factor Authentication (MFA)**: Mandatory for all clinician and administrative access.

---

## 2. Tenant & User Isolation

- **Logical & Row-Level Security**: All database queries must enforce tenant and user boundaries at the database layer (e.g., PostgreSQL Row-Level Security `USING (user_id = current_setting('app.current_user_id'))`).
- **Snapshot Immutability**: Historical `DecisionSnapshot` tables are cryptographically hashed (SHA-256) and marked read-only with write-once-read-many (WORM) constraints to prevent accidental modification or retrospective tampering.

---

## 3. Cryptography & Key Management

- **In Transit**: Mandatory TLS 1.3 for all external API and web traffic with HSTS (`max-age=63072000; includeSubDomains; preload`). Modern cipher suites only (ECDHE-ECDSA-AES256-GCM-SHA384).
- **At Rest**: AES-256 encryption across all primary databases, snapshots, and persistent object stores.
- **Key Hierarchy**: Envelope encryption with keys managed in AWS KMS / GCP Cloud KMS with automatic annual rotation and dedicated customer-managed keys (CMEK) for enterprise tenants.

---

## 4. Vendor Boundaries & Third-Party AI Services

- **Strict No-PHI AI Boundary**: No generative AI endpoints or third-party LLMs receive raw Protected Health Information (PHI) or personal demographic identifiers.
- **Business Associate Agreements (BAAs)**: All cloud infrastructure providers (AWS, GCP) and enterprise AI vendors must execute formal HIPAA Business Associate Agreements before processing any request context.
- **Zero-Retention Policies**: Any permitted external API calls must enforce zero-day data retention and prohibit using customer inputs for model re-training.

---

## 5. Audit Logging & SIEM Integration

- **Immutable Audit Trail**: Append-only log stream recording:
  - Timestamp (UTC ISO-8601)
  - Actor ID & Session ID
  - Action (e.g., `CONTEXT_VERSION_CREATED`, `DECISION_SNAPSHOT_FROZEN`, `BRIEF_PRINTED`)
  - Source IP & User Agent
  - Target Resource ID
- **Tamper Evidence**: Audit logs forwarded in real-time to a dedicated, write-restricted log vault with integrity hashing.

---

## 6. Retention, Deletion & Right to be Forgotten

- **Right to Erasure**: Hard deletion requests trigger atomic purge across `UserContext`, `Decision`, `Observation`, and `LearningRecord` within 30 days.
- **Anonymized Research Pipeline**: When patients consent to aggregate research, records undergo HIPAA Safe Harbor de-identification (removal of all 18 HIPAA identifiers) before entering analytical stores.

---

## 7. Production Readiness Checklist (Prior to Live Health Data)

Before Clara transitions from this synthetic prototype to live clinical deployment:

- [ ] Execute HIPAA Business Associate Agreements (BAAs) with all hosting and third-party vendors.
- [ ] Replace localStorage and mock service providers with PostgreSQL + Row-Level Security (RLS) backend.
- [ ] Implement OAuth 2.0 / OIDC authentication with mandatory MFA.
- [ ] Connect automated vulnerability and SAST/DAST scanning in the CI/CD pipeline.
- [ ] Conduct third-party web application penetration testing and threat modeling review.
- [ ] Implement automated encrypted backups with tested disaster recovery (RPO < 1 hour, RTO < 4 hours).
- [ ] Register with corporate SIEM / SOC for 24/7 automated anomaly alerting.
- [ ] Complete formal HIPAA Privacy and Security Rule policies with annual workforce training.
