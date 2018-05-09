import * as Populations from './populations';
import { IAgent, IEnvironment, IInteractive, ISpecies, ITrait } from './populations-types';
const { Models: { Agents: { BasicPlant }, Environment, Rule, Species, Trait },
        UI: { Interactive } } = Populations;

declare const gImages: {[key: string]: string};

const env: IEnvironment = new Environment({
  columns:  45,
  rows:     45,
  imgPath: require('./images/dirt.jpg'),
  barriers: [],
  wrapEastWest: false,
  wrapNorthSouth: false
});

const maturity = 250;

const cornInfectedTrait: ITrait = new Trait({
                                        name: 'infected',
                                        possibleValues: [ true, false ],
                                        default: false,
                                        float: false,
                                        mutatable: false
                                      });

const corn: ISpecies = new Species({
  speciesName: "Corn",
  agentClass: BasicPlant,
  defs: {
    CHANCE_OF_MUTATION: 0,
    SPROUT_AGE: 10,
    MATURITY_AGE: maturity
  },
  traits: [cornInfectedTrait],
  imageRules: [
    {
      name: 'corn',
      rules: [
        {
          image: {
            path: gImages.corn0,
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
            path: gImages.corn1,
            scale: 1,
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
            path: gImages.corn2,
            scale: 0.8,
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
            path: gImages.corn3,
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
              !agent.get('infected')
            );
          }
        },
        {
          image: {
            path: gImages.corn3Sick,
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
              agent.get('infected')
            );
          }
        },
        {
          image: {
            path: gImages.corn4,
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
              !agent.get('infected')
            );
          }
        },
        {
          image: {
            path: gImages.corn4Sick,
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
              agent.get('infected')
            );
          }
        },
        {
          image: {
            path: gImages.corn5,
            scale: 0.5,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') > maturity && !agent.get('infected')
          }
        },
        {
          image: {
            path: gImages.corn5Sick,
            scale: 0.5,
            anchor: {
              x: 0.5,
              y: 1
            }
          },
          useIf(agent: IAgent) {
            return agent.get('age') > maturity && agent.get('infected')
          }
        }
      ]
    }
  ]
});

const interactive: IInteractive = new Interactive({
  environment: env,
  speedSlider: true,
  addOrganismButtons: [
    {
      species: corn,
      limit: 20,
      imagePath: gImages.corn5
    }
  ]
});

function addCorn(rows: number, columns: number, rowStart: number, colStart: number, spacing: number) {
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const seed = corn.createAgent();
      seed.setLocation({
          x: rowStart + (column * spacing) + (row % 2 === 0 ? 6 : 0),
          y: colStart + (row * spacing) + (column % 2 === 0 ? 4 : 0),
      });
      seed.set('infected', false);
      env.addAgent(seed);
    }
  }
}

export const addCornDense = () => {
  addCorn(10, 10, 45, 90, 38);
}

export const addCornSparse = () => {
  addCorn(6, 6, 50, 110, 60);
}

export function infectInitialCorn(quantity: number) {
  // assume all agents are corn for now
  const indices = Array.from(Array(env.agents.length).keys());
  const shuffled = indices.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1])
  const max = Math.min(quantity, env.agents.length);
  for (let i = 0; i < max; i++) {
    env.agents[shuffled[i]].set('infected', true);
  }
}

export function getCornStats() {
  let count = 0,
      infected = 0;
  env.agents.forEach((a) => {
    if (a.species.speciesName === "Corn") {
      ++ count;
      if (a.get('infected')) {
        ++ infected;
      };
    }
  });
  return { count, infected };
}

export interface IModelParams {
  infectionRate: number;
}

export function initCornModel(simulationElt: HTMLElement | null, params: IModelParams) {
  // no simulationElt is useful for unit testing
  if (simulationElt) {
    simulationElt.appendChild(interactive.getEnvironmentPane());
  }

  env.addRule(new Rule({
    action(agent: IAgent) {
      agent.set('chance of survival', 1);
    }
  }));

  env.addRule(new Rule({
    test:(agent: IAgent) => {
      return agent.get('infected') && agent.get('age') < (maturity * 2);
    },
    action: (agent: IAgent) => {
      const pLifetime = params.infectionRate / 100;
      const pStep = 1 - Math.pow((1-pLifetime), 1/(maturity * 2));
      const loc = agent.getLocation();
      const nearbyAgents = env.getAgentsCloseTo(loc.x, loc.y, 80);
      nearbyAgents.forEach((a: IAgent) => {
        if (Math.random() < pStep) {
          a.set('infected', true);
        }
      });
    }
  }));
}
