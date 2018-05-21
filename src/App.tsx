import * as React from 'react';
import './style/App.css';
import {
  getCornStats, ISimulationState, kNullSimulationState,
  simulationStepsPerYear, prepareToEndYear, endYear
} from './corn-model';
import { Events, Environment, Interactive } from './populations';
import Attribution from './components/attribution';
import PlantingControls from './components/planting-controls';
import PopulationsModelPanel from './components/populations-model-panel';
import SimulationStatistics, { ISimulationYearState } from './components/simulation-statistics';
import MultiTraitPanel from './components/multi-trait-panel';
import { urlParams } from './utilities/url-params';
const isInConfigurationMode = urlParams.config !== undefined;

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

  public render() {
    const { interactive, simulationState } = this.state,
          { simulationStepInYear } = simulationState;
    
    return (
      <div className="app">
        <div className="simulation-and-control-panels">
          <div className="simulation-column">
            <PopulationsModelPanel hideModel={this.props.hideModel}
                                    simulationYear={simulationState.simulationYear}
                                    simulationStepInYear={simulationStepInYear}
                                    interactive={interactive}
                                    onSetInteractive={this.handleSetInteractive}/>
          </div>
          <div className="controls-column">
            <PlantingControls />
            {isInConfigurationMode ? <MultiTraitPanel /> : null}
          </div>
        </div>
        <SimulationStatistics simulationState={simulationState} simulationHistory={this.simulationHistory}/>
        <Attribution />
      </div>
    );
  }
}

export default App;
