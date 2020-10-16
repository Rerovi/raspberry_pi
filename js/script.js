var lineGraph = document.getElementById("c");
var pieChart = document.getElementById("donut");
var barChart = document.getElementById("bar-chart");

var visibilityLineGraph = false;

lineGraph.style.visibility = "hidden";
pieChart.style.visibility = "hidden";
barChart.style.visibility = "hidden";


function sizingGraph() {
        if (visibilityLineGraph === true) {
                lineGraph.style.visibility = "hidden";
                visibilityLineGraph = false
        } else if (visibilityLineGraph === false) {
                lineGraph.style.visibility = "visible";
                visibilityLineGraph = true;
        }
}