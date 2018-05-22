import * as React from 'react';

interface IProps {
  year: number;
  cornPct: number;
  onSetCornPct: (cornPct: number) => void;
}
interface IState {
}

export default class PlantingControls extends React.Component<IProps, IState> {

  state: IState = {
  };

  handleCornPctChange = (evt: React.FormEvent<HTMLSelectElement>) => {
    this.props.onSetCornPct(Number(evt.currentTarget.value));
  }

  render() {
    const { cornPct, year } =  this.props,
          trapPct = 100 - cornPct;
    return (
      <div className="section planting-controls">
        <h4>Annual Planting Plan</h4>
        <h4>Year {year}</h4>
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
      </div>
    );
  }
}
