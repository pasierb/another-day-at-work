export default [
    {
        name: 'workstation is active',
        action: 'expect',
        expect: { expression: `game.scene.isActive('Workstation')`, equals: true }
    },
    {
        name: 'placeholder controls are inert',
        action: 'expect',
        expect: {
            expression: `game.scene.getScene('Workstation').children.list.filter(object => object.input?.enabled).length`,
            equals: 0
        }
    },
    { name: 'click disabled code placeholder', action: 'click', x: 640, y: 440 },
    {
        name: 'workstation remains unchanged after click',
        action: 'expect',
        expect: {
            expression: `game.scene.isActive('Workstation') && game.scene.getScene('Workstation').children.list.filter(object => object.input?.enabled).length === 0`,
            equals: true
        }
    },
    { name: 'portrait workstation', action: 'screenshot' }
];
