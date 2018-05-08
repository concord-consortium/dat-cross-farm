import * as Populations from '../populations';
import { IAgent, ISpecies, ITrait } from '../populations-types';
const { Models: { Agents: { BasicAnimal }, Species, Trait } } = Populations;

declare const gImages: { [key: string]: string };

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
      "default": 40
    }), new Trait({
      name: 'eating distance',
      "default": 10
    }), new Trait({
      name: 'mating distance',
      "default": 2
    }), new Trait({
      name: 'max offspring',
      "default": 3
    }), new Trait({
      name: 'resource consumption rate',
      "default": 10
    }), new Trait({
      name: 'metabolism',
      "default": 2
    }), new Trait({
      name: 'wings',
      "default": 0
    })
  ]

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
    const currEnergy = super.get('energy')
    super.set('energy', currEnergy + consumptionRate)

    const cornHealth = agent.get('health');
    const newHealth = cornHealth - consumptionRate;
    if (newHealth > 10) {
      agent.set('health', cornHealth - consumptionRate);
    }
    else {
      agent.die()
    }
  }

  protected move(speed: any) {
    if (super.get('current behavior') !== 'eating') {
      super.move(speed);
    } else {
      super.move(speed * 0.1);
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
            path: gImages.worm0,
            scale: 0.4,
            anchor: {
              x: 0.4,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') < 10
          }
        },
        {
          image: {
            path: gImages.worm0,
            scale: 0.5,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') >= 10 && agent.get('age') < (maturity * 0.25)
          }
        },
        {
          image: {
            path: gImages.worm1,
            scale: 0.3,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') >= (maturity * 0.25) && agent.get('age') < (maturity * 0.5)
          }
        },
        {
          image: {
            path: gImages.worm1,
            scale: 0.4,
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
            path: gImages.worm1,
            scale: 0.5,
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
            path: gImages.worm2,
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
