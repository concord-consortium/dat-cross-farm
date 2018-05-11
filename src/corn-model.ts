import { corn } from './species/corn';
import { worm } from './species/rootworm';
import { Agent, Environment, Rule, Interactive } from './populations';
import { variedPlants } from './species/varied-plants';

const env = new Environment({
  columns:  45,
  rows:     45,
  imgPath: require('./images/dirt.jpg'),
  barriers: [],
  wrapEastWest: false,
  wrapNorthSouth: false
});

const interactive = new Interactive({
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
  addWorms(8, 8, 40, 80, 20);
};

function addTrapCrop(rows: number, columns: number, rowStart: number, colStart: number, spacing: number) {
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const seed = variedPlants.createAgent();
      seed.setLocation({
          x: rowStart + (column * spacing) + (row % 2 === 0 ? 6 : 0),
          y: colStart + (row * spacing) + (column % 2 === 0 ? 4 : 0),
      });
      seed.set('infected', false);
      env.addAgent(seed);
    }
  }
}

export const addTrapCropDense = () => {
  addTrapCrop(12, 11, 25, 20, 38);
};

export const addTrapCropSparse = () => {
  addTrapCrop(7, 7, 30, 50, 60);
};

const agentIsCorn = (envAgent: Agent) => {
  return envAgent.species.speciesName === "Corn";
};

export function getCornStats() {
  let countCorn = 0,
    countTrap = 0,
    countWorm = 0,
    infected = 0;
  const simulationDay = env.date;
  env.agents.forEach((a) => {
    if (agentIsCorn(a)) {
      ++ countCorn;
      if (a.get('health') < 100) {
        ++ infected;
      }
    } 
    else if (a.species.speciesName === 'Trap') {
      ++ countTrap;
    }
    else if (a.species.speciesName === 'Worm') {
      ++countWorm;
    }
  });
  return { countCorn, countTrap, countWorm, infected, simulationDay };
}

export interface IModelParams {
}

export function initCornModel(simulationElt: HTMLElement | null, params?: IModelParams) {
  // no simulationElt is useful for unit testing
  if (simulationElt) {
    simulationElt.appendChild(interactive.getEnvironmentPane());
  }

  env.addRule(new Rule({
    action(agent: Agent) {
      agent.set('chance of survival', 1);
    }
  }));

  // limit growing season length - at the end of a year, the remaining corn is harvested
  env.addRule(new Rule({
    test() {
      return env.date >= 600;
    },
    action() {
      env.stop();
    }
  }));
}
