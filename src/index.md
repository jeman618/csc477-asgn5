# US Election Years (1976-2024)
<div class="grid grid-cols-3">
  <div class="card"><h1>Question 1: Which elections showed the most political divide?</h1></div>
  <div class="card"><h1>Question 2: Who were the top candidates in each state?</h1></div>
  <div class="card"><h1>Question 3: Which states were swing states and which consistently supported one party?</h1></div>
</div>

```js
import * as d3 from "npm:d3";
import * as topojson from "npm:topojson-client";
import {Scrubber} from "./components/scrubber.js";
```

```js
const president_data = await FileAttachment("data/1976-2024-president.csv").csv();
const us_map = await FileAttachment("data/counties-albers-10m.json").json();
const years = d3.extent(president_data, d => +d.year);
const parties = [
  { index: 0, label: "Democratic" },
  { index: 1, label: "Republican" },
  { index: 2, label: "Other" }
];
const color = d3.scaleOrdinal()
  .domain([0, 1, 2])
  .range(["blue", "red", "green"]);
```

```js
const yearInput = 
  Scrubber(d3.range(years[0], years[1] + 1, 4), {
    autoplay: false,
    delay: 1000,
    loop: false
  });
```

```js
const otherCandidatesInput = 
  Inputs.toggle({
    label: "More Candidates",
    value: false
  });
```

```js
const controls = document.createElement("div");

controls.style.display = "flex";
controls.style.transform = "scale(1.5, 1.5)";
controls.style.alignItems = "center";
controls.style.flexDirection = "row";
controls.style.justifyContent = "space-evenly";

controls.appendChild(yearInput);
controls.appendChild(otherCandidatesInput);

display(controls);

const yearFilter = Generators.input(yearInput);
const showOtherCandidates = Generators.input(otherCandidatesInput);
```

```js
const container = document.createElement("div");

container.style.display = "flex";
container.style.flexDirection = "row";
container.style.alignItems = "flex-start";
container.style.alignItems = "center";
container.style.gap = "24px";
container.style.width = "100%";
container.style.marginTop = "20px";
container.style.paddingRight = "0px";
mapSvg.style.flex = "2";
chartSvg.style.flex = "1";


container.appendChild(mapSvg);
container.appendChild(chartSvg);

display(container);
```

```js
const mapSvg = (() => 
{
  const width = 975;
  const height = 610;

  const svg = d3.create('svg')
    .attr('width', width)
    .attr('height', height);

  const data = topojson.feature(us_map, us_map.objects.states).features;

  const state = svg.append('g')
    .selectAll('path')
      .data(data)
      .join("path")
        .attr("d", d3.geoPath())
        .attr('stroke', 'black');

  state.append('title');

  state
    .on('mouseover', function() {
      d3.select(this)
        .attr("stroke", "#333333")
        .attr("stroke-width", 2)
        .attr("opacity", 0.5);
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("opacity", 1);
    });

  const defs = svg.append("defs");

  function addStripePattern(id, background) {
    const pattern = defs.append("pattern")
      .attr("id", id)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 8)
      .attr("height", 8);
  
    pattern.append("rect")
      .attr("width", 8)
      .attr("height", 8)
      .attr("fill", background);
  
    pattern.append("path")
      .attr("d", "M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5);
  }
  
  addStripePattern("blue-stripes", "blue");
  addStripePattern("red-stripes", "red");
  addStripePattern("green-stripes", "green");

  function update(yearFilter) {
    const electionData = president_data.filter(d => d.year === yearFilter.toString() && d.candidate !== "" && d.candidatevotes > 0);
  
    const winners = d3.rollup(
      electionData,
      v => d3.greatest(v, d => +d.candidatevotes),
      d => d.state
    );
  
    const electionByState = d3.group(electionData, d => d.state);
      
    const winnerByState = new Map(winners);
  
    state.attr('fill', d => {
      const stateName = d.properties.name.toUpperCase();
      const winner = winnerByState.get(stateName);
      const candidates = electionByState.get(stateName);

       const topTwo = [...candidates.sort((a, b) => d3.descending(+a.candidatevotes, +b.candidatevotes))];

      const first = 100 * Number(topTwo[0].candidatevotes) / Number(topTwo[0].totalvotes);
      const second = 100 * Number(topTwo[1].candidatevotes) / Number(topTwo[1].totalvotes);

      let swing_state = false;

      if (first - second <= 3) {
        swing_state = true;
      }
  
      if (!winner) {
        return "#cccccc"
      }
  
      const baseColor =  winner.party_simplified === "DEMOCRAT" ? "blue" :
        winner.party_simplified === "REPUBLICAN" ? "red" :
        "green";

      return swing_state ? `url(#${baseColor}-stripes)` : baseColor;
    });
  
    state.select('title')
      .text(d => {
        const stateName = d.properties.name.toUpperCase();
        const candidates = electionByState.get(stateName);

        if (!candidates) {
          return d.properties.name;
        }

        return [
          stateName,
          ...candidates
            .sort((a, b) => d3.descending(+a.candidatevotes, +b.candidatevotes))
            .map(d => 
                 `${d.party_detailed}: ${d.candidate} - ${Number(d.candidatevotes).toLocaleString('en-US')} (${(100 * Number(d.candidatevotes) / Number(d.totalvotes)).toFixed(2)}%) votes`)
        ].join("\n");
      });      
    }
  update(yearFilter);

  return Object.assign(svg.node(), { update, addStripePattern })
})();
```

```js
const chartSvg = (() => 
{
  const width = 590;
  const height = 500;
  const margin = {top: 30, right: 100, bottom: 40, left: 120};

  const electionData = president_data
    .filter(d => d.year === yearFilter.toString() && d.candidatevotes > 2500 && d.candidate !== "" && d.candidate.length < 20);

  const electionByCandidate = d3.group(electionData, d => d.candidate);

  const votesByCandidate = Array.from(
    d3.rollup(
      electionData,
      v => ({
        votes: d3.sum(v, d => +d.candidatevotes),
        party_simplified: v[0].party_simplified
      }),
      d => d.candidate
    ),
    ([candidate, info]) => ({
      candidate,
      votes: info.votes,
      party_simplified: info.party_simplified
    })
  ).sort((a, b) => d3.descending(a.votes, b.votes));

  const filteredCandidates = showOtherCandidates
  ? votesByCandidate
  : votesByCandidate.filter(d =>
      d.party_simplified === "DEMOCRAT" ||
      d.party_simplified === "REPUBLICAN"
    );

  const totalVotes = d3.rollup(votesByCandidate, v => d3.sum(v, d => d.votes));

  const x = d3.scaleLinear()
    .domain([0, d3.max(filteredCandidates, d => d.votes) * 1.2])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(filteredCandidates.map(d => d.candidate))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5, "~s"))
    .append("text")
      .attr("text-anchor", "end")
      .attr("font-size", "40px")
      .attr("font-weight", "bold")
      .attr("x", width - margin.right)
      .attr("y", -10)
      .text("Total Votes (Millions)");

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", `translate(-10, ${margin.top - 10})`)
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Candidates");

  svg.selectAll("rect")
    .data(filteredCandidates)
    .join("rect")
      .attr("x", margin.left)
      .attr("y", d => y(d.candidate))
      .attr("width", d => x(d.votes) - margin.left)
      .attr("height", y.bandwidth())
      .attr("fill", d => {
        const candidate = electionByCandidate.get(d.candidate)[0];
        
        return candidate.party_simplified === "DEMOCRAT" ? "blue" :
            candidate.party_simplified === "REPUBLICAN" ? "red" :
            "green";
      });

  svg.selectAll("text.label")
    .data(filteredCandidates)
    .join("text")
      .attr("font-size", "12px")
      .attr("class", "label")
      .attr("x", d => x(d.votes) + 5)
      .attr("y", d => y(d.candidate) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .text(d => `${d.votes.toLocaleString()} (${(100 * Number(d.votes) / totalVotes).toFixed(2)}%)`);

  return svg.node()
})();
```

```js
function colorLegend(container) {
  const titlePadding = 14;
  const entrySpacing = 16;
  const entryRadius = 5;
  const labelOffset = 4;
  const baselineOffset = 4;

  container.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", "black")
    .attr("font-weight", "bold")
    .attr("font-size", "12px")
    .text("Political Party");

  const entries = container.selectAll("g")
    .data(parties)
    .join("g")
    .attr("transform", d => `translate(0, ${titlePadding + d.index * entrySpacing})`);

  entries.append("circle")
    .attr("cx", entryRadius)
    .attr("r", entryRadius)
    .attr("fill", d => color(d.index));

  entries.append("text")
    .attr("x", 2 * entryRadius + labelOffset)
    .attr("y", baselineOffset)
    .attr("fill", "black")
    .attr("font-size", "11px")
    .text(d => d.label);
}
```