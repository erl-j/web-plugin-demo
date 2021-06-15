import * as d3 from "d3";
import * as fc from "d3fc";
import React from "react";
import { CATEGORY_COLORS } from "./Constants";
import data from "./sample_data.json";
import { hexToRgb } from "./utils";

// const loadPlatform = () => {
//   let obj = {};
//   obj.sendMessage = (message, data) => {
//     console.log(`sending message ${message} with data : ${data}`);
//   };
//   return obj;
// };

const H = 833;

const W = 1200;

let vis = null;

let platform = null;

const Space = ({}) => {
  const ref = React.createRef();

  const [selectedSampleIndex, setSelectedSampleIndex] = React.useState();

  const [minProbability, setMinProbability] = React.useState(-0.01);

  const [maxProbability, setMaxProbability] = React.useState(1.01);

  React.useEffect(() => {
    if (platform === null) {
      console.log("loading platform");
      // eslint-disable-next-line no-undef
      platform = loadPlatform();
    }
    console.log("loaded platform");
  });

  React.useEffect(() => {
    if (selectedSampleIndex) {
      console.log(`playing sample ${data[selectedSampleIndex].path}`);
      platform.sendMessage("playSample", [data[selectedSampleIndex].path]);
    }
  }, [selectedSampleIndex]);

  React.useEffect(() => {
    vis = new D3Component(ref.current, { data, setSelectedSampleIndex });
  }, []);

  React.useEffect(() => {
    vis.updateThings({
      data,
      minProbability,
      maxProbability,
    });
  }, [minProbability, maxProbability]);

  return (
    <>
      {/* <div>
        Min like probability
        <input
          type="slider"
          type="range"
          min={-0.01}
          max={1.0}
          step={0.001}
          value={minProbability}
          onChange={(e) => setMinProbability(e.target.value)}
        ></input>
      </div>
      <div>
        Max like probability
        <input
          type="slider"
          type="range"
          min={0.0}
          max={1.01}
          step={0.001}
          value={maxProbability}
          onChange={(e) => setMaxProbability(e.target.value)}
        ></input>
      </div> */}

      <div
        style={{
          cursor: "pointer",
          margin: 30,
          width: W,
          height: H,
        }}
        ref={ref}
      ></div>
    </>
  );
};

export default Space;

class D3Component {
  containerEl;
  props;
  svg;
  data;

  xScale = d3.scaleLinear().domain([0, 1]);

  yScale = d3.scaleLinear().domain([0, 1]);

  pointSeries = fc
    .seriesWebglPoint()
    .mainValue((d) => 1 - d.coord_y)
    .crossValue((d) => d.coord_x)
    .size((d) => 20)
    .decorate((program, points, i) => {
      this.fillColor(program);
    });

  zoom = fc.zoom().on("zoom", () => {
    this.draw();
  });

  chart = fc
    .chartCartesian({
      xScale: this.xScale,
      yScale: this.yScale,
    })
    .webglPlotArea(this.pointSeries)
    .decorate((selection) => {
      selection.enter().call(this.zoom, this.xScale, this.yScale);
      selection.on("click", (event, data) => {
        let cx = this.xScale.invert(event.offsetX);
        let cy = this.yScale.invert(event.offsetY);
        let closestSampleIndex = data.reduce(
          (prev, c, index) => {
            let new_dist = (cx - c.coord_x) ** 2 + (cy - c.coord_y) ** 2;
            if (new_dist < prev.value) {
              return { value: new_dist, index: index };
            } else {
              return prev;
            }
          },
          { value: 9999, index: -1 }
        ).index;
        this.setSelectedSampleIndex(closestSampleIndex);
      });
    });

  minProbability = 0;
  maxProbability = 1;

  draw = () => {
    this.fillColor = fc
      .webglFillColor()
      .data(this.data)
      .value((d, i) => {
        return true
          ? [...hexToRgb(CATEGORY_COLORS[d.category]).map((c) => c / 255), 1]
          : [0.2, 0.2, 0.2, 1];
        // return d.like_probability > this.minProbability
        //   ? [
        //       ...hexToRgb(CATEGORY_COLORS[d.category]).map((c) => c / 255),
        //       d.like_probability,
        //     ]
        //   : [0.2, 0.2, 0.2, 1];
      });

    d3.select(this.containerEl).datum(this.data).call(this.chart);
  };

  constructor(containerEl, props) {
    this.containerEl = containerEl;
    this.setSelectedSampleIndex = props.setSelectedSampleIndex;
    this.data = props.data;

    // this.xScale.domain(
    //   fc.extentLinear().accessors([(d) => d.coord_x])(this.data)
    // );
    // this.yScale.domain(
    //   fc.extentLinear().accessors([(d) => d.coord_y])(this.data)
    // );

    this.draw();
  }

  updateThings = (props) => {
    this.data = props.data;
    this.minProbability = props.minProbability;
    this.maxProbability = props.maxProbability;

    this.selectedSampleIndex = props.selectedSampleIndex;

    this.draw();
  };
}
