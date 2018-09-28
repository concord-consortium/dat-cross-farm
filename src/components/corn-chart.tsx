import * as React from 'react';
// import * as sizeMe from 'react-sizeme';
import { SimulationHistory } from '../models/simulation-history';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

interface IProps extends ISizeMeProps {
  simulationHistory: SimulationHistory;
}

interface IState {}

export default class CornChart extends React.Component<IProps, IState> {

  state: IState = {
  };

  render() {
    const { simulationHistory, size } = this.props,
          width = size && size.width || 400,
          height = size && size.height || 150,
          filtered = simulationHistory.filter((x) => x.initial && x.final),
          // show last five years
          cropped = filtered.filter((x, i) => i >= filtered.length - 5),
          cornData = cropped.map((x) => ({
                      year: `Year ${x.initial.simulationYear + 1}`,
                      planted: x.initial.countCorn,
                      harvested: x.final && x.final.countCorn
                    }));
    // always show five years of data
    while (cornData.length < 5) {
      cornData.push({ year: `Year ${cornData.length + 1}`, planted: 0, harvested: 0 });
    }

    return (
      <BarChart className="corn-chart"
            width={width} height={height} data={cornData} barGap={0}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
       <CartesianGrid strokeDasharray="3 3"/>
       <XAxis dataKey="year"/>
       <YAxis label={{ value: '\xA0\xA0\xA0\xA0\xA0\xA0\xA0Corn', angle: -90, position: 'insideBottomLeft' } as any}/>
       <Tooltip/>
       <Legend />
       <Bar dataKey="planted" fill="#f9ec54" />
       <Bar dataKey="harvested" fill="#77af77" />
      </BarChart>
    );
  }
}

// const sizeMeConfig = { monitorWidth: true, monitorHeight: true, noPlaceholder: true };
// export default sizeMe(sizeMeConfig)(CornChart as any);
