import { describe, it, expect } from 'vitest';
import { DECISION_STEPS, USER_ROLES, DECISION_STATUSES } from '@/lib/constants';

describe('DECISION_STEPS', () => {
  it('has exactly 10 entries', () => {
    expect(DECISION_STEPS).toHaveLength(10);
  });

  it('each step has number, name, and description', () => {
    for (const step of DECISION_STEPS) {
      expect(step).toHaveProperty('number');
      expect(step).toHaveProperty('name');
      expect(step).toHaveProperty('description');
      expect(typeof step.number).toBe('number');
      expect(typeof step.name).toBe('string');
      expect(typeof step.description).toBe('string');
      expect(step.name.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('steps are numbered 1 through 10', () => {
    const numbers = DECISION_STEPS.map((s) => s.number);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe('USER_ROLES', () => {
  it('has all 5 roles', () => {
    const roles = Object.values(USER_ROLES);
    expect(roles).toHaveLength(5);
    expect(roles).toContain('minister');
    expect(roles).toContain('permanent_secretary');
    expect(roles).toContain('legal_advisor');
    expect(roles).toContain('auditor');
    expect(roles).toContain('public');
  });
});

describe('DECISION_STATUSES', () => {
  it('has all 7 statuses', () => {
    const statuses = Object.values(DECISION_STATUSES);
    expect(statuses).toHaveLength(7);
    expect(statuses).toContain('draft');
    expect(statuses).toContain('in_progress');
    expect(statuses).toContain('under_review');
    expect(statuses).toContain('approved');
    expect(statuses).toContain('published');
    expect(statuses).toContain('challenged');
    expect(statuses).toContain('withdrawn');
  });
});
