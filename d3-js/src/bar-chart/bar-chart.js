import { barColors, barHoverColors } from './bar-colors.js';

// set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 70, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

const Y_TICKET_SIZE = 6;

// append the svg object to the body of the page
const container = d3.select('#chart-container');

const svg = container
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const URL = './data/dataaset.csv';
const data = await d3.csv(URL);

// X axis
const xScale = d3
  .scaleBand()
  .range([0, width])
  .domain(data.map((d) => d.Country))
  .padding(0.2);

svg
  .append('g')
  .attr('transform', 'translate(0,' + height + ')')
  .attr('class', 'x-axis')
  .call(d3.axisBottom(xScale))
  .selectAll('text')
  .attr('transform', 'translate(-10,0)rotate(-45)')
  .style('text-anchor', 'end');

// Add Y axis
const yScale = d3.scaleLinear().domain([0, 13000]).range([height, 0]);
const yAxis = d3.axisLeft(yScale).tickSize(Y_TICKET_SIZE);
svg.append('g').call(yAxis).attr('class', 'y-axis');

// =================================================================
// Bar mouse events
// =================================================================
const handleMouseEvent = (selection) => {
  const setColor = (target, colors) => {
    const i = target.dataset.index;
    d3.select(target).attr('fill', i < colors.length ? colors[i] : colors[0]);
  };
  selection.on('mouseover', (e) => setColor(e.target, barHoverColors));
  selection.on('mouseout', (e) => setColor(e.target, barColors));
};

const fillColors = (selection) =>
  selection.attr('fill', (d, i) =>
    i < barColors.length ? barColors[i] : barColors[0]
  );
// =================================================================
// Background lines
// =================================================================
/** @type {number []} */
const yTickValues = d3.axisLeft(yScale).scale().ticks();
const tickMarkers = yTickValues.length;

let numberLines = tickMarkers;

const dataTicks = svg.selectAll('g.tick');
const DIVISION_TICK_LINE_COLOR = '#949797';
const SINGLE_TICK_LINE_COLOR = '#e5e6e7';

const yBarGrGoup = svg.select('g.y-axis');
const yBarTick = yBarGrGoup.selectAll('g line');

const setYBarTickAttr = (i, value) => (i > 0 ? value : null);

yBarTick
  .attr('class', 'x-division-line')
  .attr('stroke', (d, i) => setYBarTickAttr(i, DIVISION_TICK_LINE_COLOR))
  .attr('stroke-width', 0.5)
  .attr('x1', -Y_TICKET_SIZE)
  .attr('x2', (d, i) => setYBarTickAttr(i, width));

// =================================================================
// Bars GROUP
// =================================================================
const barGroupArea = svg.append('g').attr('class', 'bar-group-area');
const barGroups = barGroupArea
  .selectAll()
  .data(data)
  .join('g')
  .attr('class', 'bar-groups');

// =================================================================
// Bars rect
// =================================================================

const bars = barGroups
  .append('rect')
  .attr('class', 'rect-bar')
  .attr('id', (d, i) => 'rect-bar-' + i)
  .attr('data-index', (d, i) => i)
  .attr('x', (d) => xScale(d.Country))
  .attr('y', (d) => yScale(d.Value))
  .attr('width', xScale.bandwidth())
  .attr('height', (d) => height - yScale(d.Value))
  .attr('opacity', 0.7)
  .call(fillColors)
  .call(handleMouseEvent);

// =================================================================
// Top rect lines
// =================================================================
const rectLine = barGroups
  .append('rect')
  .attr('class', 'bar-top-border')
  .attr('id', (d, i) => 'bar-top-border-' + i)
  .attr('data-index', (d, i) => i)
  .attr('x', (d) => xScale(d.Country))
  .attr('y', (d) => yScale(d.Value) - 1)
  .attr('width', xScale.bandwidth())
  .attr('height', '1px')
  .call(fillColors)
  .call(handleMouseEvent);
// =================================================================
// Top rect circles
// =================================================================
const rectCircle = barGroups
  .append('circle')
  .attr('id', (d, i) => 'bar-circle-' + i)
  .attr('data-index', (d, i) => i)
  .attr('cx', (d) => xScale(d.Country) + xScale.bandwidth() / 2)
  .attr('cy', (d) => yScale(d.Value))
  .attr('r', xScale.bandwidth() / 2.5 / 2)
  .call(fillColors)
  .call(handleMouseEvent);

// =================================================================
// Circle drag handler
// =================================================================
const handleDragEvent = d3
  .drag()
  .on('start', function (event, d) {
    svg.classed('dragging', true);

    const i = +d3.select(this).attr('data-index');
    console.log('==dragger: start');
  })
  .on('drag', function (event, d) {
    // console.log('==dragger: drag');

    // const { y, sourceEvent } = event;s
    // console.log('==dragger: drag', y, sourceEvent);

    const index = d3.select(this).attr('data-index');
    const circleId = d3.select(this).attr('id');

    const getCoordindates = (cssTransform = '') => {
      const REGEX = /(?<=translate\(0,)(.*?)(?=\))/g;
      const yCoordinate = cssTransform.match(REGEX)?.[0];

      return +yCoordinate;
    };

    // const minorLines = document.querySelectorAll('.x-division-line');
    const minorLines = document.querySelectorAll('.y-axis .tick');

    const y0 = getCoordindates(minorLines[0].getAttribute('transform'));
    const y1 = getCoordindates(minorLines[1].getAttribute('transform'));

    const range = parseInt((y0 - y1) / 2);

    const oldY =
      parseFloat(d3.select('#rect-bar-' + index).attr('y')) -
      parseFloat(event.y);
    const oldHeight = parseInt(d3.select('#rect-bar-' + index).attr('height'));
    const newHeight = oldHeight;
    const currentYY = parseInt(event.y);
    let currentLineY;
    const chartHeight = height;
    const numberOfLines = minorLines.length;
    // const selectedTooltip = document.querySelector('#tooltip' + circleIndex);
    // const tooltipHeight = selectedTooltip.getBoundingClientRect().height;
    // debugger
    for (let i = 0; i < minorLines.length; i++) {
      currentLineY = getCoordindates(minorLines[i].getAttribute('transform'));
      //=========================================================================

      // drag goes before the end of x axis
      if (
        parseInt(currentLineY) + parseInt(range) >= parseInt(currentYY) &&
        parseInt(currentLineY) - parseInt(range) <= parseInt(currentYY)
      ) {
        if (currentLineY >= 0 && currentLineY <= height) {
          console.log('==== IF 1');

          d3.select(this).attr('y', currentLineY);
          d3.select('#bar-circle-' + index).attr('cy', currentLineY);
          d3.select('#rect-bar-' + index)
            .attr('y', currentLineY)
            .attr('height', height - currentLineY);
          d3.select('#bar-top-border-' + index).attr('y', currentLineY);

          //=========================================================================
          // handle Tooltip
          //=========================================================================
          // const matrix = this.getScreenCTM().translate(
          //   +d3.select('#bar-circle-' + circleIndex).attr('cx'),
          //   currentLineY
          // );

          // d3.select('#tooltip' + circleIndex)
          //   .html(
          //     parseFloat(
          //       (i + 1) * ((maxYscale - minYscale) / numberOfLines) + minYscale
          //     ).toFixed(decimalPlaces) +
          //       ' ' +
          //       yUnit
          //   )
          //   .style(
          //     'left',
          //     window.pageXOffset + matrix.e - xScale.bandwidth() / 2 + 'px'
          //   )
          //   .style(
          //     'top',
          //     window.pageYOffset + matrix.f - 20 - tooltipHeight + 'px'
          //   )
          //   .style('opacity', 1);
        }
      }

      //=========================================================================
      // handle the case beyond the first
      //=========================================================================

      if (
        parseInt(chartHeight) + parseInt(range) >= parseInt(currentYY) &&
        parseInt(chartHeight) - parseInt(range) <= parseInt(currentYY)
      ) {
        console.log('==== IF 2.A');
        if (chartHeight >= 0 && chartHeight <= height) {
          console.log('==== IF 2.B');

          d3.select(this).attr('y', chartHeight);
          d3.select('#bar-circle-' + index).attr('cy', chartHeight);
          d3.select('#rect-bar-' + index)
            .attr('y', chartHeight)
            .attr('height', height - chartHeight);
          d3.select('#bar-top-border-' + index).attr('y', chartHeight - 1);

          //=========================================================================
          // handle Tooltip
          //=========================================================================

          // var matrix = this.getScreenCTM().translate(
          //   +d3.select('#circle' + circleIndex).attr('cx'),
          //   xAxis
          // );

          // d3.select('#tooltip' + circleIndex)
          //   .html(minYscale + ' ' + yUnit)
          //   .style(
          //     'left',
          //     window.pageXOffset + matrix.e - xScale.bandwidth() / 2 + 'px'
          //   )
          //   .style(
          //     'top',
          //     window.pageYOffset + matrix.f - 20 - tooltipHeight + 'px'
          //   )
          //   .style('opacity', 1);
        }
      }
      //=========================================================================
    }
  })
  .on('end', function (event, d) {
    svg.classed('dragging', false);
    console.log('==dragger: end');
  });

rectCircle.call(handleDragEvent);

// =================================================================
// Tooltips
// =================================================================
const TOOLTIP_CONTAINER_POS_Y_OFFSET = 44;
const TOOLTIP_CONTAINER_HEIGHT = 20;
const TOOLTIP_FONT_SIZE = 12;

barGroups
  .append('rect')
  .attr('class', 'bar-title-rect')
  .attr('fill', 'white')
  .attr('stroke-width', '0.5')
  .attr('stroke', '#cccecf')
  .attr('rx', '5px')
  .attr('x', (d) => xScale(d.Country))
  .attr('y', (d) => yScale(d.Value) - TOOLTIP_CONTAINER_POS_Y_OFFSET)
  .attr('width', xScale.bandwidth())
  .attr('height', TOOLTIP_CONTAINER_HEIGHT);

barGroups
  .append('text')
  .attr('class', 'bar-title')
  .attr('id', (d, i) => 'bar-title-' + i)
  .attr('data-index', (d, i) => i)
  .attr('text-anchor', 'middle')
  .attr('x', (d) => xScale(d.Country) + xScale.bandwidth() / 2)
  .attr(
    'y',
    (d) =>
      yScale(d.Value) -
      TOOLTIP_CONTAINER_POS_Y_OFFSET +
      TOOLTIP_CONTAINER_HEIGHT / 2 +
      TOOLTIP_FONT_SIZE / 3
  )
  .style('font-size', TOOLTIP_FONT_SIZE + 'px')
  .text((d) => d.Value);

// single tooltip
// TODO: in progress
// create a tooltip
// create a tooltip
var Tooltip = container
  .append('div')
  .style('position', 'absolute')
  .style('opacity', 0)
  .attr('class', 'tooltip')
  .style('background-color', 'white')
  .style('border', 'solid')
  .style('border-width', '2px')
  .style('border-radius', '5px')
  .style('padding', '5px');

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function (event, d) {
  debugger;
  const left = +d3.select(this).attr('cx');

  Tooltip.style('opacity', 1)
    .style('left', left + 'px')
    .style('top', event.offsetY + 'px');
  d3.select(this).style('stroke', 'black').style('opacity', 1);
};
var mousemove = function (event, d) {
  console.log(d);
  Tooltip.html('The exact value of<br>this cell is: ' + d.Value)
    .style('left', event.offsetX + 'px')
    .style('top', event.offsetY + 'px');
};
var mouseleave = function (event, d) {
  Tooltip.style('opacity', 0);
  d3.select(this).style('stroke', 'none').style('opacity', 0.8);
};

// add the squares
// rectCircle
//   .on('mouseover', mouseover)
// .on('mousemove', mousemove)
// .on('mouseleave', mouseleave);
