import { Agent, AgentDistance, BasicAnimal, Species, Trait } from '../populations';

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

const getLifestage = (agent: Agent): number => {
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

interface IPrey { name: string; preference?: number; }

export let wormTraits: Trait[] =
  [
    new Trait({
      name: 'default speed',
      default: 20
    }), new Trait({
      name: 'larva max speed',
      default: 0.5
    }), new Trait({
      // Prey attraction = distance / preference, so a value of one
      // (the default) leaves distance unchanged, but values > 1
      // make the agent more attractive by effecticely shrinking the
      // distance to the agent, while values < 1 make it less attractive
      // by effectively increasing the distance to the prey.
      name: 'prey', "default": [{ name: 'Corn', preference: 1 },
                                { name: 'Trap', preference: 20 }]
    }), new Trait({
      name: 'vision distance',
      default: 60
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

  step() {
    super.step();
    if (this.get('age') === 0) {
      this.set('speed', this.get('larva max speed'));
    }
    if (this.get('age') === maturity) {
      this.set('speed', this.get('default speed'));
      this.set('vision distance', 100);
    }
  }
  eat() {
    const nearest = this._nearestPrey();
    if (nearest) {
      const eatingDist = this.get('eating distance');
      if (nearest.distanceSq < Math.pow(eatingDist, 2)) {
        // we're close enough, eat prey
        this._eatPrey(nearest.agent);
      }
      else {
        // move to prey
        this.chase(nearest);
      }
    }
    else {
      this.wander(this.get('default speed'));
    }
  }

  _eatPrey(prey: Agent) {
    const consumptionRate = this.get('resource consumption rate');
    const currEnergy = this.get('energy');
    this.set('energy', currEnergy + consumptionRate);

    const preyHealth = prey.get('health');
    const newHealth = preyHealth - consumptionRate;
    if (newHealth > 10) {
      prey.set('health', preyHealth - consumptionRate);
    }
    else {
      prey.die();
    }
  }
  wander(speed: number) {
    super.wander(speed);
  }
  chase(nearestAgent: any) {
    super.chase(nearestAgent);
  }
  move(speed: number) {
    // energy currently used as a health-meter for bugs
    const currEnergy = this.get('energy');

    if (currEnergy === 0) {
      this.die();
    }
    if (this.get('current behavior') !== 'eating') {
      if (this.get('age') < maturity) {
        // larva can't move fast
        speed = speed > this.get('larva max speed') ? this.get('larva max speed') : speed;
      } else {
        // adults that fly will use up energy more quickly
        this.set('energy', currEnergy - (speed * 0.5));
      }
      super.move(speed);
    } else {
      // we're eating, move slowly
      super.move(speed * 0.01);
    }
  }
  _nearestPrey(): AgentDistance | null {
    const prey: IPrey[] = this.get('prey');
    if (prey && prey.length) {
      const nearest = this._nearestAgentsMatching({ types: prey, quantity: 100 });
      const target = nearest[0],
            targetWasCorn = target && target.agent.species.speciesName === 'Corn';
      nearest.forEach((a) => {
        const preyName = a.agent.species.speciesName,
              // determine preference for this prey
              preyPreference = prey.reduce((prev: number, curr: IPrey) =>
                ((curr.name === preyName) && (curr.preference != null))
                  ? prev * curr.preference : prev, 1);
        // adjust distance based on preference
        a.distanceSq /= preyPreference;
      });
      // sort by preference-adjusted distance
      nearest.sort((a, b) => a.distanceSq - b.distanceSq);
      // for now, return the most-preferred prey
      const newTarget = nearest[0],
            targetIsTrap = newTarget && newTarget.agent.species.speciesName === 'Trap';
      if (targetWasCorn && targetIsTrap) {
        // console.log(`Worm targeting more distant trap plant!`);
      }
      return nearest[0] || null;
    }
    return null;
  }
}

export const worm = new Species({
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
          useIf(agent: Agent) {
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
          useIf(agent: Agent) {
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
          useIf(agent: Agent) {
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
          useIf(agent: Agent) {
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
          useIf(agent: Agent) {
            return getLifestage(agent) === lifestage.mature;
          }
        }
      ]
    }
  ]
});
