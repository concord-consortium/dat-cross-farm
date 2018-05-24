import * as React from 'react';
import CropTraitPanel from './crop-trait-panel';
import WormTraitPanel from './worm-trait-panel';
import SpiderTraitPanel from './spider-trait-panel';
import '../style/multi-trait-panel.css';

interface IProps {
}

interface IState {
  panel: string;
}

export default class MultiTraitPanel extends React.Component<IProps, IState> {

  state: IState = {
    panel: 'crop'
  };

  handleChange = (evt: React.FormEvent<HTMLSelectElement>) => {
    this.setState({ panel: evt.currentTarget.value });
  }

  render() {
    const { panel } = this.state,
          cropTraitPanel = panel === 'crop' ? <CropTraitPanel /> : null,
          wormTraitPanel = panel === 'worm' ? <WormTraitPanel /> : null,
          spiderTraitPanel = panel === 'spider' ? <SpiderTraitPanel /> : null;

    return (
      <div className="section sim-adjustment">
        <label className="configure-panel-label">
          Configure:&nbsp;&nbsp;
          <select className="configure-panel-select"
                  value={this.state.panel}
                  onChange={this.handleChange}>
            <option value="crop">Crops</option>
            <option value="worm">Rootworms</option>
            <option value="spider">Spiders</option>
          </select>
        </label>
        <br/>
        <br/>
        {cropTraitPanel}
        {wormTraitPanel}
        {spiderTraitPanel}
      </div>
    );
  }
}
