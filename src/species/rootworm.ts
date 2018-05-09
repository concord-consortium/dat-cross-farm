import * as Populations from '../populations';
import { IAgent, ISpecies, ITrait } from '../populations-types';
const { Models: { Agents: { BasicAnimal }, Species, Trait } } = Populations;

const maturity = 250;

const wormTraits: ITrait[] =
  [
    new Trait({
      name: 'speed',
      "default": 4
    }), new Trait({
      name: 'prey', "default": [{ name: 'Corn' }]
    }), new Trait({
      name: 'vision distance',
      "default": 50
    }), new Trait({
      name: 'eating distance',
      "default": 2
    }), new Trait({
      name: 'mating distance',
      "default": 1
    }), new Trait({
      name: 'max offspring',
      "default": 3
    }), new Trait({
      name: 'resource consumption rate',
      "default": 30
    }), new Trait({
      name: 'metabolism',
      default: 0.1
    }), new Trait({
      name: 'wings',
      default: 0
    }), new Trait({
      name: 'energy',
      default: 100
    }), new Trait({
      name: 'wandering threshold',
      default: 5
    })
  ];

class WormAnimal extends BasicAnimal {

  protected eat() {
    const nearest = super._nearestPrey();
    // Until we have other plants, assume nearest prey is corn
    if (nearest) {
      const eatingDist = super.get('eating distance');
      if (nearest.distanceSq < Math.pow(eatingDist, 2)) {
        // eat corn if still healthy
        const cornHealth = nearest.agent.get('health');
        if (cornHealth > 10) {
          this._eatPrey(nearest.agent);
        } else {
          super.wander(super.get('speed') * 0.75);
        }
      }
      else {
        super.chase(nearest);
      }
    }
    else {
      super.wander(super.get('speed') * 0.75);
    }
  }

  private _eatPrey(agent: any) {
    const consumptionRate = super.get('resource consumption rate');
    const currEnergy = super.get('energy');
    super.set('energy', currEnergy + consumptionRate);

    const cornHealth = agent.get('health');
    const newHealth = cornHealth - consumptionRate;
    if (newHealth > 10) {
      agent.set('health', cornHealth - consumptionRate);
    }
    else {
      agent.die();
    }
  }

  protected move(speed: any) {
    const currEnergy = super.get('energy');
    // console.log(currEnergy, this);
    if (currEnergy === 0) {
      super.die();
    }
    if (super.get('current behavior') !== 'eating') {
      super.move(speed);
    } else {
      super.move(speed * 0.01);
    }
  }
}

export const worm: ISpecies = new Species({
  speciesName: "Worm",
  agentClass: WormAnimal,
  defs: {
    CHANCE_OF_MUTATION: 0,
    MATURITY_AGE: maturity
  },
  traits: wormTraits,
  imageRules: [
    {
      name: 'worm',
      rules: [
        {
          image: {
            path: require('../images/rootworm-larva1.png'),
            scale: 0.4,
            anchor: {
              x: 0.4,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') < 10;
          }
        },
        {
          image: {
            path: require('../images/rootworm-larva1.png'),
            scale: 0.5,
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
            path: require('../images/rootworm-larva2.png'),
            scale: 0.2,
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
            path: require('../images/rootworm-larva2.png'),
            scale: 0.25,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return (
              agent.get('age') >= (maturity * 0.5) &&
              agent.get('age') < (maturity * 0.75)
            );
          }
        },
        {
          image: {
            path: require('../images/rootworm-larva2.png'),
            scale: 0.25,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return (
              agent.get('age') >= (maturity * 0.75) &&
              agent.get('age') < (maturity * 0.9)
            );
          }
        },
        {
          image: {
            path: require('../images/rootworm-mature.png'),
            scale: 0.05,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return (
              agent.get('age') >= (maturity * 0.9)
            );
          }
        }
      ]
    }
  ]
});
