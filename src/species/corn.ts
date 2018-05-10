import { Agent, BasicPlant, Species, Trait } from '../populations';

const maturity = 300;

const cornInfectedTrait = new Trait({
  name: 'infected',
  possibleValues: [ true, false ],
  default: false,
  float: false,
  mutatable: false
});

const cornHealthTrait = new Trait({
  name: 'health',
  min: 0,
  max: 100,
  default: 100,
  float: false,
  mutatable: false
});

const healthyTolerance = 90;

const cornIsHealthy = (agent: Agent) => {
  return agent.get('health') >= healthyTolerance;
};

export const corn = new Species({
  speciesName: "Corn",
  agentClass: BasicPlant,
  defs: {
    CHANCE_OF_MUTATION: 0,
    SPROUT_AGE: 10,
    MATURITY_AGE: maturity
  },
  traits: [cornInfectedTrait, cornHealthTrait],
  imageRules: [
    {
      name: 'corn',
      rules: [
        {
          image: {
            path: require('../images/corn-0.png'),
            scale: 0.3,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return agent.get('age') < 10;
          }
        },
        {
          image: {
            path: require('../images/corn-1.png'),
            scale: 0.2,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return agent.get('age') >= 10 && agent.get('age') < (maturity * 0.2);
          }
        },
        {
          image: {
            path: require('../images/corn-2.png'),
            scale: 0.2,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return agent.get('age') >= (maturity * 0.2) &&
              agent.get('age') < (maturity * 0.4);
          }
        },
        {
          image: {
            path: require('../images/corn-3.png'),
            scale: 0.2,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return (
              agent.get('age') >= (maturity * 0.4) &&
              agent.get('age') < (maturity * 0.6) &&
              cornIsHealthy(agent)
            );
          }
        },
        {
          image: {
            path: require('../images/corn-3-sick.png'),
            scale: 0.2,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return (
              agent.get('age') >= (maturity * 0.4) &&
              agent.get('age') < (maturity * 0.6) &&
              !cornIsHealthy(agent)
            );
          }
        },
        {
          image: {
            path: require('../images/corn-3.png'),
            scale: 0.2,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return (
              agent.get('age') >= (maturity * 0.6) &&
              agent.get('age') < (maturity * 0.8) &&
              cornIsHealthy(agent)
            );
          }
        },
        {
          image: {
            path: require('../images/corn-3-sick.png'),
            scale: 0.2,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return (
              agent.get('age') >= (maturity * 0.6) &&
              agent.get('age') < (maturity * 0.8) &&
              !cornIsHealthy(agent)
            );
          }
        },
        {
          image: {
            path: require('../images/corn-4.png'),
            scale: 0.25,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return ( agent.get('age') >= (maturity * 0.8) &&
              agent.get('age') < (maturity) &&
              cornIsHealthy(agent)
            );
          }
        },
        {
          image: {
            path: require('../images/corn-2-sick.png'),
            scale: 0.3,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return (agent.get('age') >= (maturity * 0.8) &&
              !cornIsHealthy(agent)
            );
          }
        },
        {
          image: {
            path: require('../images/corn-5.png'),
            scale: 0.25,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return (agent.get('age') >= (maturity) &&
              agent.get('age') < (maturity * 1.2)
              && cornIsHealthy(agent)
            );
          }
        },
        {
          image: {
            path: require('../images/corn-5.png'),
            scale: 0.3,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return (agent.get('age') >= (maturity * 1.2) &&
              agent.get('age') < (maturity * 2)
              && cornIsHealthy(agent)
            );
          }
        },
        {
          image: {
            path: require('../images/corn-6.png'),
            scale: 0.3,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: Agent) {
            return (agent.get('age') >= (maturity * 2)
              && cornIsHealthy(agent)
            );
          }
        },
      ]
    }
  ]
});
