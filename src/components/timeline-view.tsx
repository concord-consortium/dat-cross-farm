import * as React from 'react';
import TimelineBar from './timeline-bar';
import '../style/timeline-view.css';

interface IProps extends ISizeMeProps {
  seasons?: string[];
  seasonLengths?: number[];
  simulationYear: number;
  simulationStepInYear: number;
}

interface IState {}

export default class TimelineView extends React.Component<IProps, IState> {

  state: IState = {
  };

  render() {
    const { seasons, seasonLengths, simulationStepInYear } = this.props;
    return (
      <div className="timeline-view">
        <TimelineBar seasons={seasons}
                    seasonLengths={seasonLengths}
                    simulationStepInYear={simulationStepInYear} />
      </div>
    );
  }
}
