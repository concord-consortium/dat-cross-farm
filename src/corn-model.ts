import * as Populations from './populations';
import { IAgent, IEnvironment, IInteractive } from './populations-types';
import { corn } from './species/corn';
import { worm } from './species/rootworm';
const { Models: { Environment, Rule },
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
  addWorms(1, 1, 1, 1, 60);
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
