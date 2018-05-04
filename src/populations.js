
module.exports = {
    Events: require_brunch('events'),
    Models: {
        Agent: require_brunch('models/agent'),
        Agents: {
            BasicAnimal: require_brunch('models/agents/basic-animal'),
            BasicPlant: require_brunch('models/agents/basic-plant')
        },
        Environment: require_brunch('models/environment'),
        Rule: require_brunch('models/rule'),
        Species: require_brunch('models/species'),
        Trait: require_brunch('models/trait')
    },
    UI: {
        Interactive: require_brunch('ui/interactive'),
        ToolButton: require_brunch('ui/tool-button')
    }
};
