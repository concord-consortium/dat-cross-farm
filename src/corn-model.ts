import { corn } from './species/corn';
import { worm, wormLifestage, getWormLifestage } from './species/rootworm';
import { wormEgg } from './species/worm-egg';
import { Agent, Environment, Rule, Interactive } from './populations';
import { variedPlants } from './species/varied-plants';

export const simulationDaysPerYear = 200;
export const simulationStepsPerDay = 3;
export const simulationStepsPerYear = simulationDaysPerYear * simulationStepsPerDay;

let simulationStepInYear = 0;

const eggHatchSeason = {
  startStep: 50,
  endStep: 60
};
const env = new Environment({
  columns:  45,
  rows:     45,
  imgPath: require('./images/dirt.jpg'),
  // seasonLengths: [50, 50, 50, 50],
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
      species: wormEgg,
      limit: 20,
      imagePath: require('./images/rootworm-mature.png')
    }
  ]
});

export function plantMixedCrop(cornPct: number) {
  const kRows = 10, kColumns = 13,
        xStart = 30, yStart = 90,
        xSpacing = 32, ySpacing = 38;
  let cycleLength = 4,
      cornPerCycle = Math.round(cornPct / 25);
  if (cornPct === 50) {
    cycleLength = 2;
    cornPerCycle = 1;
  }
  let plantIndex = 0;
  for (let row = 0; row < kRows; row++) {
    for (let column = 0; column < kColumns; column++, plantIndex++) {
      const indexInCycle = plantIndex % cycleLength,
            seed = indexInCycle < cornPerCycle
                    ? corn.createAgent()
                    : variedPlants.createAgent();
      seed.setLocation({
          x: xStart + (column * xSpacing) + (row % 2 === 0 ? 6 : 0),
          y: yStart + (row * ySpacing) + (column % 2 === 0 ? 4 : 0),
      });
      seed.set('infected', false);
      env.addAgent(seed);
    }
  }
}

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
      const larva = wormEgg.createAgent();
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

const agentIsEgg = (envAgent: Agent) => {
  return envAgent.species.speciesName === "WormEgg";
};

const agentIsWorm = (envAgent: Agent) => {
  return envAgent.species.speciesName === "Worm";
};

export interface ISimulationState {
  countCorn: number;
  countTrap: number;
  countWorm: number;
  infected: number;
                                // all simulation values are zero-based
  simulationStep: number;       // cumulative step in simulation
  simulationStepInYear: number; // step in current year
  simulationDay: number;        // day in current year
  simulationYear: number;       // year
}
export const kNullSimulationState: ISimulationState =
        { countCorn: 0, countTrap: 0, countWorm: 0, infected: 0,
          simulationDay: 0, simulationStep: 0, simulationStepInYear: 0, simulationYear: 0 };

export function getCornStats(): ISimulationState {
  let countCorn = 0,
    countTrap = 0,
    countWorm = 0,
    infected = 0;
  const simulationYear = Math.floor(env.date / simulationStepsPerYear);
  const simulationStep = env.date;
  // simulationStepInYear is useful later on for agent rule tests - since those rules execute
  // once per agent per step, this should improve performance.
  simulationStepInYear = simulationStep % simulationStepsPerYear;
  const simulationDay = Math.floor(simulationStepInYear / simulationStepsPerDay);

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
  return { countCorn, countTrap, countWorm, infected,
          simulationStep, simulationStepInYear, simulationDay, simulationYear };
}
export function prepareToEndYear() {
  env.agents.forEach((a) => {
    // we could store location of all eggs, remove everything, then re-create eggs, but it seems that just killing
    // all the non-egg agents does the job just as well.
    if (!agentIsEgg(a)) {
      // kill off / remove all non-egg agents at end of year - this isn't visible until the simulation is restarted
      a.die();
    }
  });
}

export function endYear() {
  env.stop();
}

export interface IModelParams {
}

export function initCornModel(simulationElt: HTMLElement | null, params?: IModelParams): Interactive {
  // no simulationElt is useful for unit testing
  if (simulationElt) {
    const envPane = interactive.getEnvironmentPane();
    if (envPane) {
      simulationElt.appendChild(envPane);
    }
  }

  env.addRule(new Rule({
    test(agent: Agent) {
      // currentYearStep is updated once per step as part of the corn stats
      return simulationStepInYear > eggHatchSeason.startStep &&
              simulationStepInYear < eggHatchSeason.endStep &&
              agentIsEgg(agent) && agent.get('hatched') === false;
    },
    action(agent: Agent) {
      agent.set('hatched', true);
      const wormAgent = worm.createAgent();
      wormAgent.setLocation(agent.getLocation());
      // hatch a worm at the location of the egg
      env.addAgent(wormAgent);
      // remove the egg agent
      agent.die();
    }
  }));
  env.addRule(new Rule({
    action(agent: Agent) {
      agent.set('chance of survival', 1);
    }
  }));

  // NOTE: since rules are executed in the context of agents, if there are
  // no agents, then no rules execute.
  // Every rule test executes once per agent per step.
  env.addRule(new Rule({
    test(agent: Agent) {
      return agentIsWorm(agent) && getWormLifestage(agent) === wormLifestage.mature;
    },
    action(agent: Agent) {
      if (!agent.get('has mated') && agent.get('energy') > 50) {
        const offspring = agent.get('max offspring');
        // lay a number of eggs at the worm's location
        // TODO: vary egg quantity by worm energy?
        for (let i = 0; i < offspring; i++) {
          const wormEggAgent = wormEgg.createAgent();
          wormEggAgent.setLocation(agent.getLocation());
          env.addAgent(wormEggAgent);
        }
        agent.set('has mated', true);
      }
    }
  }));

  return interactive;
}
