import * as React from 'react';
import { ISimulationYearState, SimulationHistory } from '../models/simulation-history';
import { CopyIcon } from '../images/flaticon/copy-icon';
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core';
import * as ClipboardJS from 'clipboard';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '../style/copy-stats.css';

interface IMenuProps {
  text: string;
  csv: string;
  json: string;
}
class CopyMenu extends React.Component<IMenuProps, {}> {

  clipboard: any;

  componentDidMount() {
    this.clipboard = new ClipboardJS('.copy-item');

    this.clipboard.on('success', (e: any) => {
      console.log(`Copied text: '${e.text}'`);
    });
  }

  componentWillUnmount() {
    this.clipboard.destroy();
    this.clipboard = null;
  }

  render() {
    return (
      <Menu className="copy-stats-menu">
        <MenuItem className="copy-item"
                  data-clipboard-text={this.props.text}
                  text="Copy as Text" />
        <MenuItem className="copy-item"
                  data-clipboard-text={this.props.csv}
                  text="Copy as CSV" />
        <MenuItem className="copy-item"
                  data-clipboard-text={this.props.json}
                  text="Copy as JSON" />
      </Menu>
    );
  }
}

interface IProps {
  simulationHistory: SimulationHistory;
}
interface IState {}

const names = [
  "Year",
  "Corn Plan %",
  "Corn Planted",
  "Corn Harvested",
  "Corn Yield %",
  "Alfalfa Planted",
  "Alfalfa Remaining",
  "Rootworm Eggs Initial",
  "Rootworm Eggs Final",
  "Harvestmen"
];

export default class CopyStats extends React.Component<IProps, IState> {

  cornPlantPct(state: ISimulationYearState) {
    const { initial: { countCorn, countTrap } } = state;
    return Math.round(100 * countCorn / (countCorn + countTrap));
  }

  cornYield(state: ISimulationYearState) {
    return state.final && state.initial.countCorn
            ? Math.round(100 * state.final.countCorn / state.initial.countCorn)
            : "";
  }

  copyText() {
    const { simulationHistory: history } = this.props;
    let text = names.join("\t") + "\n";
    history.forEach((state, index) => {
      text += `${index + 1}\t`;
      text += `${this.cornPlantPct(state)}\t`;
      text += `${state.initial.countCorn}\t`;
      text += `${state.final ? state.final.countCorn : ''}\t`;
      text += `${state.final ? `${this.cornYield(state)}` : ''}\t`;
      text += `${state.initial.countTrap}\t`;
      text += `${state.final ? state.final.countTrap : ''}\t`;
      text += `${state.initial.countEggs}\t`;
      text += `${state.final ? state.final.countEggs : ''}\t`;
      text += `${state.initial.countSpiders}\n`;
    });
    return (text);
  }

  copyCSV() {
    const { simulationHistory: history } = this.props;
    let text = names.map(name => `"${name}"`)
                    .join(",") + "\n";
              history.forEach((state, index) => {
      text += `${index + 1},`;
      text += `${this.cornPlantPct(state)},`;
      text += `${state.initial.countCorn},`;
      text += `${state.final ? state.final.countCorn : ''},`;
      text += `${state.final ? `${this.cornYield(state)}` : ''},`;
      text += `${state.initial.countTrap},`;
      text += `${state.final ? state.final.countTrap : ''},`;
      text += `${state.initial.countEggs},`;
      text += `${state.final ? state.final.countEggs : ''},`;
      text += `${state.initial.countSpiders}\n`;
    });
    return (text);
  }

  copyJSON() {
    const { simulationHistory: history } = this.props,
          json = history.map((state) => {
            const { initial, final } = state,
                  s: any = { year: initial.simulationYear + 1,
                        initial: {
                          corn: initial.countCorn,
                          alfalfa: initial.countTrap,
                          eggs: initial.countEggs,
                          harvestmen: initial.countSpiders
                        }};
            if (final) {
              s.final = {
                corn: final.countCorn,
                alfalfa: final.countTrap,
                eggs: final.countEggs,
                harvestmen: final.countSpiders
              };
            }
            return s;
          });
    return (JSON.stringify(json, null, 2));
  }

  render() {
    const menu = <CopyMenu text={this.copyText()}
                          csv={this.copyCSV()}
                          json={this.copyJSON()} />;
    return (
      <div style={{ width: 24, height: 24, marginTop: 4, marginLeft: 4 }}>
        <Popover content={menu} position={Position.RIGHT_TOP}>
          <CopyIcon />
        </Popover>
      </div>
    );
  }
}
