import * as React from 'react';
import HelpPopup from './help-popup';
import '../style/configurable-param.css';

interface IProps {
  label: string;
  helpText?: string;
  inputID: string;
  initialValue: string;
  onBlur: (id: string, value: number) => void;
}

interface IState {
  value: string;
}

export default class ConfigurableParam extends React.Component<IProps, IState> {

  state: IState;

  constructor(props: IProps) {
    super(props);
    this.state = { value: props.initialValue };
  }

  handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ value: e.currentTarget.value });
  }

  handleBlur = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value,
          numValue = value && value.length ? Number(value) : NaN;
    // only set default value if the value is valid
    if (isFinite(numValue)) {
      this.props.onBlur(e.currentTarget.id, numValue);
    }
    else {
      // restore default value if invalid value is entered
      this.setState({ value: this.props.initialValue });
    }
  }

  render() {
    const helpPopup = this.props.helpText
                        ? <HelpPopup helpText={this.props.helpText} />
                        : null;
    return (
      <div className="config-param">
        <div className="config-param-label">
          <span>{this.props.label}</span>
          {helpPopup}
        </div>
        <input id={this.props.inputID} className="config-param-input"
          type="number"
          value={this.state.value}
          onChange={this.handleChange}
          onBlur={this.handleBlur} />
      </div>
    );
  }
}
