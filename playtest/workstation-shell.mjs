export default [
    {
        name: 'workstation is active',
        action: 'expect',
        expect: { expression: `game.scene.isActive('Workstation')`, equals: true }
    },
    {
        name: 'coding control is interactive',
        action: 'expect',
        expect: { expression: `game.scene.getScene('Workstation').codingActionBackground.input?.enabled`, equals: true }
    },
    { name: 'portrait workstation', action: 'screenshot' }
];
