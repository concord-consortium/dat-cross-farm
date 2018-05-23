import * as React from 'react';
import '../style/planting-controls.css';
import '../style/toolbar-buttons.css';

export interface IPlayParams {
  cornPct: number;
  predators: number;
}

interface IProps {
  year: number;
  isRunning: boolean;
  onTogglePlayPause: (params: IPlayParams) => void;
  onReset: () => void;
}
interface IState {
  cornPct: number;
  predators: number;
}

export default class PlantingControls extends React.Component<IProps, IState> {

  state: IState = {
    cornPct: 100,
    predators: 0
  };

  handleCornPctChange = (evt: React.FormEvent<HTMLSelectElement>) => {
    this.setState({ cornPct: Number(evt.currentTarget.value) });
  }

  handlePlayPauseClick = () => {
    const { cornPct, predators } = this.state;
    this.props.onTogglePlayPause({ cornPct, predators });
  }

  handleResetClick = () => {
    this.props.onReset();
  }

  render() {
    const { year } =  this.props,
          { cornPct } = this.state,
          trapPct = 100 - cornPct;
    return (
      <div className="section planting-controls">
        <h4>Annual Planting Plan &mdash; Year {year}</h4>
        <br/>
        <label>
          Corn:&nbsp;&nbsp;
          <select className="corn-percent-select"
                  value={cornPct}
                  onChange={this.handleCornPctChange}>
            <option value="0">0%</option>
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span>Alfalfa:&nbsp;&nbsp;{trapPct}%</span>
        <div className='toolbar'>
          <div className='toolbar-button' onClick={this.handlePlayPauseClick}>
            <div className={this.props.isRunning ? 'pause-icon-button' : 'play-icon-button'} />
          </div>
          <div className='toolbar-button' onClick={this.handleResetClick}>
            <div className='reset-icon-button' />
          </div>
        </div>
      </div>
    );
  }
}
