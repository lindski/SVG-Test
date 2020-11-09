var paper, paperContainer;
var selectedUnit;
var ZOOM_IN_FACTOR = 0.95;
var ZOOM_OUT_FACTOR = 1.05;
var dX = 0, dY = 0;
var mdp, vboxBounds;
var panMode = false;

var style = {
    fill: "#ddd",
    stroke: "#aaa",
    "stroke-width": 1,
    "stroke-linejoin": "round",
    cursor: "pointer",
    opacity: 0.5
  };

  var style2 = {
    fill: "#c5e1a5",
    stroke: "#aaa",
    "stroke-width": 1,
    "stroke-linejoin": "round",
    cursor: "pointer",
    opacity: 0.5
  };

var cstyle = {
    fill: "#f00",
    stroke: "#000",
    "stroke-width": 1,
    opacity: 0.5
  };
  
function onLoad() {
  paperContainer = document.querySelector("#paper");
  // create canvas with the size of the paperContainer.
  paper = new Raphael('paper');
  // set viewbox size equals canvas size and position at 0,0. Now the zoom (scale) is equals 1.0
  vboxBounds = {x: 0, y: 0, width: paper.width, height: paper.height};
  paper.setViewBox(vboxBounds.x, vboxBounds.y, vboxBounds.width, vboxBounds.height);
  paper.canvas.style.backgroundColor = "rgba(255,255,0,0.5)";

  // draw content
  // use setStart() to prevent canvas updates after each drawing
  paper.setStart();

  var unit1 = paper.path("M 5,5 H 300 V 400 H 5 Z");
  unit1.attr(style);
  initialiseClickHandler(unit1);
  
  var unit2 = paper.path("M 300.1,5 H 400 V 400 H 300.1 Z");
  unit2.attr(style);
  initialiseClickHandler(unit2);

  var unit3 = paper.path("M 400.1,5 H 500 V 400 H 400.1 Z");
  unit3.attr(style);
  initialiseClickHandler(unit3);

  // after all content was drawn allow to update canvas
  paper.setFinish();

  // add mouse wheel listener to control zoom
  paperContainer.addEventListener("wheel", onWheel, true);

  // add mouse listenerse to control pan
  paperContainer.onmousedown = function(evt) {
    mdp = {x:evt.pageX, y:evt.pageY};
    // avoid unwanted native drag and drop
    window.getSelection().empty();
  }

  paperContainer.onmouseup = function(evt) {
    if (panMode) {
      vboxBounds.x += dX;
      vboxBounds.y += dY;
      evt.preventDefault();
      evt.stopPropagation();
    }
    panMode = false;
    mdp = null;
  }

  paperContainer.onmousemove = function(evt) {
    if (mdp != null) {
      panMode = true;
      dX = (mdp.x - evt.pageX) * vboxBounds.width / paper.width;
      dY = (mdp.y - evt.pageY) * vboxBounds.height / paper.height;
      paper.setViewBox(vboxBounds.x + dX, vboxBounds.y + dY, vboxBounds.width, vboxBounds.height);
    }
  }

  // mouse handler to handle mouseup out of window or canvas border
  window.addEventListener("mouseup", function(evt) {
    if (panMode) {
      vboxBounds.x += dX;
      vboxBounds.y += dY;
    }
    panMode == false
    mdp = null;
  }, false);
  
  // reset zoom to 1.0
  document.querySelector("#rzoom").addEventListener("click", function() {
    // note current viewbox width and height
    var ow = vboxBounds.width;
    var oh = vboxBounds.height;
    vboxBounds.width = paper.width;
    vboxBounds.height = paper.height;
    // avoid unwanted viewport shift 
    vboxBounds.x -= (vboxBounds.width - ow) / 2;
    vboxBounds.y -= (vboxBounds.height - oh) / 2;
    // set new vewbox bounds
    paper.setViewBox(vboxBounds.x, vboxBounds.y, vboxBounds.width, vboxBounds.height);
  });

  // reset viewport position to 0,0
  document.querySelector("#rpos").addEventListener("click", function() {
    var ow = paper.width;
    var oh = paper.height;
    vboxBounds.x = -(vboxBounds.width - ow) / 2;
    vboxBounds.y = -(vboxBounds.height - oh) / 2;
    // set new vewbox bounds
    paper.setViewBox(vboxBounds.x, vboxBounds.y, vboxBounds.width, vboxBounds.height);
  });
  
  // adjusts paper boundary to owner container size
  window.addEventListener("resize", function(evt) {
    var opw = paper.width;
    var oph = paper.height;
    var ovb = {x: vboxBounds.x, y: vboxBounds.y, width: vboxBounds.width, height: vboxBounds.height};
    var osx = ovb.width / opw;
    var osy = ovb.height / oph;
    paper.setSize(paperContainer.offsetWidth, paperContainer.offsetHeight);
    vboxBounds.width = paper.width * osx;
    vboxBounds.height = paper.height * osy;
    vboxBounds.x -= (paper.width - ovb.width) / 2;
    vboxBounds.y -= (paper.height - ovb.height) / 2;

    paper.setViewBox(vboxBounds.x, vboxBounds.y, vboxBounds.width, vboxBounds.height);
  });
}

function initialiseClickHandler(unit){
  unit[0].addEventListener("click", function() {
    if(selectedUnit){
      selectedUnit.attr(style);
    }
    unit.attr(style2);
    selectedUnit = unit;
  }, true);
}

// mouse wheel event handler
function onWheel(evt) {
  doScale(evt.deltaY < 0.0);
  evt.preventDefault();
}

// changes the current zoom
function doScale(zoomIn) {
  // note current viewbox width and height
  var ow = vboxBounds.width;
  var oh = vboxBounds.height;
  // calculate new width and height
  var curScale = zoomIn ? ZOOM_IN_FACTOR : ZOOM_OUT_FACTOR;
  vboxBounds.width *= curScale;
  vboxBounds.height *= curScale;
  // avoid unwanted viewport shift 
  vboxBounds.x -= (vboxBounds.width - ow) / 2;
  vboxBounds.y -= (vboxBounds.height - oh) / 2;
  // set new vewbox bounds
  paper.setViewBox(vboxBounds.x, vboxBounds.y, vboxBounds.width, vboxBounds.height);
}

window.addEventListener("load", onLoad, true);
