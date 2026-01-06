console.log("Page 1 - D3 chargé");

const data = [
  { label: "A", value: 30 },
  { label: "B", value: 50 },
  { label: "C", value: 20 }
];

const width = 300;
const height = 300;
const radius = Math.min(width, height) / 2;

const color = d3.scaleOrdinal()
  .domain(data.map(d => d.label))
  .range(["#4CAF50", "#2196F3", "#FFC107"]);

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

const pie = d3.pie()
  .value(d => d.value);

const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius);

svg.selectAll("path")
  .data(pie(data))
  .enter()
  .append("path")
  .attr("d", arc)
  .attr("fill", d => color(d.data.label))
  .attr("stroke", "#fff")
  .style("stroke-width", "2px");

svg.selectAll("text")
  .data(pie(data))
  .enter()
  .append("text")
  .text(d => d.data.label)
  .attr("transform", d => `translate(${arc.centroid(d)})`)
  .style("text-anchor", "middle")
  .style("font-size", "14px")
  .style("fill", "#000");
