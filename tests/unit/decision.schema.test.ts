import { describe, it, expect } from 'vitest';
import {
  createDecisionSchema,
  advanceStepSchema,
  stepSchemas,
  listDecisionsSchema,
} from '@/modules/decisions/decision.schema';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('createDecisionSchema', () => {
  it('accepts valid input', () => {
    const result = createDecisionSchema.safeParse({
      title: 'Test Decision',
      ministryId: validUuid,
      decisionType: 'regulatory',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createDecisionSchema.safeParse({
      title: '',
      ministryId: validUuid,
      decisionType: 'regulatory',
    });
    expect(result.success).toBe(false);
  });

  it('rejects title shorter than 3 characters', () => {
    const result = createDecisionSchema.safeParse({
      title: 'ab',
      ministryId: validUuid,
      decisionType: 'regulatory',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid ministryId (not UUID)', () => {
    const result = createDecisionSchema.safeParse({
      title: 'Test Decision',
      ministryId: 'not-a-uuid',
      decisionType: 'regulatory',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid decisionType', () => {
    const result = createDecisionSchema.safeParse({
      title: 'Test Decision',
      ministryId: validUuid,
      decisionType: 'invalid_type',
    });
    expect(result.success).toBe(false);
  });
});

describe('advanceStepSchema', () => {
  it('accepts valid complete action', () => {
    const result = advanceStepSchema.safeParse({
      decisionId: validUuid,
      stepNumber: 1,
      action: 'complete',
    });
    expect(result.success).toBe(true);
  });

  it('rejects step number 0', () => {
    const result = advanceStepSchema.safeParse({
      decisionId: validUuid,
      stepNumber: 0,
      action: 'complete',
    });
    expect(result.success).toBe(false);
  });

  it('rejects step number 11', () => {
    const result = advanceStepSchema.safeParse({
      decisionId: validUuid,
      stepNumber: 11,
      action: 'complete',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid action', () => {
    const result = advanceStepSchema.safeParse({
      decisionId: validUuid,
      stepNumber: 1,
      action: 'invalid_action',
    });
    expect(result.success).toBe(false);
  });
});

describe('stepSchemas', () => {
  it('step 1 accepts valid data', () => {
    const result = stepSchemas[1].safeParse({
      legalBasis: 'Section 5 of the Act',
      scopeDescription: 'Applies to all licensed operators',
      authorityConfirmed: true,
    });
    expect(result.success).toBe(true);
  });

  it('step 1 rejects missing legalBasis', () => {
    const result = stepSchemas[1].safeParse({
      scopeDescription: 'Applies to all licensed operators',
      authorityConfirmed: true,
    });
    expect(result.success).toBe(false);
  });

  it('step 1 rejects authorityConfirmed=false', () => {
    const result = stepSchemas[1].safeParse({
      legalBasis: 'Section 5 of the Act',
      scopeDescription: 'Applies to all licensed operators',
      authorityConfirmed: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('listDecisionsSchema', () => {
  it('applies default limit of 20', () => {
    const result = listDecisionsSchema.parse({});
    expect(result.limit).toBe(20);
  });

  it('accepts custom limit', () => {
    const result = listDecisionsSchema.parse({ limit: 50 });
    expect(result.limit).toBe(50);
  });
});
