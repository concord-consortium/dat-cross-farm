import * as Populations from './populations';
import { IAgent, IEnvironment, IInteractive, ISpecies } from './populations-types';
const { Models: { Agents: { BasicPlant, BasicAnimal }, Environment, Rule, Species, Trait },
        UI: { Interactive } } = Populations;

declare const gImages: {[key: string]: string};

const env: IEnvironment = new Environment({
  columns:  45,
  rows:     45,
  imgPath: gImages.dirt,
  barriers: [],
  wrapEastWest: false,
  wrapNorthSouth: false
});

const maturity = 250;

const corn: ISpecies = new Species({
  speciesName: "Corn",
  agentClass: BasicPlant,
  defs: {
    CHANCE_OF_MUTATION: 0,
    SPROUT_AGE: 10,
    MATURITY_AGE: maturity
  },
  traits: [],
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

const worm: ISpecies = new Species({
  speciesName: "Worm",
  agentClass: BasicAnimal,
  defs: {
    CHANCE_OF_MUTATION: 0,
    SPROUT_AGE: 10,
    MATURITY_AGE: maturity
  },
  traits: [
    new Trait({
    name: 'speed',
    "default": 2
  }), new Trait({
    name: 'prey',
    "default": [
      {
        name: 'corn'
      }
    ]
  }), new Trait({
    name: 'vision distance',
    "default": 10
  }), new Trait({
    name: 'eating distance',
    "default": 5
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
    "default": 0.5
  }), new Trait({
    name: 'wings',
    "default": 0
  })],
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

const interactive: IInteractive = new Interactive({
  environment: env,
  speedSlider: true,
  addOrganismButtons: [
    {
      species: corn,
      limit: 20,
      imagePath: gImages.corn5
    },
    {
      species: worm,
      limit: 20,
      imagePath: gImages.worm2
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

function addWorms(rows: number, columns: number, rowStart: number, colStart: number, spacing: number) {
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const larva = worm.createAgent();
      larva.setLocation({
          x: rowStart + (column * spacing) + (row % 2 === 0 ? 6 : 0),
          y: colStart + (row * spacing) + (column % 2 === 0 ? 4 : 0),
      });
      env.addAgent(larva);
    }
  }
}
export const addWormsSparse = () => {
  addWorms(4, 4, 50, 110, 60);
}

const agentIsCorn = (envAgent: IAgent) => {
  return envAgent.species.speciesName === "Corn";
}

export function infectInitialCorn(quantity: number) {
  // not all agents are corn
  const cornAgents = env.agents.filter(agentIsCorn);

  const indices = Array.from(Array(cornAgents.length).keys());
  const shuffled = indices.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1])
  const max = Math.min(quantity, cornAgents.length);
  for (let i = 0; i < max; i++) {
    cornAgents[shuffled[i]].set('infected', true);
  }
}

export function getCornStats() {
  let count = 0,
      infected = 0;
  env.agents.forEach((a) => {
    if (agentIsCorn(a)) {
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

export function initCornModel(simulationElt: HTMLElement, params: IModelParams) {
  simulationElt.appendChild(interactive.getEnvironmentPane());

  env.addRule(new Rule({
    action(agent: IAgent) {
      agent.set('chance of survival', 1);
    }
  }));

  env.addRule(new Rule({
    test:(agent: IAgent) => {
      return agentIsCorn(agent) && agent.get('infected') && agent.get('age') < (maturity * 2);
    },
    action: (agent: IAgent) => {
      const pLifetime = params.infectionRate / 100;
      const pStep = 1 - Math.pow((1-pLifetime), 1/(maturity * 2));
      const loc = agent.getLocation();
      const nearbyAgents = env.getAgentsCloseTo(loc.x, loc.y, 80);
      nearbyAgents.forEach((a: IAgent) => {
        if (agentIsCorn(a) && Math.random() < pStep) {
          a.set('infected', true);
        }
      });
    }
  }));
}
