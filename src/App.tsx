import * as React from 'react';
import './App.css';
import { initCornModel, addCornDense, addCornSparse, addWormsSparse, getCornStats } from './corn-model';
import * as Populations from './populations';
const { Events, Models: { Environment } } = Populations;

interface IAppProps {
  simulationElt: HTMLElement | null;  // null is used for unit tests
}

interface IAppState {
  initialCorn: number;
  initialWorms: number;
  initialInfection: number;
  infectionRate: number;
  totalCorn: number;
  totalWorm: number;
  infectedCorn: number;
  harvestCorn: number;
  simulationDay: number;
}

class App extends React.Component<IAppProps, IAppState> {

  public state: IAppState = {
    initialCorn: 0,
    initialWorms: 0,
    initialInfection: 10,
    infectionRate: 20,
    totalCorn: 0,
    totalWorm: 0,
    infectedCorn: 0,
    harvestCorn: 0,
    simulationDay: 0
  };

  public componentDidMount() {
    initCornModel(this.props.simulationElt, { infectionRate: this.state.infectionRate });

    Events.addEventListener(Environment.EVENTS.STEP, (evt: any) => {
      const { countCorn, countWorm, infected, simulationDay } = getCornStats();
      const actualDay = Math.trunc(simulationDay / 3);
      this.setState({ totalCorn: countCorn, totalWorm: countWorm, infectedCorn: infected, simulationDay: actualDay });
    });

    Events.addEventListener(Environment.EVENTS.START, (evt: any) => {
      const { countCorn, countWorm, infected } = getCornStats();
      this.setState({ initialCorn: countCorn, initialWorms: countWorm, infectedCorn: infected });
    });
  }

  public render() {
    const infectedCornPct = this.state.totalCorn > 0
                              ? Math.round(100 * this.state.infectedCorn / this.state.totalCorn)
                              : 0;
    return (
      <div className="ui">
        <button id="add-corn-dense" onClick={addCornDense}>
          Plant Corn Densely
        </button>
        <br/>
        <button id="add-corn-sparse" onClick={addCornSparse}>
          Plant Corn Sparsely
        </button>
        <br />
        <button id="add-worms-sparse" onClick={addWormsSparse}>
          Add Worms
        </button>
        <br/>
        <div style={{ margin: 5, padding: 5, border: '1px solid' }}>
          Day: <span id="infected">{this.state.simulationDay}</span><br />
          Corn planted: <span id="infected">{this.state.initialCorn}</span><br />
          Corn remaining:<span id="infected">{this.state.totalCorn}</span><br />
          Worms: <span id="infected">{this.state.totalWorm}</span><br />
          Number infected: <span id="infected">{this.state.infectedCorn}</span><br/>
          Percent infected: <span id="percent-infected">{infectedCornPct}</span>%<br/>
        </div>
      </div>
    );
  }
}

export default App;
