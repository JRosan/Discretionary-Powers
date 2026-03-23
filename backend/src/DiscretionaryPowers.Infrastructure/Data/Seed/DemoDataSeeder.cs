using System.Text.Json;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Infrastructure.Crypto;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Data.Seed;

public static class DemoDataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Decisions.AnyAsync())
            return;

        var ministries = await context.Ministries.ToDictionaryAsync(m => m.Code, m => m.Id);
        var users = await context.Users.ToDictionaryAsync(u => u.Email, u => u.Id);

        var minister = users["minister@gov.vg"];
        var secretary = users["secretary@gov.vg"];
        var legal = users["legal@gov.vg"];
        var auditor = users["auditor@gov.vg"];
        var admin = users["admin@gov.vg"];

        var now = DateTime.UtcNow;
        var orgId = DataSeeder.DefaultOrgId;

        // ── Decision 1: Published — Financial Services Licensing ──
        var d1 = new Decision
        {
            Id = Guid.NewGuid(),
            ReferenceNumber = "DEC-2025-001",
            Title = "Financial Services Licence — Caribbean Trust Holdings Ltd",
            Description = "Application for a Class III restricted investment business licence under the Securities and Investment Business Act, 2010. The applicant seeks to operate a fund management business from Road Town, Tortola.",
            MinistryId = ministries["FIN"],
            OrganizationId = orgId,
            DecisionType = DecisionType.Licensing,
            Status = DecisionStatus.Published,
            CurrentStep = 10,
            CreatedBy = secretary,
            AssignedTo = minister,
            IsPublic = true,
            Deadline = now.AddDays(-10),
            CreatedAt = now.AddDays(-60),
            UpdatedAt = now.AddDays(-5),
        };

        // ── Decision 2: InProgress at Step 4 — Environmental Protection ──
        var d2 = new Decision
        {
            Id = Guid.NewGuid(),
            ReferenceNumber = "DEC-2025-002",
            Title = "Environmental Impact Assessment — Anegada Reef Resort Expansion",
            Description = "Review of proposed expansion of resort facilities on Anegada, including potential impact on the Horseshoe Reef protected area and nesting grounds for the Anegada rock iguana.",
            MinistryId = ministries["NAT"],
            OrganizationId = orgId,
            DecisionType = DecisionType.Regulatory,
            Status = DecisionStatus.InProgress,
            CurrentStep = 4,
            CreatedBy = secretary,
            AssignedTo = secretary,
            IsPublic = false,
            Deadline = now.AddDays(30),
            CreatedAt = now.AddDays(-20),
            UpdatedAt = now.AddDays(-1),
        };

        // ── Decision 3: UnderReview — School Zoning ──
        var d3 = new Decision
        {
            Id = Guid.NewGuid(),
            ReferenceNumber = "DEC-2025-003",
            Title = "School Zoning Redistricting — East End Primary",
            Description = "Proposal to redistrict primary school boundaries in the Eastern District following population growth in the Long Look and East End areas. Affects approximately 120 families.",
            MinistryId = ministries["EDU"],
            OrganizationId = orgId,
            DecisionType = DecisionType.Planning,
            Status = DecisionStatus.UnderReview,
            CurrentStep = 10,
            CreatedBy = secretary,
            AssignedTo = legal,
            IsPublic = false,
            Deadline = now.AddDays(14),
            CreatedAt = now.AddDays(-45),
            UpdatedAt = now.AddDays(-2),
        };

        // ── Decision 4: Approved — Health Worker Appointment ──
        var d4 = new Decision
        {
            Id = Guid.NewGuid(),
            ReferenceNumber = "DEC-2025-004",
            Title = "Appointment of Chief Medical Officer",
            Description = "Appointment under Section 92 of the Public Service Commission Regulations for the position of Chief Medical Officer at Peebles Hospital.",
            MinistryId = ministries["HEA"],
            OrganizationId = orgId,
            DecisionType = DecisionType.Appointment,
            Status = DecisionStatus.Approved,
            CurrentStep = 10,
            CreatedBy = admin,
            AssignedTo = minister,
            IsPublic = true,
            CreatedAt = now.AddDays(-90),
            UpdatedAt = now.AddDays(-15),
        };

        // ── Decision 5: Draft — Infrastructure Policy ──
        var d5 = new Decision
        {
            Id = Guid.NewGuid(),
            ReferenceNumber = "DEC-2025-005",
            Title = "Road Improvement Priority — West End Access Road",
            Description = "Determination of priority classification for the West End access road rehabilitation project under the Public Works Programme 2025–2027.",
            MinistryId = ministries["COM"],
            OrganizationId = orgId,
            DecisionType = DecisionType.Policy,
            Status = DecisionStatus.Draft,
            CurrentStep = 1,
            CreatedBy = secretary,
            IsPublic = false,
            CreatedAt = now.AddDays(-3),
            UpdatedAt = now.AddDays(-3),
        };

        // ── Decision 6: Challenged — Enforcement Action ──
        var d6 = new Decision
        {
            Id = Guid.NewGuid(),
            ReferenceNumber = "DEC-2025-006",
            Title = "Revocation of Trade Licence — BVI Marine Supplies Ltd",
            Description = "Enforcement action for persistent non-compliance with the Trade Licensing Act, including failure to file annual returns for three consecutive years and operating outside licensed premises.",
            MinistryId = ministries["FIN"],
            OrganizationId = orgId,
            DecisionType = DecisionType.Enforcement,
            Status = DecisionStatus.Challenged,
            CurrentStep = 10,
            CreatedBy = secretary,
            AssignedTo = legal,
            IsPublic = true,
            JudicialReviewFlag = true,
            CreatedAt = now.AddDays(-120),
            UpdatedAt = now.AddDays(-7),
        };

        context.Decisions.AddRange(d1, d2, d3, d4, d5, d6);
        await context.SaveChangesAsync();

        // ── Decision Steps ──

        // D1: All 10 steps completed (Published)
        var d1Steps = CreateAllSteps(d1.Id, secretary, now.AddDays(-60), allCompleted: true);
        context.DecisionSteps.AddRange(d1Steps);

        // D2: Steps 1-3 completed, step 4 in progress
        var d2Steps = CreatePartialSteps(d2.Id, secretary, now.AddDays(-20), completedCount: 3);
        context.DecisionSteps.AddRange(d2Steps);

        // D3: All 10 steps completed (UnderReview)
        var d3Steps = CreateAllSteps(d3.Id, secretary, now.AddDays(-45), allCompleted: true);
        context.DecisionSteps.AddRange(d3Steps);

        // D4: All 10 steps completed (Approved)
        var d4Steps = CreateAllSteps(d4.Id, admin, now.AddDays(-90), allCompleted: true);
        context.DecisionSteps.AddRange(d4Steps);

        // D5: No steps yet (Draft)
        // No steps to create

        // D6: All 10 steps completed (Challenged)
        var d6Steps = CreateAllSteps(d6.Id, secretary, now.AddDays(-120), allCompleted: true);
        context.DecisionSteps.AddRange(d6Steps);

        await context.SaveChangesAsync();

        // ── Comments ──
        var comments = new List<Comment>
        {
            new()
            {
                DecisionId = d1.Id,
                UserId = legal,
                OrganizationId = orgId,
                Content = "Legal basis verified. The Securities and Investment Business Act, 2010 grants the Financial Services Commission authority to issue licences under Part III. The applicant meets all statutory preconditions.",
                IsInternal = true,
                CreatedAt = now.AddDays(-40),
                UpdatedAt = now.AddDays(-40),
            },
            new()
            {
                DecisionId = d1.Id,
                UserId = minister,
                OrganizationId = orgId,
                Content = "Approved. The due diligence process was thorough and the applicant has demonstrated the requisite experience and capitalisation. Ensure the licence conditions include the quarterly reporting requirements.",
                IsInternal = true,
                CreatedAt = now.AddDays(-10),
                UpdatedAt = now.AddDays(-10),
            },
            new()
            {
                DecisionId = d2.Id,
                UserId = legal,
                OrganizationId = orgId,
                Content = "Note: The Environmental Protection and Conservation Ordinance requires a public consultation period of at least 30 days for projects within 500 metres of a protected area. Please confirm this requirement is reflected in Step 7.",
                IsInternal = true,
                CreatedAt = now.AddDays(-10),
                UpdatedAt = now.AddDays(-10),
            },
            new()
            {
                DecisionId = d3.Id,
                UserId = secretary,
                OrganizationId = orgId,
                Content = "Parent consultation sessions were held at the East End community hall on 15 February and 22 February. Approximately 80 parents attended across both sessions. Summary of representations attached.",
                IsInternal = false,
                CreatedAt = now.AddDays(-15),
                UpdatedAt = now.AddDays(-15),
            },
            new()
            {
                DecisionId = d3.Id,
                UserId = auditor,
                OrganizationId = orgId,
                Content = "Reviewed the decision record for completeness. All ten steps are documented. Recommending that the weighting applied in Step 8 be more explicitly justified — the current language could be strengthened.",
                IsInternal = true,
                CreatedAt = now.AddDays(-5),
                UpdatedAt = now.AddDays(-5),
            },
            new()
            {
                DecisionId = d6.Id,
                UserId = legal,
                OrganizationId = orgId,
                Content = "Judicial review has been filed. The applicant challenges on grounds of procedural impropriety, arguing that the 14-day notice period under the Trade Licensing Act was not observed. We are preparing the government response.",
                IsInternal = true,
                CreatedAt = now.AddDays(-7),
                UpdatedAt = now.AddDays(-7),
            },
        };

        context.Comments.AddRange(comments);
        await context.SaveChangesAsync();

        // ── Audit Trail ──
        var auditEntries = new List<(Guid? decisionId, Guid userId, string action, int? stepNumber, string? detail, DateTime createdAt)>
        {
            (d1.Id, secretary, "decision.created", null, """{"title":"Financial Services Licence — Caribbean Trust Holdings Ltd"}""", now.AddDays(-60)),
            (d1.Id, secretary, "step.completed", 1, """{"stepName":"Identify the Source of Power"}""", now.AddDays(-55)),
            (d1.Id, secretary, "step.completed", 5, """{"stepName":"Determine the Standard of Proof"}""", now.AddDays(-35)),
            (d1.Id, secretary, "step.completed", 10, """{"stepName":"Record the Decision"}""", now.AddDays(-15)),
            (d1.Id, minister, "decision.approved", null, """{"approvedBy":"Minister"}""", now.AddDays(-10)),
            (d1.Id, minister, "decision.published", null, null, now.AddDays(-5)),

            (d2.Id, secretary, "decision.created", null, """{"title":"Environmental Impact Assessment — Anegada Reef Resort Expansion"}""", now.AddDays(-20)),
            (d2.Id, secretary, "step.completed", 1, """{"stepName":"Identify the Source of Power"}""", now.AddDays(-18)),
            (d2.Id, secretary, "step.completed", 2, """{"stepName":"Identify Applicable Procedures"}""", now.AddDays(-14)),
            (d2.Id, secretary, "step.completed", 3, """{"stepName":"Gather Relevant Information"}""", now.AddDays(-8)),

            (d3.Id, secretary, "decision.created", null, """{"title":"School Zoning Redistricting — East End Primary"}""", now.AddDays(-45)),
            (d3.Id, secretary, "step.completed", 10, """{"stepName":"Record the Decision"}""", now.AddDays(-10)),
            (d3.Id, secretary, "decision.submitted_for_review", null, null, now.AddDays(-8)),

            (d6.Id, secretary, "decision.created", null, """{"title":"Revocation of Trade Licence — BVI Marine Supplies Ltd"}""", now.AddDays(-120)),
            (d6.Id, minister, "decision.approved", null, null, now.AddDays(-30)),
            (d6.Id, minister, "decision.published", null, null, now.AddDays(-25)),
            (d6.Id, legal, "decision.challenged", null, """{"ground":"procedural_impropriety"}""", now.AddDays(-7)),
        };

        string? previousHash = null;
        long auditId = 1;
        foreach (var (decisionId, userId, action, stepNumber, detail, createdAt) in auditEntries)
        {
            var detailDoc = detail != null ? JsonDocument.Parse(detail) : null;

            var entry = new AuditEntry
            {
                DecisionId = decisionId,
                UserId = userId,
                OrganizationId = orgId,
                Action = action,
                StepNumber = stepNumber,
                Detail = detailDoc,
                IpAddress = "10.0.0.1",
                PreviousHash = previousHash,
                EntryHash = "pending",
                CreatedAt = createdAt,
            };

            context.AuditEntries.Add(entry);
            await context.SaveChangesAsync();

            entry.EntryHash = AuditHashService.ComputeAuditHash(
                entry.Id, entry.DecisionId, entry.UserId,
                entry.Action, entry.Detail, entry.PreviousHash, entry.CreatedAt);

            await context.SaveChangesAsync();
            previousHash = entry.EntryHash;
            auditId++;
        }

        // ── Judicial Review on Decision 6 ──
        var judicialReview = new JudicialReview
        {
            Id = Guid.NewGuid(),
            DecisionId = d6.Id,
            OrganizationId = orgId,
            Ground = JudicialReviewGround.ProceduralImpropriety,
            Status = "filed",
            FiledDate = DateOnly.FromDateTime(now.AddDays(-7)),
            CourtReference = "BVIHCV2025/0042",
            Outcome = null,
            Notes = "The applicant alleges that the statutory 14-day notice period under Section 12(3) of the Trade Licensing Act was not observed prior to the revocation. Government response due within 28 days of filing.",
            CreatedBy = legal,
            CreatedAt = now.AddDays(-7),
            UpdatedAt = now.AddDays(-7),
        };

        context.JudicialReviews.Add(judicialReview);
        await context.SaveChangesAsync();
    }

    private static List<DecisionStep> CreateAllSteps(Guid decisionId, Guid completedBy, DateTime baseDate, bool allCompleted)
    {
        var steps = new List<DecisionStep>();
        for (int i = 1; i <= 10; i++)
        {
            var startedAt = baseDate.AddDays(i * 3);
            var completedAt = baseDate.AddDays(i * 3 + 1);
            steps.Add(new DecisionStep
            {
                Id = Guid.NewGuid(),
                DecisionId = decisionId,
                StepNumber = i,
                Status = allCompleted ? StepStatus.Completed : StepStatus.NotStarted,
                StartedAt = allCompleted ? startedAt : null,
                CompletedAt = allCompleted ? completedAt : null,
                CompletedBy = allCompleted ? completedBy : null,
                Data = CreateStepData(i),
                Notes = CreateStepNotes(i),
                CreatedAt = startedAt,
                UpdatedAt = completedAt,
            });
        }
        return steps;
    }

    private static List<DecisionStep> CreatePartialSteps(Guid decisionId, Guid completedBy, DateTime baseDate, int completedCount)
    {
        var steps = new List<DecisionStep>();
        for (int i = 1; i <= 10; i++)
        {
            var startedAt = baseDate.AddDays(i * 2);
            var completedAt = baseDate.AddDays(i * 2 + 1);
            var isCompleted = i <= completedCount;
            var isInProgress = i == completedCount + 1;

            steps.Add(new DecisionStep
            {
                Id = Guid.NewGuid(),
                DecisionId = decisionId,
                StepNumber = i,
                Status = isCompleted ? StepStatus.Completed
                    : isInProgress ? StepStatus.InProgress
                    : StepStatus.NotStarted,
                StartedAt = isCompleted || isInProgress ? startedAt : null,
                CompletedAt = isCompleted ? completedAt : null,
                CompletedBy = isCompleted ? completedBy : null,
                Data = isCompleted ? CreateStepData(i) : null,
                Notes = isCompleted ? CreateStepNotes(i) : null,
                CreatedAt = isCompleted || isInProgress ? startedAt : baseDate,
                UpdatedAt = isCompleted ? completedAt : baseDate,
            });
        }
        return steps;
    }

    private static JsonDocument? CreateStepData(int stepNumber)
    {
        var json = stepNumber switch
        {
            1 => """{"legalBasis":"The authority derives from Section 47(3) of the Financial Services Commission Act, 2001, read together with Part III of the Securities and Investment Business Act, 2010. The Commission is empowered to grant, refuse, or revoke licences for investment business.","legislativeReference":"Securities and Investment Business Act, 2010 — Part III, Sections 15–22","scopeDescription":"The discretionary power extends to assessing whether the applicant meets the fit and proper criteria as defined in Schedule 2 of the Act, including capitalisation requirements, competence of directors, and adequacy of compliance systems.","authorityConfirmed":true}""",
            2 => """{"proceduresIdentified":"1. Application received and logged per FSC Registry Protocol.\n2. Completeness check within 5 business days.\n3. Due diligence background checks on all directors and beneficial owners.\n4. Site inspection if physical presence required.\n5. Recommendation report prepared for the Board.\n6. Board consideration at scheduled meeting.\n7. Decision communicated within 10 business days of Board meeting.","statutoryRequirements":"Section 17(2) requires the Commission to consider the application within 90 days. Section 18 mandates written reasons if the application is refused."}""",
            3 => """{"informationSources":"1. Applicant's submission and supporting documents\n2. International Monetary Fund — BVI Financial Stability Assessment (2023)\n3. Eastern Caribbean Central Bank compliance database\n4. Financial Action Task Force mutual evaluation report\n5. Companies Registry records for beneficial ownership verification","keyFacts":"The applicant is a newly incorporated BVI company with three directors, two of whom have prior regulatory experience in the Cayman Islands. Proposed capitalisation of USD 2.5 million exceeds the statutory minimum. The compliance officer holds a recognised professional qualification.","gapsIdentified":"No criminal record checks available from one director's country of origin (St Vincent). Mitigated by obtaining sworn affidavit and reference from the SVG Financial Services Authority."}""",
            4 => """{"evidenceSummary":"Documentary evidence reviewed includes: audited financial statements, directors' CVs and qualification certificates, anti-money laundering programme manual, business plan for the initial three-year period, and client onboarding procedures. All documents were verified for authenticity against originals.","evidenceQuality":"strong","contradictoryEvidence":"Minor discrepancy noted between the capitalisation figure in the business plan (USD 2.4M) and the bank confirmation letter (USD 2.5M). Clarified by applicant — the business plan was drafted prior to a subsequent capital injection."}""",
            5 => """{"standardApplied":"Balance of probabilities","justification":"Licensing decisions under the Securities and Investment Business Act are civil regulatory matters. The balance of probabilities is the appropriate standard, consistent with Eastern Caribbean Supreme Court guidance in FSC v. Omega Fund Ltd [2019] ECSC 47.","thresholdMet":true}""",
            6 => """{"biasAssessment":"No member of the assessment panel has any personal, financial, or professional connection to the applicant, its directors, or its beneficial owners. The declarations register was checked and no entries were found.","conflictsOfInterest":"None identified. All panel members signed the standard conflict-of-interest declaration form dated prior to the commencement of the assessment.","declarationSigned":true}""",
            7 => """{"rightToBeHeard":"The applicant was invited to attend an oral hearing before the assessment panel on 12 January 2025. The applicant's legal counsel attended and made representations on the compliance programme structure. Written submissions were accepted until 19 January 2025.","partiesNotified":true,"representationsReceived":"The applicant submitted a 12-page written representation addressing the initial concerns raised in the preliminary assessment letter, including enhanced KYC procedures and appointment of an independent compliance auditor.","responsesToRepresentations":"All representations were considered. The panel was satisfied that the enhanced KYC procedures addressed the concerns raised. The appointment of an independent compliance auditor was noted as a positive development."}""",
            8 => """{"factorsConsidered":"1. Fitness and propriety of directors and officers\n2. Adequacy of capitalisation\n3. Quality of compliance and AML systems\n4. Business plan viability and risk profile\n5. Reputation risk to the Territory\n6. Economic benefit to the BVI","alternativesConsidered":"1. Grant licence unconditionally\n2. Grant licence with conditions (quarterly reporting, enhanced capital requirement)\n3. Refuse licence and invite re-application after addressing deficiencies\n4. Refuse licence outright","weightingApplied":"Primary weight given to fitness and propriety of directors (40%), adequacy of compliance systems (30%), and capitalisation (20%). Economic benefit and risk factors were secondary considerations (10%).","reasonsForDecision":"The applicant meets all statutory criteria for the grant of a Class III restricted investment business licence. Directors are fit and proper, capitalisation exceeds the statutory minimum, and the compliance framework is adequate. The licence is granted subject to standard conditions including quarterly regulatory reporting."}""",
            9 => """{"communicationMethod":"Official letter on FSC letterhead, sent by registered post and email","dateOfCommunication":"2025-02-01","reasonsProvided":true,"decisionCommunicated":true}""",
            10 => """{"filingReference":"FSC/LIC/2025/CTH-001","retentionPeriod":"Duration of licence plus 7 years after expiry or revocation","documentsAttached":true,"recordCreated":true}""",
            _ => null,
        };

        return json != null ? JsonDocument.Parse(json) : null;
    }

    private static string? CreateStepNotes(int stepNumber)
    {
        return stepNumber switch
        {
            1 => "Authority confirmed by Senior Legal Counsel.",
            3 => "Background checks completed through INTERPOL and FATF databases.",
            5 => "Standard consistent with prior licensing decisions in this jurisdiction.",
            7 => "Applicant's counsel was cooperative and responsive throughout the process.",
            8 => "Panel unanimously recommended approval with standard conditions.",
            10 => "Complete record filed in both physical and electronic registries.",
            _ => null,
        };
    }
}
