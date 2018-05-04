import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

const simulationElt = document.getElementById('environment') as HTMLElement;

ReactDOM.render(
  <App simulationElt={simulationElt}/>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
