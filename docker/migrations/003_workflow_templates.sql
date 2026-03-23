-- Workflow templates and decision type configs for configurable workflows

CREATE TABLE IF NOT EXISTS workflow_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    name text NOT NULL,
    is_default boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_step_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_template_id uuid NOT NULL REFERENCES workflow_templates(id),
    step_number integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    guidance_tips text,
    legal_reference text,
    checklist_items text,
    is_required boolean NOT NULL DEFAULT true,
    UNIQUE(workflow_template_id, step_number)
);

CREATE TABLE IF NOT EXISTS decision_type_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    publication_deadline_days integer NOT NULL DEFAULT 30,
    default_workflow_id uuid REFERENCES workflow_templates(id),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(organization_id, code)
);

-- Seed default BVI workflow template
-- Use a fixed UUID so we can reference it for decision types
DO $$
DECLARE
    default_org_id uuid;
    wf_id uuid := gen_random_uuid();
BEGIN
    -- Get the first organization (BVI default), or use a nil UUID if none exists
    SELECT id INTO default_org_id FROM organizations LIMIT 1;
    IF default_org_id IS NULL THEN
        default_org_id := '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Only seed if no workflow templates exist
    IF NOT EXISTS (SELECT 1 FROM workflow_templates) THEN
        INSERT INTO workflow_templates (id, organization_id, name, is_default, is_active)
        VALUES (wf_id, default_org_id, 'BVI 10-Step Framework', true, true);

        INSERT INTO workflow_step_templates (workflow_template_id, step_number, name, description, is_required) VALUES
        (wf_id, 1, 'Confirm Authority', 'Verify that the decision-maker has the legal authority to make this decision. Identify the specific legislation, regulation, or delegation that grants this power.', true),
        (wf_id, 2, 'Follow Procedures', 'Ensure all mandatory procedural requirements are met. Check for prescribed forms, notice periods, consultation requirements, and other procedural steps.', true),
        (wf_id, 3, 'Gather Information', 'Collect all relevant information needed to make an informed decision. This includes documents, expert opinions, stakeholder input, and any other pertinent data.', true),
        (wf_id, 4, 'Evaluate Evidence', 'Carefully assess all gathered information and evidence. Consider the weight, reliability, and relevance of each piece of evidence.', true),
        (wf_id, 5, 'Standard of Proof', 'Determine and apply the appropriate standard of proof. Consider whether the balance of probabilities or a higher standard applies.', true),
        (wf_id, 6, 'Fairness', 'Ensure the decision-making process is fair to all affected parties. Consider whether there are any conflicts of interest or bias.', true),
        (wf_id, 7, 'Procedural Fairness', 'Provide affected parties with adequate notice and opportunity to be heard. Ensure the right to respond to adverse information.', true),
        (wf_id, 8, 'Consider Merits', 'Evaluate the substantive merits of the matter. Weigh competing considerations and apply relevant policy objectives.', true),
        (wf_id, 9, 'Communicate Decision', 'Prepare a clear and comprehensive decision notice. Include reasons for the decision and information about appeal rights.', true),
        (wf_id, 10, 'Record Decision', 'Create a complete record of the decision-making process. Document all steps taken, evidence considered, and reasons for the final decision.', true);

        -- Seed decision type configs
        INSERT INTO decision_type_configs (organization_id, code, name, description, publication_deadline_days, default_workflow_id) VALUES
        (default_org_id, 'regulatory', 'Regulatory', 'Regulatory decisions and rule-making', 30, wf_id),
        (default_org_id, 'licensing', 'Licensing', 'License grants, renewals, and revocations', 30, wf_id),
        (default_org_id, 'planning', 'Planning', 'Planning and development decisions', 30, wf_id),
        (default_org_id, 'financial', 'Financial', 'Financial and budgetary decisions', 30, wf_id),
        (default_org_id, 'appointment', 'Appointment', 'Staff and board appointments', 30, wf_id),
        (default_org_id, 'policy', 'Policy', 'Policy decisions and directives', 30, wf_id),
        (default_org_id, 'enforcement', 'Enforcement', 'Enforcement and compliance actions', 30, wf_id),
        (default_org_id, 'crown_land', 'Crown Land', 'Crown land allocation and management', 30, wf_id),
        (default_org_id, 'belongership', 'Belongership', 'Belongership applications and decisions', 30, wf_id),
        (default_org_id, 'immigration', 'Immigration', 'Immigration permits and status decisions', 30, wf_id),
        (default_org_id, 'trade_license', 'Trade License', 'Trade license applications and renewals', 30, wf_id),
        (default_org_id, 'work_permit', 'Work Permit', 'Work permit applications and renewals', 30, wf_id),
        (default_org_id, 'customs_exemption', 'Customs Exemption', 'Customs duty exemption requests', 30, wf_id),
        (default_org_id, 'environmental', 'Environmental', 'Environmental permits and assessments', 30, wf_id),
        (default_org_id, 'maritime', 'Maritime', 'Maritime licensing and registration', 30, wf_id),
        (default_org_id, 'other', 'Other', 'Other discretionary decisions', 30, wf_id);
    END IF;
END $$;
