import * as React from 'react';
import { Interactive } from '../populations';
import PopulationsModel from './populations-model';
import TimelineView from './timeline-view';

const SEASONS = ["spring", "summer", "fall", "winter"];

interface IProps {
  hideModel?: boolean;
  simulationDay: number;
  interactive?: Interactive;
  onSetInteractive: (interactive: Interactive) => void;
}

interface IState {}

export default class PopulationsModelPanel extends React.Component<IProps, IState> {

  state: IState = {
  };

  public render() {
    const { simulationDay, interactive, onSetInteractive } = this.props,
          populationsModel = !this.props.hideModel
                              ? <PopulationsModel
                                  interactive={interactive}
                                  onSetInteractive={onSetInteractive} />
                              : null,
          // env = interactive && interactive.environment,
          seasonLengths = [50, 50, 50, 50]; // env && env.seasonLengths;
    return (
      <div className="populations-model-panel">
        {populationsModel}
        <TimelineView seasons={SEASONS} seasonLengths={seasonLengths}
                      simulationDay={simulationDay} />
      </div>
    );
  }
}
