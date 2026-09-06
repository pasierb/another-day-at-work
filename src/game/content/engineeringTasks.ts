import type { EngineeringTaskDefinition } from '../domain/EngineeringTaskQueue';

export const ENGINEERING_TASKS: readonly EngineeringTaskDefinition[] = Object.freeze([
    { id: 'BUG-4821', title: 'Fix login error', effort: 18, priority: 'urgent', rewardCopy: 'Restore customer access.', riskCopy: 'A rushed patch can weaken stability.', completionEffects: [{ type: 'resource', resource: 'poHappiness', amount: 8 }], technicalDebtEffects: [{ type: 'resource', resource: 'technicalDebt', amount: 2 }] },
    { id: 'TASK-3178', title: 'Improve search', effort: 24, priority: 'high', rewardCopy: 'Faster results delight users.', riskCopy: 'Index strategy needs a deliberate choice.', completionEffects: [{ type: 'resource', resource: 'systemStability', amount: 7 }], midpointDecision: { id: 'search-index', title: 'Choose an indexing strategy', copy: 'The profiling results expose two viable trade-offs.', threshold: 50, choices: [
        { id: 'safe-index', label: 'Build the safe index', description: 'Spend longer and protect production.', gameMinutes: 20, effects: [{ type: 'resource', resource: 'systemStability', amount: 5 }] },
        { id: 'fast-cache', label: 'Ship the cache shortcut', description: 'Move quickly and accept debt.', gameMinutes: 8, effects: [{ type: 'resource', resource: 'technicalDebt', amount: 6 }, { type: 'resource', resource: 'poHappiness', amount: 3 }] }
    ] } },
    { id: 'DEBT-204', title: 'Refactor auth service', effort: 28, priority: 'medium', rewardCopy: 'Retire brittle internals.', riskCopy: 'Touches a mature subsystem.', completionEffects: [{ type: 'resource', resource: 'technicalDebt', amount: -10 }, { type: 'resource', resource: 'systemStability', amount: 5 }] },
    { id: 'TEST-911', title: 'Cover payment retries', effort: 20, priority: 'medium', rewardCopy: 'Catch regressions earlier.', riskCopy: 'Low immediate product visibility.', completionEffects: [{ type: 'resource', resource: 'systemStability', amount: 9 }] },
    { id: 'CHORE-88', title: 'Upgrade build tooling', effort: 14, priority: 'low', rewardCopy: 'Keep the pipeline current.', riskCopy: 'Small compatibility risk.', completionEffects: [{ type: 'resource', resource: 'poHappiness', amount: 4 }], technicalDebtEffects: [{ type: 'resource', resource: 'technicalDebt', amount: -4 }] }
]);
