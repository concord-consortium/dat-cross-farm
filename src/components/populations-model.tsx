import * as React from 'react';
import { initCornModel } from '../corn-model';
import { Interactive } from '../populations';

interface IProps {
  interactive?: Interactive;
  onSetInteractive: (interactive: Interactive) => void;
}
interface IState {}

class PopulationsModel extends React.Component<IProps, IState> {

  modelDiv: HTMLDivElement | null;

  state: IState = {
  };

  public componentDidMount() {
    const { onSetInteractive } = this.props,
          interactive = initCornModel(this.modelDiv, {});
    if (onSetInteractive) {
      onSetInteractive(interactive);
    }
  }

  public render() {
    return (
      <div id="environment" ref={(elt) => this.modelDiv = elt } />
    );
  }
}

export default PopulationsModel;
