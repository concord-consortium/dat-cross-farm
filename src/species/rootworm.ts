import * as Populations from '../populations';
import { IAgent, ISpecies, ITrait } from '../populations-types';
const { Models: { Agents: { BasicAnimal }, Species, Trait } } = Populations;

const maturity = 250;
const lifestage = {
  egg: 0,
  larva: 1,
  grub: 2,
  adult: 3,
  mature: 4
};
const lifestageThresholds = {
  larva: 10,
  grub: maturity * 0.25,
  adult: maturity * 0.5,
  mature: maturity,
};

const getLifestage = (agent: IAgent): number => {
  const age = agent.get('age');
  let stage = lifestage.egg;

  if (age < lifestageThresholds.larva) {
    stage = lifestage.egg;
  }
  if (age >= lifestageThresholds.larva && age < lifestageThresholds.grub) {
    stage = lifestage.larva;
  }
  if (age >= lifestageThresholds.grub && age < lifestageThresholds.adult) {
    stage = lifestage.grub;
  }
  if (age >= lifestageThresholds.adult && age < lifestageThresholds.mature) {
    stage = lifestage.adult;
  }
  if (age >= lifestageThresholds.mature) {
    stage = lifestage.mature;
  }
  return stage;
};

const wormTraits: ITrait[] =
  [
    new Trait({
      name: 'default speed',
      default: 12
    }), new Trait({
      name: 'larva max speed',
      default: 0.5
    }), new Trait({
      name: 'prey', "default": [{ name: 'Corn' }]
    }), new Trait({
      name: 'vision distance',
      default: 100
    }), new Trait({
      name: 'eating distance',
      default: 5
    }), new Trait({
      name: 'mating distance',
      default: 1
    }), new Trait({
      name: 'max offspring',
      default: 3
    }), new Trait({
      name: 'resource consumption rate',
      default: 5
    }), new Trait({
      name: 'metabolism',
      default: 0.2
    }), new Trait({
      name: 'wings',
      default: 0
    }), new Trait({
      name: 'energy',
      default: 100
    }), new Trait({
      name: 'wandering threshold',
      default: 0
    }), new Trait({
      name: 'hunger bonus',
      default: 15
    })
  ];

class WormAnimal extends BasicAnimal {
  constructor(args: any) {
    super(args);
  }
  protected step() {
    super.step();
  }
  protected eat() {
    const nearest = super._nearestPrey();
    // Until we have other plants, assume nearest prey is corn
    if (nearest) {
      const eatingDist = super.get('eating distance');
      if (nearest.distanceSq < Math.pow(eatingDist, 2)) {
        // we're close enough, eat corn
        this._eatCorn(nearest.agent);
      }
      else {
        // move to corn
        this.chase(nearest);
      }
    }
    else {
      super.wander(super.get('default speed'));
    }
  }

  private _eatCorn(cornAgent: IAgent) {
    const consumptionRate = super.get('resource consumption rate');
    const currEnergy = super.get('energy');
    super.set('energy', currEnergy + consumptionRate);

    const cornHealth = cornAgent.get('health');
    const newHealth = cornHealth - consumptionRate;
    if (newHealth > 10) {
      cornAgent.set('health', cornHealth - consumptionRate);
    }
    else {
      cornAgent.die();
    }
  }
  protected wander(speed: number) {
    super.wander(speed);
  }
  protected chase(nearestAgent: any) {
    super.chase(nearestAgent);
  }
  protected move(speed: number) {
    // energy currently used as a health-meter for bugs
    const currEnergy = super.get('energy');

    if (currEnergy === 0) {
      super.die();
    }
    if (super.get('current behavior') !== 'eating') {
      if (super.get('age') < maturity) {
        // larva can't move fast
        speed = speed > super.get('larva max speed') ? super.get('larva max speed') : speed;
      } else {
        // adults that fly will use up energy more quickly
        super.set('energy', currEnergy - (speed * 0.5));
      }
      super.move(speed);
    } else {
      // we're eating, move slowly
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
  imageProperties:
    {
      rotate: true,
      initialRotationDirection: -Math.PI
    },
  imageRules: [
    {
      name: 'worm',
      rules: [
        {
          image: {
            path: require('../images/rootworm-larva1.png'),
            scale: 0.4,
            anchor: {
              x: 0.5,
              y: 0.5
            }
          },
          useIf(agent: IAgent) {
            return getLifestage(agent) === lifestage.egg;
          }
        },
        {
          image: {
            path: require('../images/rootworm-larva1.png'),
            scale: 0.5,
            anchor: {
              x: 0.5,
              y: 0.5
            }
          },
          useIf(agent: IAgent) {
            return getLifestage(agent) === lifestage.larva;
          }
        },
        {
          image: {
            path: require('../images/rootworm-larva2.png'),
            scale: 0.2,
            anchor: {
              x: 0.5,
              y: 0.5
            }
          },
          useIf(agent: IAgent) {
            return getLifestage(agent) === lifestage.grub;
          }
        },
        {
          image: {
            path: require('../images/rootworm-larva2.png'),
            scale: 0.25,
            anchor: {
              x: 0.5,
              y: 0.5
            }
          },
          useIf(agent: IAgent) {
            return getLifestage(agent) === lifestage.adult;
          }
        },
        {
          image: {
            path: require('../images/rootworm-mature.png'),
            scale: 0.05,
            anchor: {
              x: 0.4,
              y: 0.5
            }
          },
          useIf(agent: IAgent) {
            return getLifestage(agent) === lifestage.mature;
          }
        }
      ]
    }
  ]
});
