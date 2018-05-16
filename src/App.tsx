import * as React from 'react';
import './style/App.css';
import {
  getCornStats, ISimulationState, kNullSimulationState,
  simulationStepsPerYear, prepareToEndYear, endYear
} from './corn-model';
import { worm } from './species/rootworm';
import { Events, Environment, Interactive, Species } from './populations';
import Attribution from './components/attribution';
import PlantingControls from './components/planting-controls';
import PopulationsModelPanel from './components/populations-model-panel';
import SimulationStatistics from './components/simulation-statistics';
import { forEach } from 'lodash';

interface ITraitSpec {
  species: Species;
  traitName: string;
  stateName: string;
}
const traitMap: { [key: string]: ITraitSpec } = {
  'trait-worm-eating-distance': {
    species: worm,
    traitName: 'eating distance',
    stateName: 'wormEatingDistance'
  },
  'trait-worm-energy': {
    species: worm,
    traitName: 'energy',
    stateName: 'wormEnergy'
  },
  'trait-worm-metabolism': {
    species: worm,
    traitName: 'metabolism',
    stateName: 'wormMetabolism'
  },
  'trait-worm-resource-consumption-rate': {
    species: worm,
    traitName: 'resource consumption rate',
    stateName: 'wormResourceConsumptionRate'
  },
  'trait-worm-speed': {
    species: worm,
    traitName: 'default speed',
    stateName: 'wormSpeed'
  },
  'trait-worm-larva-speed': {
    species: worm,
    traitName: 'larva max speed',
    stateName: 'wormLarvaSpeed'
  },
  'trait-worm-vision-distance': {
    species: worm,
    traitName: 'vision distance adult',
    stateName: 'wormVisionDistance'
  },
  'trait-worm-larva-vision-distance': {
    species: worm,
    traitName: 'vision distance',
    stateName: 'wormVisionDistanceLarva'
  }
};

interface ISimulationYearState {
  initial: ISimulationState;
  final?: ISimulationState;
}

interface IAppProps {
  hideModel?: boolean;
}

interface IAppState {
  interactive?: Interactive;
  simulationState: ISimulationState;
  // store as strings during editing
  wormEatingDistance: string;
  wormEnergy: string;
  wormMetabolism: string;
  wormResourceConsumptionRate: string;
  wormSpeed: string;
  wormLarvaSpeed: string;
  wormVisionDistance: string;
  wormVisionDistanceLarva: string;
}

class App extends React.Component<IAppProps, IAppState> {

  simulationHistory: ISimulationYearState[];

  public state: IAppState = {
    simulationState: kNullSimulationState,
    wormEatingDistance: "",
    wormEnergy: "",
    wormMetabolism: "",
    wormResourceConsumptionRate: "",
    wormSpeed: "",
    wormLarvaSpeed: "",
    wormVisionDistance: "",
    wormVisionDistanceLarva: ""
  };

  constructor(props: IAppProps) {
    super(props);
    this.simulationHistory = [];
  }

  public componentDidMount() {
    const traitState: { [key: string]: string } = {};
    // initialize trait inputs with default trait values
    forEach(traitMap, (spec, key) => {
      const trait = spec.species.getTrait(spec.traitName),
        defaultValue = trait && trait.getDefaultValue();
      if (trait && (traitState != null)) {
        traitState[spec.stateName] = String(defaultValue);
      }
      this.setState(traitState as any);
    });

    Events.addEventListener(Environment.EVENTS.START, (evt: any) => {
      const simulationState = getCornStats(),
            { simulationStepInYear } = simulationState;
      if (simulationStepInYear === 0) {
        this.simulationHistory.push({ initial: simulationState });
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
      this.setState({ simulationState: kNullSimulationState });
    });
  }

  handleSetInteractive = (interactive: Interactive) => {
    this.setState({ interactive });
  }

  updateDefaultTraitValue = (e: React.FormEvent<HTMLInputElement>) => {
    const id = e.currentTarget.id,
          value = e.currentTarget.value,
          traitSpec = traitMap[id],
          stateName = traitSpec && traitSpec.stateName;
    if (stateName) {
      this.setState({ [stateName]: value } as any);
    }
  }

  setDefaultTraitValue = (e: React.FormEvent<HTMLInputElement>) => {
    const id = e.currentTarget.id,
          value = e.currentTarget.value,
          numValue = value && value.length ? Number(e.currentTarget.value) : NaN,
          traitSpec = traitMap[id],
          traitSpecies = traitSpec && traitSpec.species,
          traitName = traitSpec && traitSpec.traitName,
          trait = traitSpecies && traitSpecies.getTrait(traitName);
    if (trait) {
      // only set default value if the value is valid
      if (isFinite(numValue)) {
        trait.default = numValue;
      }
      else {
        // restore default value if invalid value is entered
        this.setState({ [traitSpec.stateName]: trait.getDefaultValue() } as any);
      }
    }
  }

  public render() {
    const { interactive, simulationState, wormMetabolism, wormEnergy, wormVisionDistance, wormVisionDistanceLarva,
            wormEatingDistance, wormResourceConsumptionRate, wormSpeed, wormLarvaSpeed } = this.state,
          { simulationStepInYear } = simulationState;
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
            <div>
              <span>Sensing Distance (larva):</span>
              <input id="trait-worm-larva-vision-distance" type="number"
                value={wormVisionDistanceLarva}
                onChange={this.updateDefaultTraitValue}
                onBlur={this.setDefaultTraitValue} />
            </div>
            <div>
              <span>Sensing Distance (adult):</span>
              <input id="trait-worm-vision-distance" type="number"
                value={wormVisionDistance}
                onChange={this.updateDefaultTraitValue}
                onBlur={this.setDefaultTraitValue} />
              <div>
                <span>Metabolism:</span>
                <input id="trait-worm-metabolism" type="number"
                  value={wormMetabolism}
                  onChange={this.updateDefaultTraitValue}
                  onBlur={this.setDefaultTraitValue} />
              </div>
              <div>
                <span>Energy:</span>
                <input id="trait-worm-energy" type="number"
                  value={wormEnergy}
                  onChange={this.updateDefaultTraitValue}
                  onBlur={this.setDefaultTraitValue} />
              </div>
              <div>
                <span>Eating Distance:</span>
                <input id="trait-worm-eating-distance" type="number"
                  value={wormEatingDistance}
                  onChange={this.updateDefaultTraitValue}
                  onBlur={this.setDefaultTraitValue} />
              </div>
              <div>
                <span>Consumption Rate:</span>
                <input id="trait-worm-resource-consumption-rate" type="number"
                  value={wormResourceConsumptionRate}
                  onChange={this.updateDefaultTraitValue}
                  onBlur={this.setDefaultTraitValue} />
              </div>
              <div>
                <span>Worm speed:</span>
                <input id="trait-worm-speed" type="number"
                  value={wormSpeed}
                  onChange={this.updateDefaultTraitValue}
                  onBlur={this.setDefaultTraitValue} />
              </div>
              <div>
                <span>Worm larva speed:</span>
                <input id="trait-worm-larva-speed" type="number"
                  value={wormLarvaSpeed}
                  onChange={this.updateDefaultTraitValue}
                  onBlur={this.setDefaultTraitValue} />
              </div>
            </div>
          </div>
          <SimulationStatistics simulationState={simulationState}/>
        </div>
        <Attribution />
      </div>
    );
  }
}

export default App;
