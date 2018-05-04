import * as React from 'react';
import './App.css';
import { initCornModel, addCornDense, addCornSparse, infectInitialCorn, getCornStats } from './corn-model';
import * as Populations from './populations';
const { Events, Models: { Environment } } = Populations;

interface IAppProps {
  simulationElt: HTMLElement;
}

interface IAppState {
  initialInfection: number;
  infectionRate: number;
  totalCorn: number;
  infectedCorn: number;
}

class App extends React.Component<IAppProps, IAppState> {

  public state: IAppState = {
    initialInfection: 10,
    infectionRate: 20,
    totalCorn: 0,
    infectedCorn: 0
  }

  public componentDidMount() {
    initCornModel(this.props.simulationElt, { infectionRate: this.state.infectionRate });

    Events.addEventListener(Environment.EVENTS.START, (evt: any) => {
      infectInitialCorn(this.state.initialInfection);
    });  

    Events.addEventListener(Environment.EVENTS.STEP, (evt: any) => {
      const { count, infected } = getCornStats();
      this.setState({ totalCorn: count, infectedCorn: infected });
    });
  }

  private handleInitialInfectionChange = (evt: any) => {
    this.setState({ initialInfection: evt.target.value });
  }

  private handleInfectionRateChange = (evt: any) => {
    this.setState({ infectionRate: evt.target.value });
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
        <br/>
        <label>
          Number infected at start:
          <input size={3} id="initial-infection" value={this.state.initialInfection}
                  onChange={this.handleInitialInfectionChange} />
        </label>
        <br/>
        <label>
          Probability of infection spreading:
          <input size={3} id="infection-rate" value={this.state.infectionRate}
                  onChange={this.handleInfectionRateChange} />%
        </label>
        <br/>
        <div style={{margin: 5, padding: 5, border: '1px solid'}}>
          Number infected: <span id="infected">{this.state.infectedCorn}</span><br/>
          Percent infected: <span id="percent-infected">{infectedCornPct}</span>%<br/>
        </div>
      </div>
    );
  }
}

export default App;
