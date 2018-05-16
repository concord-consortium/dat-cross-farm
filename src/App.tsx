import * as React from 'react';
import './style/App.css';
import {
  addCornDense, addCornSparse, addTrapCropDense, addTrapCropSparse,
  addWormsSparse, getCornStats, ISimulationState, kNullSimulationState, endYear
} from './corn-model';
import { worm } from './species/rootworm';
import { Events, Environment, Interactive, Species } from './populations';
import Attribution from './components/attribution';
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

interface IAppProps {
  hideModel?: boolean;
}

interface IAppState {
  interactive?: Interactive;
  year: number;
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

  public state: IAppState = {
    year: 0,
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
      const nextCycle = kNullSimulationState;
      const currentStats = getCornStats();
      if (currentStats.simulationDay === 200) {
        nextCycle.simulationYear = currentStats.simulationYear;
      }
      this.setState({ simulationState: nextCycle });
    });

    Events.addEventListener(Environment.EVENTS.STEP, (evt: any) => {
      const currentStats = getCornStats();
      this.setState({ simulationState: currentStats });
      const yearRelativeStep = currentStats.simulationStep / (currentStats.simulationYear + 1);
      if (yearRelativeStep === currentStats.simulationYearLength - 1) {
        // TODO: this is where we can do more to "harvest" corn, store end-of-year stats, etc.
        // Previously, end-of-year was handled as an environment rule, but this makes more sense since it
        // should only execute once per step.
        endYear();
        // Ending year stops the simulation, and the result is still displayed. We ideally need another
        // step after this, to clear the sim (but not using the reset button), leaving just the eggs.
        // We can probably do this by advancing the simulation by one day and pausing immediately after -
        // then prompt the user to sow more corn.
      }
    });

    Events.addEventListener(Environment.EVENTS.STOP, (evt: any) => {
      this.setState({ simulationState: getCornStats() });
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

  plantCornDensely = () => {
    addCornDense();
  }

  plantCornSparsely = () => {
    addCornSparse();
  }

  plantTrapCropDensely = () => {
    addTrapCropDense();
  }

  plantTrapCropSparsely = () => {
    addTrapCropSparse();
  }

  addWorms = () => {
    addWormsSparse();
  }

  public render() {
    const { interactive, simulationState, wormMetabolism, wormEnergy, wormVisionDistance, wormVisionDistanceLarva,
            wormEatingDistance, wormResourceConsumptionRate, wormSpeed, wormLarvaSpeed } = this.state,
          { simulationStep } = simulationState;
    return (
      <div className="app">
        <PopulationsModelPanel hideModel={this.props.hideModel}
                                year={this.state.year}
                                simulationStep={simulationStep}
                                interactive={interactive}
                                onSetInteractive={this.handleSetInteractive}/>
        <div className="ui">
          <div className="section planting-controls">
            <h4>Planting Controls</h4>
            <div><button id="add-corn-dense" onClick={this.plantCornDensely}>
              Plant Corn Densely
            </button></div>
            <div><button id="add-corn-sparse" onClick={this.plantCornSparsely}>
              Plant Corn Sparsely
            </button></div>
            <div><button id="add-trap-dense" onClick={this.plantTrapCropDensely}>
              Plant Trap Crop Densely
            </button></div>
            <div><button id="add-trap-sparse" onClick={this.plantTrapCropSparsely}>
              Plant Trap Crop Sparsely
            </button></div>
            <div><button id="add-worms-sparse" onClick={this.addWorms}>
              Add Worms
            </button></div>
          </div>
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
          <SimulationStatistics year={this.state.year} simulationState={simulationState}/>
        </div>
        <Attribution />
      </div>
    );
  }
}

export default App;
