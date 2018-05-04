import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const simulationElt = document.getElementById('environment') as HTMLElement;
  const div = document.createElement('div');
  ReactDOM.render(<App simulationElt={simulationElt} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
