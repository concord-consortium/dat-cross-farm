import * as Populations from '../populations';
import { IAgent, ISpecies, ITrait } from '../populations-types';
const { Models: { Agents: { BasicPlant }, Species, Trait } } = Populations;

const maturity = 250;

const cornInfectedTrait: ITrait = new Trait({
  name: 'infected',
  possibleValues: [ true, false ],
  default: false,
  float: false,
  mutatable: false
});

const cornHealthTrait: ITrait = new Trait({
  name: 'health',
  min: 0,
  max: 100,
  default: 100,
  float: false,
  mutatable: false
});

const healthyTolerance = 90;

export const corn: ISpecies = new Species({
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
            scale: 0.4,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') < 10;
          }
        },
        {
          image: {
            path: require('../images/corn-1.png'),
            scale: 1,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') >= 10 && agent.get('age') < (maturity * 0.25);
          }
        },
        {
          image: {
            path: require('../images/corn-2.png'),
            scale: 0.8,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') >= (maturity * 0.25) && agent.get('age') < (maturity * 0.5);
          }
        },
        {
          image: {
            path: require('../images/corn-3.png'),
            scale: 0.65,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return (
              agent.get('age') >= (maturity * 0.5) &&
              agent.get('age') < (maturity * 0.75) &&
              agent.get('health') > healthyTolerance
            );
          }
        },
        {
          image: {
            path: require('../images/corn-3-sick.png'),
            scale: 0.65,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return (
              agent.get('age') >= (maturity * 0.5) &&
              agent.get('age') < (maturity * 0.75) &&
              agent.get('health') <= healthyTolerance
            );
          }
        },
        {
          image: {
            path: require('../images/corn-4.png'),
            scale: 0.5,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return (
              agent.get('age') >= (maturity * 0.75) &&
              agent.get('age') < maturity &&
              agent.get('health') > healthyTolerance
            );
          }
        },
        {
          image: {
            path: require('../images/corn-4-sick.png'),
            scale: 0.5,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return (
              agent.get('age') >= (maturity * 0.75) &&
              agent.get('age') < maturity &&
              agent.get('health') <= healthyTolerance
            );
          }
        },
        {
          image: {
            path: require('../images/corn-5.png'),
            scale: 0.5,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') > maturity && agent.get('health') === 100;
          }
        },
        {
          image: {
            path: require('../images/corn-5-sick.png'),
            scale: 0.5,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') > maturity && agent.get('health') < 100;
          }
        }
      ]
    }
  ]
});
