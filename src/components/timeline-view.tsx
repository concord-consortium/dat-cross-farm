import * as React from 'react';
import sizeMe from 'react-sizeme';
import { sum } from 'lodash';

interface IProps extends ISizeMeProps {
  seasons?: string[];
  seasonLengths?: number[];
  simulationDay: number;
}

interface IState {}

class TimelineView extends React.Component<IProps, IState> {

  state: IState = {
  };

  render() {
    let cumulativeLength = 0;
    const width = this.props.size.width || undefined,
          height = this.props.size.height || undefined,
          { seasons, seasonLengths } = this.props,
          yearLength = seasonLengths ? sum(seasonLengths) : 0,
          cumulativeLengths = seasonLengths && seasonLengths.map((length) => {
                                                cumulativeLength += length;
                                                return cumulativeLength;
                                              }),
          seasonTicks = cumulativeLengths
                          ? cumulativeLengths.map((length, index) => {
                              const x = width && (length / yearLength) * width;
                              return <rect key={index} x={x} width={0.1} height={height} stroke="gray" fill="gray"/>;
                            })
                          : 0,
          seasonLabels = cumulativeLengths
                          ? cumulativeLengths.map((length, index) => {
                              const prevLength = index > 0 ? cumulativeLengths[index-1] : 0,
                                    x = width && (0.5 * (prevLength + length) / yearLength) * width;
                              return <text key={index} style={{textAnchor: 'middle'}} x={x} y={16} fill="gray">
                                      {seasons && seasons[index]}
                                     </text>;
                            })
                          : 0,
          xCurrent = (this.props.simulationDay  / yearLength) * (width || 0);
    return (
      <div className="timeline-view">
        <svg width={width} height={height} >
          <rect width={width} height={height} stroke="gray" strokeWidth={2} fill="transparent"/>
          {seasonTicks}
          {seasonLabels}
          <rect x={xCurrent} width={1} height={height} stroke="gray" fill="gray"/>
        </svg>
      </div>
    );
  }
}

const sizeMeConfig = { monitorWidth: true, monitorHeight: true, noPlaceholder: true };
export default sizeMe(sizeMeConfig)(TimelineView as any);
