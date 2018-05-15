import * as React from 'react';
import './App.css';
import {
  addCornDense, addCornSparse, addTrapCropDense, addTrapCropSparse,
  addWormsSparse, getCornStats
} from './corn-model';
import { worm } from './species/rootworm';
import { Environment, Events, Species } from './populations';
import { Attribution } from './components/attribution';
import PopulationsModel from './components/populations-model';
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
  initialCorn: number;
  initialTrap: number;
  initialWorms: number;
  dayFirstCornEaten: number | null;
  totalCorn: number;
  totalTrap: number;
  totalWorm: number;
  infectedCorn: number;
  harvestCorn: number;
  simulationDay: number;
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
    initialCorn: 0,
    initialTrap: 0,
    initialWorms: 0,
    dayFirstCornEaten: null,
    totalCorn: 0,
    totalTrap: 0,
    totalWorm: 0,
    infectedCorn: 0,
    harvestCorn: 0,
    simulationDay: 0,
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

    Events.addEventListener(Environment.EVENTS.STEP, (evt: any) => {
      let { dayFirstCornEaten } = this.state;
      const { countCorn, countTrap, countWorm, infected, simulationDay } = getCornStats();
      const actualDay = Math.trunc(simulationDay / 3);
      if ((this.state.dayFirstCornEaten == null) && (countCorn < this.state.initialCorn)) {
        dayFirstCornEaten = actualDay;
      }
      this.setState({
        totalCorn: countCorn, totalTrap: countTrap, totalWorm: countWorm,
        dayFirstCornEaten, infectedCorn: infected, simulationDay: actualDay
      });
    });

    Events.addEventListener(Environment.EVENTS.START, (evt: any) => {
      const { countCorn, countTrap, countWorm, infected } = getCornStats();
      this.setState({
        initialCorn: countCorn, initialTrap: countTrap, initialWorms: countWorm,
        dayFirstCornEaten: null, infectedCorn: infected
      });
    });

    Events.addEventListener(Environment.EVENTS.RESET, (evt: any) => {
      this.setState({
        initialCorn: 0, initialTrap: 0, initialWorms: 0,
        totalCorn: 0, totalTrap: 0, totalWorm: 0,
        dayFirstCornEaten: null, infectedCorn: 0, simulationDay: 0
      });
    });
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
    const { wormMetabolism, wormEnergy, wormVisionDistance, wormVisionDistanceLarva, wormEatingDistance, wormResourceConsumptionRate, wormSpeed, wormLarvaSpeed } = this.state,
      populationsModel = !this.props.hideModel ? <PopulationsModel /> : null;

    return (
      <div className="app">
        {populationsModel}
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
          <div className="section stats">
            <h4>Statistics</h4>
            <div><span>Day: </span><span>{this.state.simulationDay}</span></div>
            <div><span>Corn planted: </span><span>{this.state.initialCorn}</span></div>
            <div><span>Corn remaining: </span><span>{this.state.totalCorn}</span></div>
            <div><span>First corn eaten: </span><span>{this.state.dayFirstCornEaten}</span></div>
            <div><span>Trap planted: </span><span>{this.state.initialTrap}</span></div>
            <div><span>Trap remaining: </span><span>{this.state.totalTrap}</span></div>
            <div><span>Worms: </span><span>{this.state.totalWorm}</span></div>
          </div>
        </div>
        <Attribution />
      </div>
    );
  }
}

export default App;
