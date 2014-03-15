
/** drawing the graph **/

var bounds = {
    top: 50,
    left: 50,
    bottom: 200,
    right: 200,
    xscale: 10,
    yscale: 10,
    xlim: [-10, 15],
    ylim: [-10, 15],
};

bounds.xscale = (bounds.right - bounds.left) / (bounds.xlim[1] - bounds.xlim[0]);
bounds.yscale = (bounds.bottom - bounds.top) / (bounds.ylim[1] - bounds.ylim[0]);

var point_size = 10;

var cx = function (x, bounds) {
    return x * bounds.xscale + bounds.left - bounds.xlim[0] * bounds.xscale;
};

var cy = function (y, bounds) {
    return bounds.bottom - y * bounds.yscale + bounds.ylim[0] * bounds.yscale;
};

var COLORS = {
    red: [255, 0, 0],
    green: [0, 255, 0],
    white: [255, 255, 255],
    lightred: [255, 200, 200],
    lightgreen: [200, 255, 200]
};

var setFill = function (color) {
    if ('string' === typeof color) {
        color = COLORS[color] || [0, 0, 0];
    }
    fill.apply(null, color);
};

var setStroke = function (color) {
    if ('string' === typeof color) {
        color = COLORS[color] || [0, 0, 0];
    }
    stroke.apply(null, color);
};

var pointColor = function (color, correct) {
    if (correct) {
        return color;
    }
    return {
        'red': 'green',
        'green': 'red'
    }[color];
};


var calcNet = function (line, weights) {
    var net = 0;
    line.forEach(function (val, i) {
        net += val * weights[i];
    });
    return net;
};


var graph = function (points, bounds, point_size) {
    stroke(0, 0, 0);
    strokeWeight(1);
    // y axis
    line(bounds.left, bounds.top, bounds.left, bounds.bottom);
    // x axis
    line(bounds.left, bounds.bottom, bounds.right, bounds.bottom);

    strokeWeight(3);
    points.forEach(function (point) {
        setStroke(point.stroke);
        setFill(point.fill);
        ellipse(cx(point.x, bounds), cy(point.y, bounds), point_size, point_size);
    });
};

var fillBounds = function (bounds) {
    rect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
};

var yIntercept = function (wx, wy, bias, x) {
    // wx * x + wy * y + bias = 0
    // wy * y = 0 - bias - wx * x
    // y = (- bias - wx * x) / wy
    return (-bias - wx * x) / wy;
};

var xIntercept = function (wx, wy, bias, y) {
    // wx * x + wy * y + bias = 0
    // wx * x = 0 - bias - wy * y
    // x = (- bias - wy * y) / wx
    return (-bias - wy * y) / wx;
};

var verticalWeight = function (wx, bias, bounds) {
    var x = -bias / wx;
    if (x <= bounds.xlim[0]) {
        setFill(wx > 0 ? 'lightred' : 'lightgreen');
        fillBounds(bounds);
        return;
    }
    if (x >= bounds.xlim[1]) {
        setFill(wx > 0 ? 'lightgreen' : 'lightred');
        fillBounds(bounds);
        return;
    }
    setFill(wx < 0 ? 'lightred' : 'lightgreen');
    fillBounds({
        top: bounds.top,
        left: bounds.left,
        bottom: bounds.bottom,
        right: cx(x, bounds)
    });
    setFill(wx < 0 ? 'lightgreen' : 'lightred');
    fillBounds({
        left: cx(x, bounds),
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom
    });
};

var horizontalWeight = function (wy, bias, bounds) {
    var y = -bias / wy;
    if (y <= bounds.ylim[0]) {
        setFill('lightred');
        fillBounds(bounds);
        return;
    }
    if (y >= bounds.ylim[1]) {
        setFill('lightgreen');
        fillBounds(bounds);
        return;
    }
    setFill(wy < 0 ? 'lightred' : 'lightgreen');
    fillBounds({
        top: bounds.top,
        left: bounds.left,
        right: bounds.right,
        bottom: cy(y, bounds)
    });
    setFill(wy < 0 ? 'lightgreen' : 'lightred');
    fillBounds({
        top: cy(y, bounds),
        left: bounds.left,
        right: bounds.right,
        bottom: bounds.bottom
    });
};

var topBottomLine = function (wx, wy, bias, bounds, fromTop) {
    var atLeft = yIntercept(wx, wy, bias, bounds.ylim[0]);
    var atRight = yIntercept(wx, wy, bias, bounds.ylim[1]);
    return [bounds.xlim[0], atLeft, bounds.xlim[1], atRight];
};

var leftRightLine = function (wx, wy, bias, bounds, fromLeft) {
    var atTop = xIntercept(wx, wy, bias, bounds.xlim[1]);
    var atBottom = xIntercept(wx, wy, bias, bounds.xlim[0]);
    return [atTop, bounds.ylim[1], atBottom, bounds.ylim[0]];
};

var topBottomWeights = function (wx, wy, bias, bounds, fromTop) {
    var left = yIntercept(wx, wy, bias, bounds.ylim[0]);
    var right = yIntercept(wx, wy, bias, bounds.ylim[1]);
    setFill(fromTop ? 'lightred' : 'lightgreen');
    quad(cx(bounds.xlim[0], bounds), cy(bounds.ylim[1], bounds),
         cx(bounds.xlim[0], bounds), cy(left,           bounds),
         cx(bounds.xlim[1], bounds), cy(right,          bounds),
         cx(bounds.xlim[1], bounds), cy(bounds.ylim[1], bounds));
    setFill(fromTop ? 'lightgreen' : 'lightred');
    quad(cx(bounds.xlim[0], bounds), cy(bounds.ylim[0], bounds),
         cx(bounds.xlim[0], bounds), cy(left,           bounds),
         cx(bounds.xlim[1], bounds), cy(right,          bounds),
         cx(bounds.xlim[1], bounds), cy(bounds.ylim[0], bounds));
};

var leftRightWeights = function (wx, wy, bias, bounds, fromLeft) {
    var top = xIntercept(wx, wy, bias, bounds.xlim[1]);
    var bottom = xIntercept(wx, wy, bias, bounds.xlim[0]);
    setFill(fromLeft ? 'lightred' : 'lightgreen');
    quad(cx(bounds.xlim[0], bounds), cy(bounds.ylim[1], bounds),
         cx(bounds.xlim[0], bounds), cy(bounds.ylim[0], bounds),
         cx(bottom, bounds),         cy(bounds.ylim[0], bounds),
         cx(top, bounds),            cy(bounds.ylim[1], bounds)
    );
    setFill(fromLeft ? 'lightgreen' : 'lightred');
    quad(cx(bounds.xlim[1], bounds),     cy(bounds.ylim[1], bounds),
         cx(bounds.xlim[1], bounds),     cy(bounds.ylim[0], bounds),
         cx(bottom, bounds),             cy(bounds.ylim[0], bounds),
         cx(top, bounds),                cy(bounds.ylim[1], bounds)
    );
};

var cornerLine = function (wx, wy, bias, bounds, x, y, fromCorner) {
    var xi = xIntercept(wx, wy, bias, y);
    var yi = yIntercept(wx, wy, bias, x);
    return [x, yi, xi, y];
};

var drawCorner = function (wx, wy, bias, bounds, x, y, fromCorner) {
    var xi = xIntercept(wx, wy, bias, y);
    var yi = yIntercept(wx, wy, bias, x);
    noStroke();
    setFill(fromCorner ? 'lightred' : 'lightgreen');
    triangle(
            cx(x, bounds), cy(y, bounds),
            cx(x, bounds), cy(yi, bounds),
            cx(xi, bounds), cy(y, bounds)
        );

    setFill(fromCorner ? 'lightgreen' : 'lightred');
    quad(
            cx(x, bounds),      cy(bounds.ylim[1] - y, bounds),
            cx(x, bounds),      cy(yi, bounds),
            cx(xi, bounds),     cy(y, bounds),
            cx(bounds.xlim[1] - x, bounds), cy(y, bounds)
        );
    triangle(
            cx(bounds.xlim[1] - x, bounds), cy(y, bounds),
            cx(bounds.xlim[1] - x, bounds), cy(bounds.ylim[1] - y, bounds),
            cx(x, bounds),      cy(bounds.ylim[1] - y, bounds)
        );
        
};

var whichCorner = function (tl, tr, bl, br) {
    if (tl === tr && tl === bl) {
        return {
            x: bounds.xlim[0],
            y: bounds.ylim,
            fromCorner: br
        };
    }
    if (tl === tr && tl === br) {
        return {
            x: bounds.xlim[0],
            y: bounds.ylim[0],
            fromCorner: bl
        };
    }
    if (tl === br && br === bl) {
        return {
            x: bounds.xlim[1],
            y: bounds.ylim[1],
            fromCorner: tr
        };
    }
    return {
        x: bounds.xlim[0],
        y: bounds.ylim[1],
        fromCorner: tl
    };
};

var findLine = function (wx, wy, bias, bounds) {
    var weights = [wx, wy, bias];
    var tl = calcNet([bounds.xlim[0], bounds.ylim[1], 1], weights) > 0;
    var tr = calcNet([bounds.xlim[1], bounds.ylim[1], 1], weights) > 0;
    var bl = calcNet([bounds.xlim[0], bounds.ylim[0], 1], weights) > 0;
    var br = calcNet([bounds.xlim[1], bounds.ylim[0], 1], weights) > 0;
    if (tl && tr && !bl && !br) {
        return topBottomLine(wx, wy, bias, bounds, true);
    }
    if (!tl && !tr && bl && br) {
        return topBottomLine(wx, wy, bias, bounds, false);
    }
    if (tl && bl && !tr && !br) {
        return leftRightLine(wx, wy, bias, bounds, true);
    }
    if (!tl && !bl && tr && br) {
        return leftRightLine(wx, wy, bias, bounds, false);
    }

    // it must be a corner
    var corner = whichCorner(tl, tr, bl, br);
    var cz = [tl, tr, bl, br];
    if (tl === tr && tl === bl && bl === br) {
        return false;
    }
    return cornerLine(wx, wy, bias, bounds, corner.x, corner.y, corner.fromCorner);
};

var showWeights = function (wx, wy, bias, bounds) {
    var weights = [wx, wy, bias];
    var tl = calcNet([bounds.xlim[0], bounds.ylim[1], 1], weights) > 0;
    var tr = calcNet([bounds.xlim[1], bounds.ylim[1], 1], weights) > 0;
    var bl = calcNet([bounds.xlim[0], bounds.ylim[0], 1], weights) > 0;
    var br = calcNet([bounds.xlim[1], bounds.ylim[0], 1], weights) > 0;
    // four possibilities: top, bottom, left, right, tl, tr, bl, br
    if (tl && tr && !bl && !br) {
        return topBottomWeights(wx, wy, bias, bounds, true);
    }
    if (!tl && !tr && bl && br) {
        return topBottomWeights(wx, wy, bias, bounds, false);
    }
    if (tl && bl && !tr && !br) {
        return leftRightWeights(wx, wy, bias, bounds, true);
    }
    if (!tl && !bl && tr && br) {
        return leftRightWeights(wx, wy, bias, bounds, false);
    }

    // it must be a corner
    var corner = whichCorner(tl, tr, bl, br);
    var cz = [tl, tr, bl, br];
    if (tl === tr && tl === bl && bl === br) {
    setFill(tl ? 'lightred' : 'lightgreen');
    return fillBounds(bounds);
    }
    drawCorner(wx, wy, bias, bounds, corner.x, corner.y, corner.fromCorner);
};

var colorWeights = function (weights, bounds) {
    var wx = weights[0];
    var wy = weights[1];
    var bias = weights[2];
    noStroke();

    // the whole board will be one color
    if (wx === 0 && wy === 0) {
        if (bias > 0) {
            setFill('lightred');
        } else {
            setFill('lightgreen');
        }
        fillBounds(bounds);
        return;
    }

    // horizontal line
    if (wx === 0) {
        return horizontalWeight(wy, bias, bounds);
    }
    if (wy === 0) {
        return verticalWeight(wx, bias, bounds);
    }
    showWeights(wx, wy, bias, bounds);
};


var drawGraph = function (data, weights, point, results) {
    background(255, 255, 255);
    colorWeights(weights, bounds);
    graph(data.map(function (line, i) {
        return {
            x: line[0],
            y: line[1],
            stroke: line[2],
            fill: i < results.length ? pointColor(line[2], results[i]) : [255, 255, 255]
        };
    }), bounds, point_size
    );
};




var train = function (line, weights, training_rate) {
    var input = line.slice(0, -1).concat([1]);// bias weight
    var net = calcNet(input, weights);
    var output = net > 0 ? 1 : 0;
    var target = line[2] === 'red' ? 1 : 0;
    if (output === target) {
        return 0;
    }
    for (var i=0; i<weights.length; i++) {
        weights[i] += training_rate * (target - output) * input[i];
    }
    return 1;
};

var message = function (wrong, total) {
    if (wrong === null) {
        return "First run";
    }
    return "Missed " + wrong + " out of " + total;
};

var drawMessage = function (point, wrong, total) {
    textSize(20);
    fill(0, 0, 0);
    text(message(point, wrong, total), 50, 25);
};

var weights = [0, 0, 0];
var lastWrong = null;
var onPoint = 0;
var wrong = 0;
var data = [
    [0.5, 5, 'red'],
    [1, 10, 'red'],
    [2, 5, 'red'],
    [7, 10, 'red'],
    [0.5, 1, 'green'],
    [2, 1, 'green'],
    [4, 3, 'green'],
    [6, 1, 'green'],
    [10, 6, 'green']
];

var training_rate = 1;
var messages = ['First run'];
var results = [];
var listOfWeights = [];


var drawWeightLine = function (weights, bounds) {
    var l = findLine(weights[0], weights[1], weights[2], bounds);
    line(cx(l[0], bounds), cy(l[1], bounds), cx(l[2], bounds), cy(l[3], bounds));
};

var draw = function () {
    if (lastWrong === 0) {
        return;
    }

    var old = weights.slice();
    // listOfWeights.push(old);
    var diff = train(data[onPoint], weights, training_rate);
    results.push(diff === 0);
    drawGraph(data, old, onPoint, results);
    strokeWeight(1);
    drawWeightLine(weights, bounds);

    wrong += diff;
    onPoint += 1;

    fill(0, 0, 0);
    messages[messages.length - 1] = message(wrong, onPoint) + '\n' + listOfWeights.join('\n');
    text("Point " + onPoint + '/' + data.length, 50, 25);
    text(messages.join('\n'), 200, 50);

    if (onPoint >= data.length) {
        messages.pop();
        messages.push(message(wrong, data.length) + ' ' + weights);
        messages.push('');
        onPoint = 0;
        results = [];
        listOfWeights = [];
        lastWrong = wrong;
        wrong = 0;
    }
};

frameRate(2);

var plotme = function (x, y) {
    strokeWeight(3);
    
    ellipse(cx(x, bounds), cy(y, bounds), point_size, point_size);
};

var showme = function (wx, wy, bias) {
    colorWeights([wx, wy, bias], bounds);
    for (var i=0; i<10; i++) {
        ellipse(cx(i, bounds), cy(yIntercept(wx, wy, bias, i), bounds), point_size, point_size);
    }
};

/*
showme(-2, 3, -1);
stroke(0, 0, 0);
var l = findLine(-2, 3, -1, bounds);
line(cx(l[0], bounds), cy(l[1], bounds), cx(l[2], bounds), cy(l[3], bounds));
*/
//setFill(calcNet([10, 6, 1], [-2, 3, -1]) > 0 ? 'red' : 'green');
//plotme(10, 6);

