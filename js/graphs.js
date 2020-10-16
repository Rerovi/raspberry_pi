var label = document.querySelector(".label");
var c = document.getElementById("c");
var ctx = c.getContext("2d");
var cw = c.width = 700;
var ch = c.height = 350;
var cx = cw / 2,
    cy = ch / 2;
var rad = Math.PI / 180;
var frames = 0;

ctx.lineWidth = 1;
ctx.strokeStyle = "#999";
ctx.fillStyle = "#ccc";
ctx.font = "14px monospace";

var grd = ctx.createLinearGradient(0, 0, 0, cy);
grd.addColorStop(0, "hsla(167,72%,60%,1)");
grd.addColorStop(1, "hsla(167,72%,60%,0)");

var oData = {
    "Monday": 10,
    "Tuesday": 39.9,
    "Wednesday": 17,
    "Thursday": 30.0,
    "Friday": 5.3,
    "Saturday": 38.4,
    "Sunday": 15.7,
};

var valuesRy = [];
var propsRy = [];
for (var prop in oData) {

    valuesRy.push(oData[prop]);
    propsRy.push(prop);
}


var vData = 4;
var hData = valuesRy.length;
var offset = 50.5; //offset chart axis
var chartHeight = ch - 2 * offset;
var chartWidth = cw - 2 * offset;
var t = 1 / 7; // curvature : 0 = no curvature
var speed = 2; // for the animation

var A = {
    x: offset,
    y: offset
}
var B = {
    x: offset,
    y: offset + chartHeight
}
var C = {
    x: offset + chartWidth,
    y: offset + chartHeight
}

/*
      A  ^
	    |  |
	    + 25
	    |
	    |
	    |
	    + 25
      |__|_________________________________  C
      B
*/

// CHART AXIS -------------------------
ctx.beginPath();
ctx.moveTo(A.x, A.y);
ctx.lineTo(B.x, B.y);
ctx.lineTo(C.x, C.y);
ctx.stroke();

// vertical ( A - B )
var aStep = (chartHeight - 50) / (vData);

var Max = Math.ceil(arrayMax(valuesRy) / 10) * 10;
var Min = Math.floor(arrayMin(valuesRy) / 10) * 10;
var aStepValue = (Max - Min) / (vData);
console.log("aStepValue: " + aStepValue); //8 units
var verticalUnit = aStep / aStepValue;

var a = [];
ctx.textAlign = "right";
ctx.textBaseline = "middle";
for (var i = 0; i <= vData; i++) {

    if (i == 0) {
        a[i] = {
            x: A.x,
            y: A.y + 25,
            val: Max
        }
    } else {
        a[i] = {}
        a[i].x = a[i - 1].x;
        a[i].y = a[i - 1].y + aStep;
        a[i].val = a[i - 1].val - aStepValue;
    }
    drawCoords(a[i], 3, 0);
}

//horizontal ( B - C )
var b = [];
ctx.textAlign = "center";
ctx.textBaseline = "hanging";
var bStep = chartWidth / (hData + 1);

for (var i = 0; i < hData; i++) {
    if (i == 0) {
        b[i] = {
            x: B.x + bStep,
            y: B.y,
            val: propsRy[0]
        };
    } else {
        b[i] = {}
        b[i].x = b[i - 1].x + bStep;
        b[i].y = b[i - 1].y;
        b[i].val = propsRy[i]
    }
    drawCoords(b[i], 0, 3)
}

function drawCoords(o, offX, offY) {
    ctx.beginPath();
    ctx.moveTo(o.x - offX, o.y - offY);
    ctx.lineTo(o.x + offX, o.y + offY);
    ctx.stroke();

    ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
}
//----------------------------------------------------------

// DATA
var oDots = [];
var oFlat = [];
var i = 0;

for (var prop in oData) {
    oDots[i] = {}
    oFlat[i] = {}

    oDots[i].x = b[i].x;
    oFlat[i].x = b[i].x;

    oDots[i].y = b[i].y - oData[prop] * verticalUnit - 25;
    oFlat[i].y = b[i].y - 25;

    oDots[i].val = oData[b[i].val];

    i++
}



///// Animation Chart ///////////////////////////
//var speed = 3;
function animateChart() {
    requestId = window.requestAnimationFrame(animateChart);
    frames += speed; //console.log(frames)
    ctx.clearRect(60, 0, cw, ch - 60);

    for (var i = 0; i < oFlat.length; i++) {
        if (oFlat[i].y > oDots[i].y) {
            oFlat[i].y -= speed;
        }
    }
    drawCurve(oFlat);
    for (var i = 0; i < oFlat.length; i++) {
        ctx.fillText(oDots[i].val, oFlat[i].x, oFlat[i].y - 25);
        ctx.beginPath();
        ctx.arc(oFlat[i].x, oFlat[i].y, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    if (frames >= Max * verticalUnit) {
        window.cancelAnimationFrame(requestId);

    }
}
requestId = window.requestAnimationFrame(animateChart);

/////// EVENTS //////////////////////
c.addEventListener("mousemove", function(e) {
    label.innerHTML = "";
    label.style.display = "none";
    this.style.cursor = "default";

    var m = oMousePos(this, e);
    for (var i = 0; i < oDots.length; i++) {

        output(m, i);
    }

}, false);

function output(m, i) {
    ctx.beginPath();
    ctx.arc(oDots[i].x, oDots[i].y, 20, 0, 2 * Math.PI);
    if (ctx.isPointInPath(m.x, m.y)) {
        //console.log(i);
        label.style.display = "block";
        label.style.top = (m.y + 10) + "px";
        label.style.left = (m.x + 10) + "px";
        label.innerHTML = "<strong>" + propsRy[i] + "</strong>: " + valuesRy[i] + "%";
        c.style.cursor = "pointer";
    }
}

// CURVATURE
function controlPoints(p) {
    // given the points array p calculate the control points
    var pc = [];
    for (var i = 1; i < p.length - 1; i++) {
        var dx = p[i - 1].x - p[i + 1].x; // difference x
        var dy = p[i - 1].y - p[i + 1].y; // difference y
        // the first control point
        var x1 = p[i].x - dx * t;
        var y1 = p[i].y - dy * t;
        var o1 = {
            x: x1,
            y: y1
        };

        // the second control point
        var x2 = p[i].x + dx * t;
        var y2 = p[i].y + dy * t;
        var o2 = {
            x: x2,
            y: y2
        };

        // building the control points array
        pc[i] = [];
        pc[i].push(o1);
        pc[i].push(o2);
    }
    return pc;
}

function drawCurve(p) {

    var pc = controlPoints(p); // the control points array

    ctx.beginPath();
    //ctx.moveTo(p[0].x, B.y- 25);
    ctx.lineTo(p[0].x, p[0].y);
    // the first & the last curve are quadratic Bezier
    // because I'm using push(), pc[i][1] comes before pc[i][0]
    ctx.quadraticCurveTo(pc[1][1].x, pc[1][1].y, p[1].x, p[1].y);

    if (p.length > 2) {
        // central curves are cubic Bezier
        for (var i = 1; i < p.length - 2; i++) {
            ctx.bezierCurveTo(pc[i][0].x, pc[i][0].y, pc[i + 1][1].x, pc[i + 1][1].y, p[i + 1].x, p[i + 1].y);
        }
        // the first & the last curve are quadratic Bezier
        var n = p.length - 1;
        ctx.quadraticCurveTo(pc[n - 1][0].x, pc[n - 1][0].y, p[n].x, p[n].y);
    }

    //ctx.lineTo(p[p.length-1].x, B.y- 25);
    ctx.stroke();
    ctx.save();
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();
}

function arrayMax(array) {
    return Math.max.apply(Math, array);
};

function arrayMin(array) {
    return Math.min.apply(Math, array);
};

function oMousePos(canvas, evt) {
    var ClientRect = canvas.getBoundingClientRect();
    return { //objeto
        x: Math.round(evt.clientX - ClientRect.left),
        y: Math.round(evt.clientY - ClientRect.top)
    }
}
// ---------------------------------------------------------------------------------------------------------------------
// Pie chart:
var duration   = 500,
    transition = 200;

drawDonutChart(
    '#donut',
    $('#donut').data('donut'),
    290,
    290,
    ".35em"
);

function drawDonutChart(element, percent, width, height, text_y) {
    width = typeof width !== 'undefined' ? width : 290;
    height = typeof height !== 'undefined' ? height : 290;
    text_y = typeof text_y !== 'undefined' ? text_y : "-.10em";

    var dataset = {
            lower: calcPercent(0),
            upper: calcPercent(percent)
        },
        radius = Math.min(width, height) / 2,
        pie = d3.layout.pie().sort(null),
        format = d3.format(".0%");

    var arc = d3.svg.arc()
        .innerRadius(radius - 20)
        .outerRadius(radius);

    var svg = d3.select(element).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var path = svg.selectAll("path")
        .data(pie(dataset.lower))
        .enter().append("path")
        .attr("class", function(d, i) { return "color" + i })
        .attr("d", arc)
        .each(function(d) { this._current = d; }); // store the initial values

    var text = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", text_y);

    if (typeof(percent) === "string") {
        text.text(percent);
    }
    else {
        var progress = 0;
        var timeout = setTimeout(function () {
            clearTimeout(timeout);
            path = path.data(pie(dataset.upper)); // update the data
            path.transition().duration(duration).attrTween("d", function (a) {
                // Store the displayed angles in _current.
                // Then, interpolate from _current to the new angles.
                // During the transition, _current is updated in-place by d3.interpolate.
                var i  = d3.interpolate(this._current, a);
                var i2 = d3.interpolate(progress, percent)
                this._current = i(0);
                return function(t) {
                    text.text( format(i2(t) / 100) );
                    return arc(i(t));
                };
            }); // redraw the arcs
        }, 200);
    }
};

function calcPercent(percent) {
    return [percent, 100-percent];
};
// ---------------------------------------------------------------------------------------------------------------------
//Bar chart:
var data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
        [5, 4, 3, 7, 5, 10],
        [3, 2, 9, 5, 4, 6]
    ]
};

var options = {
    seriesBarDistance: 30
};
var responsiveOptions = [
    ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: {
            labelInterpolationFnc: function (value) {
                return value[0];
            }
        }
    }]
];

new Chartist.Bar('#bar-chart', data, options, responsiveOptions);
//----------------------------------------------------------------------------------------------------------------------
// Andere code: