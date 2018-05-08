import * as Populations from '../populations';
import { IAgent, ISpecies, ITrait } from '../populations-types';
const { Models: { Agents: { BasicAnimal }, Species, Trait } } = Populations;

declare const gImages: { [key: string]: string };

const maturity = 250;

const wormTraits: ITrait[] =
  [
    new Trait({
      name: 'speed',
      "default": 1
    }), new Trait({
      name: 'prey', "default": [{ name: 'corn' }]
    }), new Trait({
      name: 'vision distance',
      "default": 10
    }), new Trait({
      name: 'eating distance',
      "default": 1
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
      "default": 5
    }), new Trait({
      name: 'wings',
      "default": 0
    })
  ]

class Worm extends BasicAnimal{

  protected wander() {
    // override Wander method to give us a chance to stop worm from moving
    // console.log(this);
    if (super.get('current behavior') !== 'eating') {
      super.wander();
    } else {
      // console.log("no eating");
      return;
    }
  }
}


export const worm: ISpecies = new Species({
  speciesName: "Worm",
  agentClass: Worm,
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
              x: 0.5,
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
            scale: 0.6,
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
            scale: 0.2,
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
            scale: 0.3,
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
            scale: 0.4,
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
