import * as React from 'react';
import './style/App.css';
import {
  getCornStats, ISimulationState, kNullSimulationState,
  simulationStepsPerYear, prepareToEndYear, endYear
} from './corn-model';
import { worm } from './species/rootworm';
import { Events, Environment, Interactive, Species } from './populations';
import Attribution from './components/attribution';
import ConfigurableParam from './components/configurable-param';
import PlantingControls from './components/planting-controls';
import PopulationsModelPanel from './components/populations-model-panel';
import SimulationStatistics, { ISimulationYearState } from './components/simulation-statistics';

interface ITraitSpec {
  species: Species;
  traitName: string;
}
const traitMap: { [key: string]: ITraitSpec } = {
  'trait-worm-eating-distance': {
    species: worm,
    traitName: 'eating distance',
  },
  'trait-worm-energy': {
    species: worm,
    traitName: 'energy',
  },
  'trait-worm-metabolism': {
    species: worm,
    traitName: 'metabolism',
  },
  'trait-worm-resource-consumption-rate': {
    species: worm,
    traitName: 'resource consumption rate',
  },
  'trait-worm-speed': {
    species: worm,
    traitName: 'default speed',
  },
  'trait-worm-larva-speed': {
    species: worm,
    traitName: 'larva max speed',
  },
  'trait-worm-vision-distance': {
    species: worm,
    traitName: 'vision distance adult',
  },
  'trait-worm-larva-vision-distance': {
    species: worm,
    traitName: 'vision distance',
  }
};

interface IAppProps {
  hideModel?: boolean;
}

interface IAppState {
  interactive?: Interactive;
  simulationState: ISimulationState;
}

class App extends React.Component<IAppProps, IAppState> {

  simulationHistory: ISimulationYearState[];

  public state: IAppState = {
    simulationState: kNullSimulationState
  };

  constructor(props: IAppProps) {
    super(props);
    this.simulationHistory = [];
  }

  public componentDidMount() {
    Events.addEventListener(Environment.EVENTS.START, (evt: any) => {
      const simulationState = getCornStats(),
            { simulationStepInYear } = simulationState;
      if (simulationStepInYear === 0) {
        this.simulationHistory.push({ initial: simulationState });
        this.setState({ simulationState });
      }
    });

    Events.addEventListener(Environment.EVENTS.STEP, (evt: any) => {
      const simulationState = getCornStats(),
            { simulationStepInYear, simulationYear } = simulationState;
      this.setState({ simulationState });
      // last step of the year
      if (simulationStepInYear === simulationStepsPerYear - 1) {
        // TODO: this is where we can do more to "harvest" corn, store end-of-year stats, etc.
        // Previously, end-of-year was handled as an environment rule, but this makes more sense since it
        // should only execute once per step.
        this.simulationHistory[simulationYear].final = simulationState;
        prepareToEndYear();
      }
      // stop at the end of the year before starting the new year
      else if (simulationStepInYear === 0) {
        endYear();
      }
    });

    Events.addEventListener(Environment.EVENTS.RESET, (evt: any) => {
      this.simulationHistory = [];
      this.setState({ simulationState: kNullSimulationState });
    });
  }

  handleSetInteractive = (interactive: Interactive) => {
    this.setState({ interactive });
  }

  getDefaultTraitValue = (id: string) => {
    const spec = traitMap[id],
          trait = spec && spec.species.getTrait(spec.traitName),
          defaultValue = trait && trait.getDefaultValue();
    return defaultValue != null ? String(defaultValue) : "";
  }

  setDefaultTraitValue = (id: string, value: number) => {
    const traitSpec = traitMap[id],
          traitSpecies = traitSpec && traitSpec.species,
          traitName = traitSpec && traitSpec.traitName,
          trait = traitSpecies && traitSpecies.getTrait(traitName);
    if (trait) {
      trait.default = value;
    }
  }

  public render() {
    const { interactive, simulationState } = this.state,
          { simulationStepInYear } = simulationState;
    
    const renderConfigParam = (label: string, helpText: string, inputID: string) => {
      // inputID should correspond to entry in trait map
      if (!traitMap[inputID]) {
        console.error(`Invalid trait ID: '${inputID}'`);
      }
      return (
        <ConfigurableParam
          label={label}
          helpText={helpText}
          inputID={inputID}
          initialValue={this.getDefaultTraitValue(inputID)}
          onBlur={this.setDefaultTraitValue}
        />
      );
    };

    return (
      <div className="app">
        <PopulationsModelPanel hideModel={this.props.hideModel}
                                simulationYear={simulationState.simulationYear}
                                simulationStepInYear={simulationStepInYear}
                                interactive={interactive}
                                onSetInteractive={this.handleSetInteractive}/>
        <div className="ui">
          <PlantingControls />
          <div className="section sim-adjustment">
            <h4>Worms</h4>
            {renderConfigParam(
              "Sensing Distance (larva):",
              "Controls the distance that the larval form of the worm can sense nearby food (crops)",
              "trait-worm-larva-vision-distance")}
            {renderConfigParam(
              "Sensing Distance (adult):",
              "Controls the distance that the adult form of the worm can sense nearby food (crops)",
              "trait-worm-vision-distance")}
            {renderConfigParam(
              "Metabolism:",
              "Rate at which energy is depleted during normal activity",
              "trait-worm-metabolism")}
            {renderConfigParam(
              "Energy:",
              "Initial energy for new worms",
              "trait-worm-energy")}
            {renderConfigParam(
              "Eating Distance:",
              "How close the worm must be to food to eat it",
              "trait-worm-eating-distance")}
            {renderConfigParam(
              "Consumption Rate:",
              "Rate at which resources are depleted when eating",
              "trait-worm-resource-consumption-rate")}
            {renderConfigParam(
              "Worm speed:",
              "Maximum speed of the adult rootworm beetle",
              "trait-worm-speed")}
            {renderConfigParam(
              "Worm larva speed:",
              "Maximum speed of the rootworm larvae",
              "trait-worm-larva-speed")}
          </div>
          <SimulationStatistics simulationState={simulationState} simulationHistory={this.simulationHistory}/>
        </div>
        <Attribution />
      </div>
    );
  }
}

export default App;
