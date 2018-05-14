import { Agent, BasicAnimal, Species, Trait } from '../populations';

const maturity = 5;

const eggTraits = [
  new Trait({
    name: 'hatched',
    default: false
  }),
  new Trait({
    name: 'default speed',
    default: 0
  }),
  new Trait({
    name: 'metabolism',
    default: 0
  })

];

class WormEgg extends BasicAnimal {
  constructor(args: any) {
    super(args);
  }

  step() {

    this.set('speed', 0);
    // if (this.get('hatched') && this.get('age') > maturity) {
    //   this.die();
    // }
  }
}

export const wormEgg = new Species({
  speciesName: "WormEgg",
  agentClass: WormEgg,
  defs: {
    CHANCE_OF_MUTATION: 0,
    MATURITY_AGE: maturity
  },
  traits: eggTraits,
  imageProperties:
    {
      rotate: true,
      initialRotationDirection: -Math.PI
    },
  imageRules: [
    {
      name: 'egg',
      rules: [
        {
          image: {
            path: require('../images/rootworm-larva1.png'),
            scale: 1,
            anchor: {
              x: 0.5,
              y: 0.5
            }
          },
          useIf(agent: Agent) {
            return agent.get('age') < maturity;
          }
        }]
    }]
  });