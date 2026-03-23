-- Seed realistic BVI government decisions
-- Uses variables for user/ministry IDs for clarity

BEGIN;

-- Store IDs in temp table for reference
DO $$
DECLARE
  -- Users
  v_minister  uuid := '7cbdd533-effd-4355-b7e4-78d633a2ec50';
  v_secretary uuid := 'd555f19b-4f1e-4877-9c4e-cbc2904786c2';
  v_legal     uuid := '097a948f-26df-4061-a4b4-7e7bd92882ab';
  v_auditor   uuid := '19b26e41-1561-441e-874f-95ebcd382227';

  -- Ministries
  v_fin uuid := 'af95406f-93cb-4d47-8714-cff63fdee653';
  v_nat uuid := 'b2fafd7d-ed1e-4580-91aa-6e79f6c8898d';
  v_edu uuid := 'eee8495a-bdab-40f3-a123-4de35beb6c5f';
  v_hea uuid := 'cc16311a-05f2-4666-bab9-7bda628d9a05';
  v_com uuid := 'a6478c0f-47a5-49a7-acc2-7404076d062a';
  v_pmo uuid := '614daf07-0e54-4713-9462-37ba6373ab11';

  -- Decision IDs (pre-generated for FK refs)
  d1 uuid := gen_random_uuid();
  d2 uuid := gen_random_uuid();
  d3 uuid := gen_random_uuid();
  d4 uuid := gen_random_uuid();
  d5 uuid := gen_random_uuid();
  d6 uuid := gen_random_uuid();

BEGIN
  -- ============================================================
  -- DECISION 1: Financial Services Licensing Amendment
  -- Status: published, all 10 steps completed, is_public=true
  -- ============================================================
  INSERT INTO decisions (id, reference_number, title, description, ministry_id, decision_type, status, current_step, created_by, assigned_to, is_public, deadline, metadata, created_at, updated_at)
  VALUES (d1, 'DP-FIN-2026-0001',
    'Financial Services Licensing Amendment',
    'Amendment to the Financial Services Commission licensing framework to incorporate updated FATF recommendations and strengthen AML/CFT compliance requirements for Category A and B licensees.',
    v_fin, 'licensing', 'published', 10, v_minister, v_secretary, true,
    '2026-02-28'::timestamptz,
    '{"priority": "high", "affectedLicensees": 47, "regulatoryBasis": "Financial Services Commission Act 2001"}'::jsonb,
    '2026-01-05 09:00:00+00', '2026-02-25 14:30:00+00');

  -- All 10 steps completed
  INSERT INTO decision_steps (decision_id, step_number, status, started_at, completed_at, completed_by, data, notes) VALUES
  (d1, 1, 'completed', '2026-01-05 09:00:00+00', '2026-01-05 11:30:00+00', v_minister,
    '{"legalBasis": "Financial Services Commission Act 2001, s.14(2)", "authoritySource": "Minister of Finance", "legislativeReference": "Virgin Islands Financial Services Regulations 2023"}'::jsonb,
    'Authority confirmed under FSC Act s.14(2)'),
  (d1, 2, 'completed', '2026-01-06 08:00:00+00', '2026-01-08 16:00:00+00', v_secretary,
    '{"evidenceSummary": "FATF Mutual Evaluation Report 2025 findings; FSC compliance data 2023-2025; industry consultation responses from 32 licensees", "documentsReviewed": 14, "stakeholderInput": true}'::jsonb,
    'Evidence gathered from FATF report and industry consultation'),
  (d1, 3, 'completed', '2026-01-09 09:00:00+00', '2026-01-10 15:00:00+00', v_minister,
    '{"optionsConsidered": ["Full framework overhaul", "Targeted amendment to Categories A/B only", "Phased implementation over 18 months"], "selectedOption": "Targeted amendment with 12-month transition", "rationale": "Balances compliance urgency with industry readiness"}'::jsonb,
    'Targeted amendment approach selected'),
  (d1, 4, 'completed', '2026-01-12 09:00:00+00', '2026-01-14 12:00:00+00', v_legal,
    '{"humanRightsAssessment": "No adverse impact identified", "equalityScreening": "Completed — no disproportionate effect on protected groups", "environmentalImpact": "N/A"}'::jsonb,
    'Rights assessment completed — no issues identified'),
  (d1, 5, 'completed', '2026-01-15 09:00:00+00', '2026-01-22 17:00:00+00', v_secretary,
    '{"consultees": ["BVI Financial Services Association", "BVI Bar Association", "Compliance Officers Forum", "Eastern Caribbean Central Bank"], "responsesReceived": 28, "materialChanges": "Extended transition period from 6 to 12 months based on industry feedback"}'::jsonb,
    'Consultation completed; transition period extended per feedback'),
  (d1, 6, 'completed', '2026-01-23 09:00:00+00', '2026-01-24 14:00:00+00', v_legal,
    '{"legalReview": "Consistent with FSC Act and international treaty obligations", "viresConfirmed": true, "draftingNotes": "Minor amendments to Schedule 2 recommended"}'::jsonb,
    'Legal review confirmed — intra vires'),
  (d1, 7, 'completed', '2026-01-27 09:00:00+00', '2026-01-27 16:00:00+00', v_minister,
    '{"decisionMaker": "Minister of Finance", "decisionDate": "2026-01-27", "reasonsGiven": true, "conditionsAttached": ["12-month transition period", "Quarterly progress reporting to FSC"]}'::jsonb,
    'Decision taken by Minister'),
  (d1, 8, 'completed', '2026-01-28 09:00:00+00', '2026-01-30 12:00:00+00', v_secretary,
    '{"notifiedParties": ["All Category A licensees", "All Category B licensees", "FSC Board", "Attorney General Chambers"], "notificationMethod": "Official Gazette and direct correspondence", "appealRightsStated": true}'::jsonb,
    'All affected parties notified via Gazette'),
  (d1, 9, 'completed', '2026-02-02 09:00:00+00', '2026-02-16 17:00:00+00', v_secretary,
    '{"implementationPlan": "FSC to update application forms and guidance notes by 2026-03-01; Licensees to submit updated compliance frameworks by 2026-06-30", "resourcesAllocated": "2 additional FSC compliance officers", "milestones": ["Forms updated", "Training delivered", "First quarterly report"]}'::jsonb,
    'Implementation plan established'),
  (d1, 10, 'completed', '2026-02-17 09:00:00+00', '2026-02-25 14:30:00+00', v_auditor,
    '{"reviewDate": "2026-08-27", "reviewCriteria": "Compliance rates among licensees, industry feedback, FATF follow-up assessment", "lessonsLearned": "Earlier industry engagement would have reduced consultation period"}'::jsonb,
    'Review scheduled for 6 months post-implementation');

  -- ============================================================
  -- DECISION 2: Environmental Protection Order — North Sound
  -- Status: approved, all 10 steps completed
  -- ============================================================
  INSERT INTO decisions (id, reference_number, title, description, ministry_id, decision_type, status, current_step, created_by, assigned_to, is_public, deadline, metadata, created_at, updated_at)
  VALUES (d2, 'DP-NAT-2026-0003',
    'Environmental Protection Order — North Sound',
    'Designation of North Sound, Virgin Gorda as a protected marine area under the National Parks Act, restricting commercial dredging and establishing a 200-metre buffer zone around existing coral reef systems.',
    v_nat, 'regulatory', 'approved', 10, v_minister, v_secretary, false,
    '2026-03-15'::timestamptz,
    '{"priority": "high", "protectedArea_hectares": 340, "coralSpeciesAffected": 12}'::jsonb,
    '2026-01-12 10:00:00+00', '2026-03-10 11:00:00+00');

  INSERT INTO decision_steps (decision_id, step_number, status, started_at, completed_at, completed_by, data, notes) VALUES
  (d2, 1, 'completed', '2026-01-12 10:00:00+00', '2026-01-12 14:00:00+00', v_minister,
    '{"legalBasis": "National Parks Act 2006, s.8(1)", "authoritySource": "Minister of Natural Resources", "legislativeReference": "Environmental Protection Regulations 2019"}'::jsonb,
    'Authority under National Parks Act confirmed'),
  (d2, 2, 'completed', '2026-01-13 08:00:00+00', '2026-01-20 17:00:00+00', v_secretary,
    '{"evidenceSummary": "Marine biological survey (Nov 2025); water quality analysis; satellite imagery showing reef degradation 2020-2025; JNCC advisory report", "documentsReviewed": 22, "expertConsulted": "Dr. Maria Santos, Marine Ecology, UWI"}'::jsonb,
    'Comprehensive marine survey and expert evidence compiled'),
  (d2, 3, 'completed', '2026-01-21 09:00:00+00', '2026-01-23 16:00:00+00', v_minister,
    '{"optionsConsidered": ["Full commercial ban", "200m buffer zone with seasonal restrictions", "Voluntary industry code of practice"], "selectedOption": "200m buffer zone with year-round dredging prohibition", "rationale": "Best balance of ecological protection and economic activity"}'::jsonb,
    'Buffer zone approach with dredging prohibition selected'),
  (d2, 4, 'completed', '2026-01-24 09:00:00+00', '2026-01-27 12:00:00+00', v_legal,
    '{"humanRightsAssessment": "Property rights of adjacent landowners considered — no deprivation, reasonable regulation", "equalityScreening": "Fishing community impact assessed — alternative fishing zones identified", "environmentalImpact": "Positive — estimated 40% reduction in reef degradation"}'::jsonb,
    'Rights assessment completed — proportionate restriction'),
  (d2, 5, 'completed', '2026-01-28 09:00:00+00', '2026-02-14 17:00:00+00', v_secretary,
    '{"consultees": ["Virgin Gorda fishing cooperative", "BVI Marine Association", "National Parks Trust", "Adjacent property owners", "BVI Tourist Board"], "responsesReceived": 41, "materialChanges": "Added exemption for traditional artisanal fishing within buffer zone"}'::jsonb,
    'Extensive stakeholder consultation; artisanal fishing exemption added'),
  (d2, 6, 'completed', '2026-02-17 09:00:00+00', '2026-02-19 15:00:00+00', v_legal,
    '{"legalReview": "Order within scope of National Parks Act; consistent with CBD obligations", "viresConfirmed": true, "draftingNotes": "Schedule of GPS coordinates for buffer zone boundaries finalized"}'::jsonb,
    'Legal review confirmed validity'),
  (d2, 7, 'completed', '2026-02-20 09:00:00+00', '2026-02-20 16:30:00+00', v_minister,
    '{"decisionMaker": "Minister of Natural Resources", "decisionDate": "2026-02-20", "reasonsGiven": true, "conditionsAttached": ["Annual reef health monitoring", "Review after 3 years", "Artisanal fishing exemption"]}'::jsonb,
    'Order approved by Minister'),
  (d2, 8, 'completed', '2026-02-23 09:00:00+00', '2026-02-27 12:00:00+00', v_secretary,
    '{"notifiedParties": ["BVI Gazette publication", "Adjacent landowners by registered post", "Fishing cooperatives", "Marine operators"], "notificationMethod": "Gazette, registered post, and public notice boards at North Sound", "appealRightsStated": true}'::jsonb,
    'All stakeholders notified'),
  (d2, 9, 'completed', '2026-03-02 09:00:00+00', '2026-03-07 17:00:00+00', v_secretary,
    '{"implementationPlan": "Marker buoys to be installed by 2026-04-01; patrol schedule established with Conservation & Fisheries Dept", "resourcesAllocated": "1 patrol vessel, 2 marine officers", "milestones": ["Buoy installation", "First patrol cycle", "Compliance review at 6 months"]}'::jsonb,
    'Implementation resources allocated'),
  (d2, 10, 'completed', '2026-03-08 09:00:00+00', '2026-03-10 11:00:00+00', v_auditor,
    '{"reviewDate": "2029-02-20", "reviewCriteria": "Reef health metrics, compliance rates, economic impact on fishing community", "lessonsLearned": "Early engagement with fishing community was critical to securing buy-in"}'::jsonb,
    '3-year review date set');

  -- ============================================================
  -- DECISION 3: School Zoning Boundary Adjustment
  -- Status: in_progress, steps 1-4 completed, step 5 in_progress
  -- ============================================================
  INSERT INTO decisions (id, reference_number, title, description, ministry_id, decision_type, status, current_step, created_by, assigned_to, is_public, deadline, metadata, created_at, updated_at)
  VALUES (d3, 'DP-EDU-2026-0002',
    'School Zoning Boundary Adjustment',
    'Revision of primary school catchment boundaries in Road Town to address overcrowding at Althea Scatliffe Primary and redistribute enrollment to Enis Adams Primary, effective September 2026 school year.',
    v_edu, 'planning', 'in_progress', 5, v_minister, v_secretary, false,
    '2026-06-30'::timestamptz,
    '{"priority": "medium", "affectedStudents": 85, "schoolsAffected": ["Althea Scatliffe Primary", "Enis Adams Primary"]}'::jsonb,
    '2026-02-10 09:00:00+00', '2026-03-18 16:00:00+00');

  INSERT INTO decision_steps (decision_id, step_number, status, started_at, completed_at, completed_by, data, notes) VALUES
  (d3, 1, 'completed', '2026-02-10 09:00:00+00', '2026-02-10 12:00:00+00', v_minister,
    '{"legalBasis": "Education Act 2004, s.22(3)", "authoritySource": "Minister of Education", "legislativeReference": "Education (School Zoning) Regulations 2015"}'::jsonb,
    'Minister authority under Education Act confirmed'),
  (d3, 2, 'completed', '2026-02-11 08:00:00+00', '2026-02-18 17:00:00+00', v_secretary,
    '{"evidenceSummary": "Enrollment data 2022-2026; projected population growth by district; transport route analysis; school capacity assessments", "documentsReviewed": 8, "dataAnalysis": "Althea Scatliffe at 112% capacity; Enis Adams at 74% capacity"}'::jsonb,
    'Enrollment data confirms capacity imbalance'),
  (d3, 3, 'completed', '2026-02-19 09:00:00+00', '2026-02-21 15:00:00+00', v_minister,
    '{"optionsConsidered": ["Redraw boundaries only", "Redraw boundaries with transport provision", "Build extension at Althea Scatliffe"], "selectedOption": "Redraw boundaries with transport provision for displaced students", "rationale": "Most cost-effective solution with minimal disruption"}'::jsonb,
    'Boundary redraw with transport support selected'),
  (d3, 4, 'completed', '2026-02-24 09:00:00+00', '2026-02-26 14:00:00+00', v_legal,
    '{"humanRightsAssessment": "Right to education preserved — no child loses school access", "equalityScreening": "Transport provision ensures no disproportionate impact on low-income families", "environmentalImpact": "Minor — additional school bus route"}'::jsonb,
    'Rights assessment satisfactory'),
  (d3, 5, 'in_progress', '2026-03-02 09:00:00+00', NULL, NULL,
    '{"consultees": ["Parent-Teacher Associations (both schools)", "Road Town Community Council", "BVI Bus Operators Association"], "responsesReceived": 12, "consultationDeadline": "2026-03-31"}'::jsonb,
    'Public consultation underway — responses being collected'),
  (d3, 6, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d3, 7, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d3, 8, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d3, 9, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d3, 10, 'not_started', NULL, NULL, NULL, NULL, NULL);

  -- ============================================================
  -- DECISION 4: Public Health Emergency Powers Review
  -- Status: under_review, all 10 steps completed
  -- ============================================================
  INSERT INTO decisions (id, reference_number, title, description, ministry_id, decision_type, status, current_step, created_by, assigned_to, is_public, deadline, metadata, created_at, updated_at)
  VALUES (d4, 'DP-HEA-2026-0001',
    'Public Health Emergency Powers Review',
    'Review and renewal of delegated emergency powers under the Public Health Act for the Chief Medical Officer, including quarantine authority and mandatory testing provisions, following the 2025 annual review requirement.',
    v_hea, 'enforcement', 'under_review', 10, v_minister, v_legal, false,
    '2026-04-30'::timestamptz,
    '{"priority": "high", "powersUnderReview": ["Quarantine authority", "Mandatory testing", "Facility closure"], "previousRenewal": "2025-03-15"}'::jsonb,
    '2026-01-20 09:00:00+00', '2026-03-15 10:00:00+00');

  INSERT INTO decision_steps (decision_id, step_number, status, started_at, completed_at, completed_by, data, notes) VALUES
  (d4, 1, 'completed', '2026-01-20 09:00:00+00', '2026-01-20 14:00:00+00', v_minister,
    '{"legalBasis": "Public Health Act 2004, s.35(1)", "authoritySource": "Minister of Health and Social Development", "legislativeReference": "Public Health (Emergency Powers) Order 2024"}'::jsonb,
    'Statutory basis for emergency powers renewal confirmed'),
  (d4, 2, 'completed', '2026-01-21 08:00:00+00', '2026-02-03 17:00:00+00', v_secretary,
    '{"evidenceSummary": "CMO usage report 2025; WHO regional health threat assessment; comparison with OECS emergency frameworks; 2025 exercise debrief report", "documentsReviewed": 16, "powersExercised2025": 3}'::jsonb,
    'Evidence shows powers exercised 3 times in 2025'),
  (d4, 3, 'completed', '2026-02-04 09:00:00+00', '2026-02-06 16:00:00+00', v_minister,
    '{"optionsConsidered": ["Full renewal as-is", "Renewal with enhanced safeguards", "Partial renewal — remove mandatory testing", "Allow powers to lapse"], "selectedOption": "Renewal with enhanced safeguards including 72-hour reporting to Minister", "rationale": "Maintains readiness while improving oversight"}'::jsonb,
    'Renewal with enhanced oversight selected'),
  (d4, 4, 'completed', '2026-02-07 09:00:00+00', '2026-02-12 12:00:00+00', v_legal,
    '{"humanRightsAssessment": "Quarantine powers engage Article 5 liberty rights — proportionality test applied; 72-hour judicial review safeguard maintained", "equalityScreening": "No disproportionate impact identified", "environmentalImpact": "N/A"}'::jsonb,
    'Liberty rights analysis completed — proportionate with safeguards'),
  (d4, 5, 'completed', '2026-02-13 09:00:00+00', '2026-02-28 17:00:00+00', v_secretary,
    '{"consultees": ["BVI Medical and Dental Council", "BVI Red Cross", "Civil liberties groups", "Hospital Board"], "responsesReceived": 18, "materialChanges": "Added mandatory 48-hour review for any quarantine exceeding 7 days"}'::jsonb,
    'Consultation completed; additional quarantine review safeguard added'),
  (d4, 6, 'completed', '2026-03-02 09:00:00+00', '2026-03-04 15:00:00+00', v_legal,
    '{"legalReview": "Consistent with ECHR Article 5 derogation framework; proportionality confirmed with new safeguards", "viresConfirmed": true, "draftingNotes": "Updated Order to include 72-hour ministerial reporting and 48-hour extended quarantine review"}'::jsonb,
    'Legal review completed with updated safeguards'),
  (d4, 7, 'completed', '2026-03-05 09:00:00+00', '2026-03-05 16:00:00+00', v_minister,
    '{"decisionMaker": "Minister of Health and Social Development", "decisionDate": "2026-03-05", "reasonsGiven": true, "conditionsAttached": ["Annual review maintained", "72-hour ministerial reporting", "48-hour extended quarantine review"]}'::jsonb,
    'Minister approved renewal with conditions'),
  (d4, 8, 'completed', '2026-03-06 09:00:00+00', '2026-03-10 12:00:00+00', v_secretary,
    '{"notifiedParties": ["Chief Medical Officer", "BVI Health Services Authority", "Attorney General", "Governor Office"], "notificationMethod": "Official correspondence and Gazette", "appealRightsStated": true}'::jsonb,
    'CMO and all relevant bodies notified'),
  (d4, 9, 'completed', '2026-03-10 13:00:00+00', '2026-03-13 17:00:00+00', v_secretary,
    '{"implementationPlan": "Updated SOPs to be issued to BVI HSA by 2026-04-01; training for frontline staff on new reporting requirements", "resourcesAllocated": "Existing CMO office resources", "milestones": ["SOP update", "Staff training", "First quarterly report"]}'::jsonb,
    'Implementation plan finalized'),
  (d4, 10, 'completed', '2026-03-14 09:00:00+00', '2026-03-15 10:00:00+00', v_auditor,
    '{"reviewDate": "2027-03-05", "reviewCriteria": "Frequency and proportionality of powers exercised, compliance with reporting requirements", "lessonsLearned": "Annual review cycle is appropriate for emergency powers"}'::jsonb,
    'Annual review cycle confirmed');

  -- ============================================================
  -- DECISION 5: Telecommunications Licence Renewal — BVI Telecom
  -- Status: draft, step 1 not_started
  -- ============================================================
  INSERT INTO decisions (id, reference_number, title, description, ministry_id, decision_type, status, current_step, created_by, assigned_to, is_public, deadline, metadata, created_at, updated_at)
  VALUES (d5, 'DP-COM-2026-0001',
    'Telecommunications Licence Renewal — BVI Telecom',
    'Consideration of the 15-year telecommunications licence renewal application from BVI Telecom Ltd, including assessment of coverage obligations, spectrum allocation, and universal service contribution requirements.',
    v_com, 'licensing', 'draft', 1, v_minister, NULL, false,
    '2026-09-30'::timestamptz,
    '{"priority": "medium", "applicant": "BVI Telecom Ltd", "currentLicenceExpiry": "2026-12-31", "licenceFee": 2500000}'::jsonb,
    '2026-03-18 10:00:00+00', '2026-03-18 10:00:00+00');

  INSERT INTO decision_steps (decision_id, step_number, status, started_at, completed_at, completed_by, data, notes) VALUES
  (d5, 1, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d5, 2, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d5, 3, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d5, 4, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d5, 5, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d5, 6, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d5, 7, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d5, 8, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d5, 9, 'not_started', NULL, NULL, NULL, NULL, NULL),
  (d5, 10, 'not_started', NULL, NULL, NULL, NULL, NULL);

  -- ============================================================
  -- DECISION 6: Crown Land Lease — East End Development
  -- Status: challenged, judicial_review_flag=true
  -- ============================================================
  INSERT INTO decisions (id, reference_number, title, description, ministry_id, decision_type, status, current_step, created_by, assigned_to, is_public, deadline, metadata, created_at, updated_at)
  VALUES (d6, 'DP-PMO-2025-0014',
    'Crown Land Lease — East End Development',
    'Grant of a 99-year Crown land lease for the East End mixed-use development project comprising 120 residential units, commercial space, and public amenities on 15 acres of Crown land at East End, Tortola.',
    v_pmo, 'financial', 'challenged', 10, v_minister, v_legal, false,
    '2025-11-30'::timestamptz,
    '{"priority": "critical", "leaseTermYears": 99, "landArea_acres": 15, "estimatedValue": 8500000, "developmentPartner": "Caribbean Development Holdings Ltd"}'::jsonb,
    '2025-08-15 09:00:00+00', '2026-03-01 10:00:00+00');

  UPDATE decisions SET judicial_review_flag = true WHERE id = d6;

  INSERT INTO decision_steps (decision_id, step_number, status, started_at, completed_at, completed_by, data, notes) VALUES
  (d6, 1, 'completed', '2025-08-15 09:00:00+00', '2025-08-15 14:00:00+00', v_minister,
    '{"legalBasis": "Crown Lands Act 1970, s.6(1)", "authoritySource": "Premier and Minister of Finance", "legislativeReference": "Crown Lands Regulations 1972"}'::jsonb,
    'Authority under Crown Lands Act confirmed'),
  (d6, 2, 'completed', '2025-08-18 08:00:00+00', '2025-08-29 17:00:00+00', v_secretary,
    '{"evidenceSummary": "Land survey and valuation; environmental baseline assessment; demand analysis for residential units; financial viability study", "documentsReviewed": 19, "independentValuation": 8200000}'::jsonb,
    'Comprehensive evidence package assembled'),
  (d6, 3, 'completed', '2025-09-01 09:00:00+00', '2025-09-03 16:00:00+00', v_minister,
    '{"optionsConsidered": ["99-year lease at market rate", "50-year lease with review clause", "Public tender process", "Joint venture with Government"], "selectedOption": "99-year lease at market rate", "rationale": "Attracts investment certainty; consistent with prior Crown land disposals"}'::jsonb,
    'Direct lease at market rate selected'),
  (d6, 4, 'completed', '2025-09-04 09:00:00+00', '2025-09-08 12:00:00+00', v_legal,
    '{"humanRightsAssessment": "Adjacent community access rights preserved; public beach access covenant included", "equalityScreening": "Affordable housing component (20% of units) mitigates displacement risk", "environmentalImpact": "EIA required — conditions to include mangrove buffer retention"}'::jsonb,
    'Rights assessment completed with conditions'),
  (d6, 5, 'completed', '2025-09-09 09:00:00+00', '2025-10-03 17:00:00+00', v_secretary,
    '{"consultees": ["East End community", "Town and Country Planning", "Environmental Health Division", "BVI Chamber of Commerce"], "responsesReceived": 67, "materialChanges": "Added requirement for community recreation space and increased affordable housing to 25%"}'::jsonb,
    'Significant community feedback incorporated'),
  (d6, 6, 'completed', '2025-10-06 09:00:00+00', '2025-10-08 15:00:00+00', v_legal,
    '{"legalReview": "Lease terms consistent with Crown Lands Act; EIA conditions legally enforceable", "viresConfirmed": true, "draftingNotes": "Lease instrument and covenants drafted"}'::jsonb,
    'Legal review completed'),
  (d6, 7, 'completed', '2025-10-13 09:00:00+00', '2025-10-13 16:00:00+00', v_minister,
    '{"decisionMaker": "Premier", "decisionDate": "2025-10-13", "reasonsGiven": true, "conditionsAttached": ["EIA compliance", "25% affordable housing", "Community recreation space", "Public beach access", "Mangrove buffer"]}'::jsonb,
    'Premier approved lease with conditions'),
  (d6, 8, 'completed', '2025-10-14 09:00:00+00', '2025-10-20 12:00:00+00', v_secretary,
    '{"notifiedParties": ["Caribbean Development Holdings Ltd", "East End residents", "Town and Country Planning", "Registrar of Lands"], "notificationMethod": "Gazette, registered post, community meeting", "appealRightsStated": true}'::jsonb,
    'All parties notified including community meeting held'),
  (d6, 9, 'completed', '2025-10-21 09:00:00+00', '2025-11-04 17:00:00+00', v_secretary,
    '{"implementationPlan": "Lease execution upon EIA completion; construction phasing over 36 months", "resourcesAllocated": "Lands Department monitoring officer", "milestones": ["EIA completion", "Lease execution", "Phase 1 construction start", "Affordable units delivery"]}'::jsonb,
    'Phased implementation plan established'),
  (d6, 10, 'completed', '2025-11-05 09:00:00+00', '2025-11-10 14:00:00+00', v_auditor,
    '{"reviewDate": "2026-10-13", "reviewCriteria": "EIA compliance, construction progress, affordable housing delivery", "lessonsLearned": "Community engagement should begin before options analysis — late consultation created unnecessary opposition"}'::jsonb,
    'Annual review set; lessons on early engagement noted');

  -- ============================================================
  -- COMMENTS on Decision 3 (School Zoning)
  -- ============================================================
  INSERT INTO comments (decision_id, user_id, content, is_internal, created_at) VALUES
  (d3, v_secretary, 'Initial consultation responses from Althea Scatliffe PTA are strongly negative — parents concerned about longer commute times for their children. We may need to strengthen the transport provision commitment before the consultation closes.', true, '2026-03-10 14:30:00+00'),
  (d3, v_legal, 'Note that under the Education Act s.22(5), we must give affected parents at least 60 days notice before any boundary change takes effect. If we are targeting September 2026, the decision must be made no later than June 30.', true, '2026-03-12 09:15:00+00'),
  (d3, v_minister, 'Can we arrange a public meeting at the Althea Scatliffe school hall? Direct engagement with concerned parents would be more effective than written consultation alone. Please coordinate with both PTAs.', false, '2026-03-15 11:00:00+00'),
  (d3, v_secretary, 'Public meeting scheduled for March 28 at Althea Scatliffe Primary, 6:00 PM. Both PTAs confirmed attendance. I have also invited the bus operators to present the proposed transport routes.', false, '2026-03-18 16:00:00+00');

  -- ============================================================
  -- JUDICIAL REVIEW for Decision 6 (Crown Land Lease)
  -- ============================================================
  INSERT INTO judicial_reviews (decision_id, ground, status, filed_date, court_reference, notes, created_by) VALUES
  (d6, 'procedural_impropriety', 'filed', '2026-01-15',
    'BVIHC 2026/0042',
    'Claim filed by East End Residents Association alleging inadequate consultation under Crown Lands Act s.6(3) — specifically that the community meeting was held after the decision was effectively taken, rendering consultation a formality. Claimants also allege failure to consider alternative sites as required by planning policy.',
    v_legal);

  -- ============================================================
  -- AUDIT ENTRIES
  -- ============================================================
  INSERT INTO audit_entries (decision_id, user_id, action, step_number, detail, ip_address, previous_hash, entry_hash, created_at) VALUES
  (d1, v_minister, 'decision_created', NULL, '{"title": "Financial Services Licensing Amendment", "type": "licensing"}'::jsonb, '10.0.1.50', NULL, 'pending', '2026-01-05 09:00:00+00'),
  (d1, v_minister, 'step_completed', 7, '{"step": "Decision", "outcome": "Approved with conditions"}'::jsonb, '10.0.1.50', 'pending', 'pending', '2026-01-27 16:00:00+00'),
  (d1, v_secretary, 'status_changed', NULL, '{"from": "approved", "to": "published"}'::jsonb, '10.0.1.51', 'pending', 'pending', '2026-02-25 14:30:00+00'),
  (d3, v_minister, 'decision_created', NULL, '{"title": "School Zoning Boundary Adjustment", "type": "planning"}'::jsonb, '10.0.1.50', 'pending', 'pending', '2026-02-10 09:00:00+00'),
  (d6, v_minister, 'decision_created', NULL, '{"title": "Crown Land Lease — East End Development", "type": "financial"}'::jsonb, '10.0.1.50', 'pending', 'pending', '2025-08-15 09:00:00+00'),
  (d6, v_legal, 'status_changed', NULL, '{"from": "approved", "to": "challenged", "reason": "Judicial review filed — BVIHC 2026/0042"}'::jsonb, '10.0.1.52', 'pending', 'pending', '2026-01-15 12:00:00+00');

END;
$$;

COMMIT;
