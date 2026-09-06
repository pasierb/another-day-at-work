import type { InterruptionDefinition } from '../domain/interruptions';

export const SAMPLE_INTERRUPTIONS = Object.freeze([
    {
        id: 'po-scope-request', category: 'product-owner', severity: 'medium', title: 'PRODUCT OWNER',
        copy: 'Can we squeeze one more change into today?',
        escalationStages: [
            { delayGameMs: 45 * 60_000, postponeGameMs: 20 * 60_000, severity: 'high', copy: 'The scope request is now blocking today’s acceptance.', effects: [{ type: 'resource', resource: 'poHappiness', amount: -5 }] },
            { delayGameMs: 35 * 60_000, postponeGameMs: 15 * 60_000, severity: 'critical', copy: 'The Product Owner has escalated the blocked release.', effects: [{ type: 'resource', resource: 'poHappiness', amount: -8 }], followUpIds: ['teammate-help'] }
        ],
        choices: [
            { id: 'accept-scope', label: 'ACCEPT THE CHANGE', description: 'Keep the PO happy, but add debt and lose Focus.', gameMinutes: 25, effects: [
                { type: 'resource', resource: 'poHappiness', amount: 12 }, { type: 'resource', resource: 'technicalDebt', amount: 10 }, { type: 'focus', reduction: 0.2 }
            ] },
            { id: 'negotiate-scope', label: 'NEGOTIATE SCOPE', description: 'Spend longer aligning now and protect the codebase.', gameMinutes: 40, effects: [
                { type: 'resource', resource: 'poHappiness', amount: -6 }, { type: 'resource', resource: 'technicalDebt', amount: -5 }
            ] }
        ]
    },
    {
        id: 'production-errors', category: 'production', severity: 'critical', title: 'PRODUCTION INCIDENT', baseWeight: 1, debtWeightModifier: { perDebtPoint: 0.02, maximum: 3 },
        copy: 'Checkout errors are climbing fast.',
        escalationStages: [
            { delayGameMs: 20 * 60_000, postponeGameMs: 10 * 60_000, severity: 'critical', copy: 'Checkout failures are affecting active customers.', effects: [{ type: 'resource', resource: 'systemStability', amount: -12 }] },
            { delayGameMs: 15 * 60_000, postponeGameMs: 10 * 60_000, severity: 'critical', copy: 'Checkout is broadly unavailable. Immediate action required.', effects: [{ type: 'resource', resource: 'systemStability', amount: -18 }] }
        ],
        choices: [
            { id: 'hotfix', label: 'HOTFIX', description: 'Fast gains; adds debt and an uncertain regression risk.', gameMinutes: 25, effects: [
                { type: 'resource', resource: 'systemStability', amount: 18 }, { type: 'resource', resource: 'poHappiness', amount: 10 }, { type: 'resource', resource: 'technicalDebt', amount: 14 },
                { type: 'delayed', id: 'hotfix-regression', delayGameMs: 30 * 60_000, scheduledFeedback: 'Hotfix shipped; regression monitoring scheduled.', concludedFeedback: 'Hotfix regression check concluded.', effects: [
                    { type: 'probability', id: 'hotfix-regression-outcome', chance: 0.2, debtModifier: { perDebtPoint: 0.01, maximum: 0.8 }, successFeedback: 'The hotfix regressed checkout.', failureFeedback: 'The hotfix held without a regression.', successEffects: [{ type: 'resource', resource: 'systemStability', amount: -20 }, { type: 'resource', resource: 'poHappiness', amount: -8 }], failureEffects: [] }
                ] }
            ] },
            { id: 'investigate', label: 'INVESTIGATE PROPERLY', description: 'Larger time and Stamina cost; no shortcut debt.', gameMinutes: 55, effects: [
                { type: 'resource', resource: 'stamina', amount: -18 }, { type: 'resource', resource: 'systemStability', amount: 24 }
            ] },
            { id: 'rollback', label: 'ROLLBACK', description: 'Safer recovery, but discard current-task progress.', gameMinutes: 35, effects: [
                { type: 'resource', resource: 'systemStability', amount: 12 }, { type: 'resource', resource: 'poHappiness', amount: -5 }, { type: 'task-progress', reduction: 15 }
            ] },
            { id: 'ignore-incident', label: 'IGNORE', description: 'Resolve now and accept a certain stability cost.', gameMinutes: 5, effects: [
                { type: 'resource', resource: 'systemStability', amount: -16 }, { type: 'resource', resource: 'poHappiness', amount: -10 }
            ] }
        ]
    },
    {
        id: 'teammate-help', category: 'teammate', severity: 'low', title: 'TEAMMATE REQUEST',
        copy: 'Jamie is blocked and needs a second pair of eyes.',
        escalationStages: [
            { delayGameMs: 60 * 60_000, postponeGameMs: 25 * 60_000, severity: 'medium', copy: 'Jamie’s blocker now threatens the team delivery.', effects: [{ type: 'resource', resource: 'technicalDebt', amount: 4 }] },
            { delayGameMs: 45 * 60_000, postponeGameMs: 20 * 60_000, severity: 'high', copy: 'The unresolved blocker has stalled the team.', effects: [{ type: 'resource', resource: 'technicalDebt', amount: 7 }] }
        ],
        choices: [
            { id: 'pair-now', label: 'PAIR NOW', description: 'Help immediately, spending time and interrupting Focus.', gameMinutes: 30, effects: [
                { type: 'resource', resource: 'technicalDebt', amount: -8 }, { type: 'focus', reduction: 0.25 }
            ] },
            { id: 'send-notes', label: 'SEND NOTES', description: 'Spend less time, but leave some strain on the team.', gameMinutes: 10, effects: [
                { type: 'resource', resource: 'poHappiness', amount: -4 }, { type: 'focus', reduction: 0.1 }
            ] }
        ]
    }
] as const satisfies readonly InterruptionDefinition[]);
