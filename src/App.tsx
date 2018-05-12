import * as React from 'react';
import './App.css';
import { initCornModel, addCornDense, addCornSparse, addTrapCropDense, addTrapCropSparse,
  addWormsSparse, getCornStats
} from './corn-model';
import { worm } from './species/rootworm';
import { Events, Environment } from './populations';

interface IAppProps {
  simulationElt: HTMLElement | null;  // null is used for unit tests
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
  wormEatingDistance: number;
  wormEnergy: number;
  wormMetabolism: number;
  wormVisionDistance: number;
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
    wormEatingDistance: 0,
    wormEnergy: 0,
    wormMetabolism: 0,
    wormVisionDistance: 0
  };

  public componentDidMount() {
    initCornModel(this.props.simulationElt, {});

    Events.addEventListener(Environment.EVENTS.STEP, (evt: any) => {
      let { dayFirstCornEaten } = this.state;
      const { countCorn, countTrap, countWorm, infected, simulationDay } = getCornStats();
      const actualDay = Math.trunc(simulationDay / 3);
      if ((this.state.dayFirstCornEaten == null) && (countCorn < this.state.initialCorn)) {
        dayFirstCornEaten = actualDay;
      }
      this.setState({ totalCorn: countCorn, totalTrap: countTrap, totalWorm: countWorm,
                      dayFirstCornEaten, infectedCorn: infected, simulationDay: actualDay });
    });

    Events.addEventListener(Environment.EVENTS.START, (evt: any) => {
      const { countCorn, countTrap, countWorm, infected } = getCornStats();
      this.setState({ initialCorn: countCorn, initialTrap: countTrap, initialWorms: countWorm,
                      dayFirstCornEaten: null, infectedCorn: infected });
    });

    Events.addEventListener(Environment.EVENTS.RESET, (evt: any) => {
      this.setState({ initialCorn: 0, initialTrap: 0, initialWorms: 0,
                      totalCorn: 0, totalTrap: 0, totalWorm: 0,
                      dayFirstCornEaten: null, infectedCorn: 0, simulationDay: 0 });
    });

    Events.addEventListener(Environment.EVENTS.RESET, (evt: any) => {
      const wormEatingDistanceTrait = worm.getTrait('eating distance'),
        wormEnergyTrait = worm.getTrait('energy'),
        wormMetabolismTrait = worm.getTrait('metabolism'),
        wormVisionDistanceTrait = worm.getTrait('vision distance');

      this.setState({
        wormMetabolism: wormMetabolismTrait !== null ? wormMetabolismTrait.getDefaultValue() : 0,
        wormEnergy: wormEnergyTrait !== null ? wormEnergyTrait.getDefaultValue() : 0,
        wormVisionDistance: wormVisionDistanceTrait !== null ? wormVisionDistanceTrait.getDefaultValue() : 0,
        wormEatingDistance: wormEatingDistanceTrait !== null ? wormEatingDistanceTrait.getDefaultValue() : 0
      });
    });
  }

  setDefaultTraitValue = (e: any) => {
    const elem = e.target.id;
    const traitName = elem.replace('input-', '').replace('-',' ');

    const wormTrait = worm.getTrait(traitName);
    if (wormTrait && e.target.value) {
      wormTrait.default = e.target.value;
      switch (traitName) {
        case 'eating distance':
          this.setState({ wormEatingDistance: e.target.value });
          break;
        case 'energy':
          this.setState({ wormEnergy: e.target.value });
          break;
        case 'metabolism':
          this.setState({ wormMetabolism: e.target.value });
          break;
        case 'vision distance':
          this.setState({ wormVisionDistance: e.target.value });
          break;
        default:
          break;
      }
    }
  }

  public render() {
    const { wormMetabolism, wormEnergy, wormVisionDistance, wormEatingDistance } = this.state;
    return (
      <div className="ui">
        <div className="section planting-controls">
          <h4>Planting Controls</h4>
          <div><button id="add-corn-dense" onClick={addCornDense}>
            Plant Corn Densely
          </button></div>
          <div><button id="add-corn-sparse" onClick={addCornSparse}>
            Plant Corn Sparsely
          </button></div>
          <div><button id="add-trap-dense" onClick={addTrapCropDense}>
            Plant Trap Crop Densely
          </button></div>
          <div><button id="add-trap-sparse" onClick={addTrapCropSparse}>
            Plant Trap Crop Sparsely
          </button></div>
          <div><button id="add-worms-sparse" onClick={addWormsSparse}>
            Add Worms
          </button></div>
        </div>
        <div className="section sim-adjustment">
          <h4>Worms</h4>
          <div><span>Metabolism:</span><input id="input-metabolism" type="number" value={wormMetabolism} onChange={this.setDefaultTraitValue} /></div>
          <div><span>Energy:</span><input id="input-energy" type="number" value={wormEnergy} onChange={this.setDefaultTraitValue} /></div>
          <div><span>Vision Distance (larva):</span><input id="input-vision-distance" type="number" value={wormVisionDistance} onChange={this.setDefaultTraitValue}  /></div>
          <div><span>Eating Distance:</span><input id="input-eating-distance" type="number" value={wormEatingDistance} onChange={this.setDefaultTraitValue} /></div>
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
    );
  }
}

export default App;
