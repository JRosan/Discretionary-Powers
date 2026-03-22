import { describe, it, expect } from 'vitest';
import { workflowMachine, type WorkflowState } from '@/modules/decisions/workflow.machine';

describe('workflowMachine', () => {
  describe('createInitialState', () => {
    it('returns correct defaults', () => {
      const state = workflowMachine.createInitialState();
      expect(state.currentStep).toBe(1);
      expect(state.decisionStatus).toBe('draft');
      expect(Object.keys(state.stepStatuses)).toHaveLength(10);
      for (let i = 1; i <= 10; i++) {
        expect(state.stepStatuses[i]).toBe('not_started');
      }
    });
  });

  describe('canTransition', () => {
    it('allows starting step 1', () => {
      const state = workflowMachine.createInitialState();
      const result = workflowMachine.canTransition(state, { stepNumber: 1, action: 'start' });
      expect(result.allowed).toBe(true);
    });

    it('blocks skipping step 1 without a reason', () => {
      const state = workflowMachine.createInitialState();
      const result = workflowMachine.canTransition(state, { stepNumber: 1, action: 'skip' });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('reason must be provided');
    });

    it('blocks starting step 2 before step 1 is done', () => {
      const state = workflowMachine.createInitialState();
      const result = workflowMachine.canTransition(state, { stepNumber: 2, action: 'start' });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Step 1 must be completed');
    });

    it('rejects invalid step numbers', () => {
      const state = workflowMachine.createInitialState();
      expect(workflowMachine.canTransition(state, { stepNumber: 0, action: 'start' }).allowed).toBe(false);
      expect(workflowMachine.canTransition(state, { stepNumber: 11, action: 'start' }).allowed).toBe(false);
    });

    it('blocks transitions on published decisions', () => {
      const state: WorkflowState = {
        ...workflowMachine.createInitialState(),
        decisionStatus: 'published',
      };
      const result = workflowMachine.canTransition(state, { stepNumber: 1, action: 'start' });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('published');
    });
  });

  describe('applyTransition', () => {
    it('start changes step status to in_progress', () => {
      const state = workflowMachine.createInitialState();
      const newState = workflowMachine.applyTransition(state, { stepNumber: 1, action: 'start' });
      expect(newState.stepStatuses[1]).toBe('in_progress');
      expect(newState.currentStep).toBe(1);
    });

    it('start changes decision from draft to in_progress', () => {
      const state = workflowMachine.createInitialState();
      expect(state.decisionStatus).toBe('draft');
      const newState = workflowMachine.applyTransition(state, { stepNumber: 1, action: 'start' });
      expect(newState.decisionStatus).toBe('in_progress');
    });

    it('complete advances to next step', () => {
      let state = workflowMachine.createInitialState();
      state = workflowMachine.applyTransition(state, { stepNumber: 1, action: 'start' });
      state = workflowMachine.applyTransition(state, { stepNumber: 1, action: 'complete' });
      expect(state.stepStatuses[1]).toBe('completed');
      expect(state.currentStep).toBe(2);
    });

    it('completing all steps changes status to under_review', () => {
      let state = workflowMachine.createInitialState();
      for (let i = 1; i <= 10; i++) {
        state = workflowMachine.applyTransition(state, { stepNumber: i, action: 'start' });
        state = workflowMachine.applyTransition(state, { stepNumber: i, action: 'complete' });
      }
      expect(state.decisionStatus).toBe('under_review');
    });

    it('skip requires a reason', () => {
      const state = workflowMachine.createInitialState();
      expect(() => {
        workflowMachine.applyTransition(state, { stepNumber: 1, action: 'skip' });
      }).toThrow('reason must be provided');
    });

    it('skip with reason sets skipped_with_reason', () => {
      const state = workflowMachine.createInitialState();
      const newState = workflowMachine.applyTransition(state, {
        stepNumber: 1,
        action: 'skip',
        skipReason: 'Not applicable',
      });
      expect(newState.stepStatuses[1]).toBe('skipped_with_reason');
    });
  });

  describe('canApprove', () => {
    it('returns true when under_review', () => {
      const state: WorkflowState = {
        ...workflowMachine.createInitialState(),
        decisionStatus: 'under_review',
      };
      expect(workflowMachine.canApprove(state)).toBe(true);
    });

    it('returns false when draft', () => {
      const state = workflowMachine.createInitialState();
      expect(workflowMachine.canApprove(state)).toBe(false);
    });
  });

  describe('canPublish', () => {
    it('returns true when approved', () => {
      const state: WorkflowState = {
        ...workflowMachine.createInitialState(),
        decisionStatus: 'approved',
      };
      expect(workflowMachine.canPublish(state)).toBe(true);
    });

    it('returns false when under_review', () => {
      const state: WorkflowState = {
        ...workflowMachine.createInitialState(),
        decisionStatus: 'under_review',
      };
      expect(workflowMachine.canPublish(state)).toBe(false);
    });
  });

  describe('approve', () => {
    it('works when under_review', () => {
      const state: WorkflowState = {
        ...workflowMachine.createInitialState(),
        decisionStatus: 'under_review',
      };
      const newState = workflowMachine.approve(state);
      expect(newState.decisionStatus).toBe('approved');
    });

    it('throws when not under_review', () => {
      const state = workflowMachine.createInitialState();
      expect(() => workflowMachine.approve(state)).toThrow('must be under review');
    });
  });

  describe('publish', () => {
    it('works when approved', () => {
      const state: WorkflowState = {
        ...workflowMachine.createInitialState(),
        decisionStatus: 'approved',
      };
      const newState = workflowMachine.publish(state);
      expect(newState.decisionStatus).toBe('published');
    });

    it('throws when not approved', () => {
      const state = workflowMachine.createInitialState();
      expect(() => workflowMachine.publish(state)).toThrow('must be approved');
    });
  });

  describe('withdraw', () => {
    it('works for non-published decisions', () => {
      const state = workflowMachine.createInitialState();
      const newState = workflowMachine.withdraw(state);
      expect(newState.decisionStatus).toBe('withdrawn');
    });

    it('throws for published decisions', () => {
      const state: WorkflowState = {
        ...workflowMachine.createInitialState(),
        decisionStatus: 'published',
      };
      expect(() => workflowMachine.withdraw(state)).toThrow('cannot be withdrawn');
    });
  });

  describe('getProgress', () => {
    it('returns 0 for initial state', () => {
      const state = workflowMachine.createInitialState();
      expect(workflowMachine.getProgress(state)).toBe(0);
    });

    it('returns correct percentage after completing steps', () => {
      let state = workflowMachine.createInitialState();
      state = workflowMachine.applyTransition(state, { stepNumber: 1, action: 'start' });
      state = workflowMachine.applyTransition(state, { stepNumber: 1, action: 'complete' });
      expect(workflowMachine.getProgress(state)).toBe(10);
    });

    it('counts skipped steps in progress', () => {
      let state = workflowMachine.createInitialState();
      state = workflowMachine.applyTransition(state, {
        stepNumber: 1,
        action: 'skip',
        skipReason: 'Not needed',
      });
      expect(workflowMachine.getProgress(state)).toBe(10);
    });
  });

  describe('full lifecycle', () => {
    it('completes all steps then approve and publish', () => {
      let state = workflowMachine.createInitialState();

      // Complete all 10 steps
      for (let i = 1; i <= 10; i++) {
        state = workflowMachine.applyTransition(state, { stepNumber: i, action: 'start' });
        state = workflowMachine.applyTransition(state, { stepNumber: i, action: 'complete' });
      }

      expect(state.decisionStatus).toBe('under_review');
      expect(workflowMachine.getProgress(state)).toBe(100);

      // Approve
      state = workflowMachine.approve(state);
      expect(state.decisionStatus).toBe('approved');

      // Publish
      state = workflowMachine.publish(state);
      expect(state.decisionStatus).toBe('published');
    });
  });
});
