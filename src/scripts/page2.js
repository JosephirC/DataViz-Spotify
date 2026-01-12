console.log("Page 2 - D3 chargé");

const variables = [
  "danceability",
  "energy",
  "loudness",
  "speechiness",
  "acousticness",
  "liveness",
  "valence",
  "tempo"
];

const variableTexts = {
  danceability: "A measure of how suitable the song is for dancing based on various musical elements. (type: float)",
  energy: "A measure of the intensity and activity level of the song. (type: float)",
  loudness: "The overall loudness of the song in decibels. (type: float)",
  speechiness: "A measure of the presence of spoken words in the song. (type: float)",
  acousticness: "A measure of the acoustic quality of the song. (type: float) 0.0 → très électronique/1.0 → très acoustique",
  liveness: "A measure of the presence of a live audience in the recording. (type: float)",
  valence: "A measure of the musical positiveness conveyed by the song. (type: float)",
  tempo: "The tempo of the song in beats per minute. (type: float)"
};

const margin = { top: 40, right: 20, bottom: 50, left: 60 };

function getDimensions() {
  const container = document.getElementById("chart");
  const rect = container.getBoundingClientRect();

  return {
    width: rect.width - margin.left - margin.right,
    height: rect.height - margin.top - margin.bottom
  };
}

const { width, height } = getDimensions();

const svg = d3.select("#chart")
  .append("svg")
  .attr(
    "viewBox",
    `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
  )
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100%")
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleTime().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

const color = d3.scaleOrdinal()
  .domain(variables)
  .range(d3.schemeTableau10);

const xAxis = svg.append("g")
  .attr("transform", `translate(0,${height})`);

const yAxis = svg.append("g");

const linesGroup = svg.append("g");
const circlesGroup = svg.append("g");

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "white")
  .style("padding", "5px 10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("opacity", 0);

d3.csv("../data/top_50_71Countries_from_2023_to_2025.csv", d => {
  const date = new Date(d.album_release_date);

  if (isNaN(date))return null;

  return {
    spotify_id: d.spotify_id,
    date: d3.timeYear.floor(date),
    ...Object.fromEntries(variables.map(v => [v, +d[v]]))
  };
}).then(data => {

  const uniqueSongs = Array.from(
    d3.group(data, d => d.spotify_id + "_" + d.date).values(),
    v => v[0]
  );

  const grouped = d3.rollup(
    uniqueSongs,
    v => {
      const res = {};
      variables.forEach(k => res[k] = d3.mean(v, d => d[k]));
      return res;
    },
    d => d.date
  );

  const dataset = Array.from(grouped, ([date, values]) => ({
    date,
    ...values
  })).sort((a, b) => a.date - b.date);

  xScale.domain(d3.extent(dataset, d => d.date));
  xAxis.call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

  const checkboxContainer = d3.select("#checkboxes");

  variables.forEach((variable) => {
    const label = checkboxContainer.append("label");

    label.append("input")
      .attr("type", "checkbox")
      .attr("value", variable)
      .property("checked", variable === "tempo")
      .on("change", updateChart);

    label.append("span")
      .text(" " + variable)
      .on("mouseover", (event) => {
        tooltip
          .style("opacity", 1)
          .html(variableTexts[variable])
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    checkboxContainer.append("br");
  });

  const selectAllCheckbox = d3.select("#selectAllCheckbox");
    selectAllCheckbox.on("change", (event) => {
        const checked = event.target.checked;
        d3.selectAll("#checkboxes input").property("checked", checked);
        updateChart();
  });

function updateChart() {
  const activeVars = checkboxContainer.selectAll("input")
    .nodes()
    .filter(n => n.checked)
    .map(n => n.value);

  if (activeVars.length === 0) {
    linesGroup.selectAll(".line").remove();
    circlesGroup.selectAll("circle").remove();
    yAxis.transition().duration(500).call(d3.axisLeft(yScale).tickValues([]));
    return;
  }

  yScale.domain([
    d3.min(dataset, d => d3.min(activeVars, v => d[v])),
    d3.max(dataset, d => d3.max(activeVars, v => d[v]))
  ]).nice();

  yAxis.transition().duration(500).call(d3.axisLeft(yScale));

  const lines = linesGroup.selectAll(".line")
    .data(activeVars, d => d);

  lines.exit().remove();

  lines.enter()
    .append("path")
    .attr("class", "line")
    .merge(lines)
    .transition()
    .duration(500)
    .attr("stroke", d => color(d))
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("d", variable =>
      d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d[variable]))(dataset)
    );

  circlesGroup.selectAll("circle").remove();

  activeVars.forEach(variable => {
    const circles = circlesGroup.selectAll(".circle-" + variable)
      .data(dataset);

    circles.enter()
      .append("circle")
      .attr("class", "circle-" + variable)
      .attr("r", 4)
      .attr("fill", color(variable))
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${variable}</strong><br>${d3.timeFormat("%Y")(d.date)}: ${d[variable].toFixed(2)}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 25) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      })
      .merge(circles)
      .transition()
      .duration(500)
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d[variable]));
  });
}

  updateChart();
});

window.addEventListener("resize", () => {
  d3.select("#chart svg").remove();
  location.reload();
});
