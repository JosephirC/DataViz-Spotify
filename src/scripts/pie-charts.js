const width = 300;
const height = 300;
const radius = Math.min(width, height) / 2;

const charts = [
  {
    svgId: "#chart1",
    sliderId: "#yearSlider1",
    yearId: "#yearValue1",
  },
  {
    svgId: "#chart2",
    sliderId: "#yearSlider2",
    yearId: "#yearValue2",
  }
];

const color = d3.scaleOrdinal(d3.schemeSet2);

const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius);

const pie = d3.pie()
  .value(d => d.value);

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

d3.csv("../../data/songs_normalize.csv").then(data => {

  const filteredData = data
    .filter(d => d.genre !== "set()")
    .map(d => ({
      ...d,
      year: +d.year,
      genre: d.genre.split(",").map(g => g.trim())
    }))
    .filter(d => d.year >= 1999 && d.year <= 2019);

  charts.forEach(chart => {
    chart.svg = d3.select(chart.svgId)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    chart.slider = d3.select(chart.sliderId)
      .attr("min", 1999)
      .attr("max", 2019)
      .attr("value", 2019)
      .on("input", function () {
        updateChart(chart, +this.value);
      });

    d3.select(chart.yearId).text(2019);
    updateChart(chart, 2019);
  });

  function updateChart(chart, selectedYear) {

    d3.select(chart.yearId).text(selectedYear);

    const yearData = filteredData.filter(d => d.year === selectedYear);

    const genreCount = new Map();

    yearData.forEach(d => {
      d.genre.forEach(g => {
        genreCount.set(g, (genreCount.get(g) || 0) + 1);
      });
    });

    const total = Array.from(genreCount.values()).reduce((a, b) => a + b, 0);

    if (total === 0) {
      chart.svg.selectAll("path").remove();
      updateLegend([]);
      return;
    }

    const pieData = Array.from(genreCount, ([key, value]) => ({ key, value }));

    const arcs = chart.svg.selectAll("path")
      .data(pie(pieData), d => d.data.key);

    arcs.enter()
      .append("path")
      .merge(arcs)
      .attr("fill", d => color(d.data.key))
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 0.9)
          .html(
            `<strong>${d.data.key}</strong><br>${(d.data.value / total * 100).toFixed(1)} %`
          );
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      })
      .transition()
      .duration(500)
      .attr("d", arc);

    arcs.exit().remove();

    updateLegend(pieData);
  }

  function updateLegend(pieData) {
    const legend = d3.select("#commonLegend");

    const items = legend.selectAll(".legend-item")
      .data(pieData, d => d.key);

    const enterItems = items.enter()
      .append("div")
      .attr("class", "legend-item");

    enterItems.append("div")
      .attr("class", "legend-color")
      .style("background-color", d => color(d.key));

    enterItems.append("span")
      .text(d => d.key);

    items.select(".legend-color")
      .style("background-color", d => color(d.key));

    items.select("span")
      .text(d => d.key);

    items.exit().remove();
  }
});
