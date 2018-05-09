import * as Populations from './populations';
import { IAgent, IEnvironment, IInteractive } from './populations-types';
import { corn } from './species/corn';
import { worm } from './species/rootworm';
const { Models: { Environment, Rule },
        UI: { Interactive } } = Populations;

const env: IEnvironment = new Environment({
  columns:  45,
  rows:     45,
  imgPath: require('./images/dirt.jpg'),
  barriers: [],
  wrapEastWest: false,
  wrapNorthSouth: false
});

const interactive: IInteractive = new Interactive({
  environment: env,
  speedSlider: true,
  addOrganismButtons: [
    {
      species: corn,
      limit: 20,
      imagePath: require('./images/corn-5.png')
    },
    {
      species: worm,
      limit: 20,
      imagePath: require('./images/rootworm-mature.png')
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
};

export const addCornSparse = () => {
  addCorn(6, 6, 50, 110, 60);
};

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
  addWorms(4, 4, 40, 40, 40);
};

const agentIsCorn = (envAgent: IAgent) => {
  return envAgent.species.speciesName === "Corn";
};

export function getCornStats() {
  let count = 0,
      infected = 0;
  env.agents.forEach((a) => {
    if (agentIsCorn(a)) {
      ++ count;
      if (a.get('health') < 100) {
        ++ infected;
      }
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

}
