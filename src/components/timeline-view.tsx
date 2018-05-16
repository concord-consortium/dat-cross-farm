import * as React from 'react';
import TimelineBar from './timeline-bar';
import '../style/timeline-view.css';

interface IProps extends ISizeMeProps {
  year: number;
  seasons?: string[];
  seasonLengths?: number[];
  simulationStep: number;
}

interface IState {}

export default class TimelineView extends React.Component<IProps, IState> {

  state: IState = {
  };

  render() {
    const { seasons, seasonLengths, simulationStep } = this.props,
          year = this.props.year != null ? this.props.year + 1 : 1,
          yearLabel = `Year ${year}`;
    return (
      <div className="timeline-view">
        <span className='year-label'>{yearLabel}</span>
        <TimelineBar seasons={seasons} seasonLengths={seasonLengths} simulationStep={simulationStep} />
      </div>
    );
  }
}
