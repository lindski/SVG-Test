var ZOOM_IN_FACTOR = 0.95;
var ZOOM_OUT_FACTOR = 1.05;
var ORIGIN = new fabric.Point(0, 0);
var paper, paperContainer;
var mdp;

var objectOptions = {
    fill: "#ddd",
    stroke: "#aaa",
    "stroke-width": 1,
    "stroke-linejoin": "round",
    cursor: "pointer",
    opacity: 0.5,
    hasControls: false,
    hasBorders: false,
    lockMovementX: true,
    lockMovementY: true,
    selectionBackgroundColor: 'rgba(197,225,165,0.3)',
    hoverCursor: 'pointer'
  };

function onLoad() {
  paperContainer = document.querySelector("#canvasWrapper");
  var optObj = {
    width: paperContainer.offsetWidth,
    height: paperContainer.offsetHeight,
    backgroundColor: "rgba(255,255,0,0.5)"
  }
  paper = new fabric.Canvas('paper', optObj);
  paper.selection = false;
  
  var unit1 = new fabric.Path("M 5,5 H 300 V 400 H 5 Z");
  unit1.set(objectOptions);
  paper.add(unit1);
  
  var unit2 = new fabric.Path("M 300.1,5 H 400 V 400 H 300.1 Z");
  unit2.set(objectOptions);
  paper.add(unit2);

  var unit3 = new fabric.Path("M 400.1,5 H 500 V 400 H 400.1 Z");
  unit3.set(objectOptions);
  paper.add(unit3);

  paper.on('mouse:wheel', function(opt) {
    var zf =  opt.e.deltaY < 0 ? ZOOM_OUT_FACTOR : ZOOM_IN_FACTOR;
    var zoom = paper.getZoom() * zf;
    paper.setZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  paper.on("mouse:down", function(evt) {
    mdp = {x:evt.e.screenX, y:evt.e.screenY};
  });

  paper.on("mouse:up", function(evt) {
    updateViewBoxPosition(evt);
    mdp = null;
  });

  paper.on("mouse:move", updateViewBoxPosition);

  window.addEventListener("resize", function(evt) {
    var w = paperContainer.offsetWidth;
    var h = paperContainer.offsetHeight;
    paper.setWidth(w);
    paper.setHeight(h);
    paper.renderAll();
  });
}

function updateViewBoxPosition(evt) {
  if (mdp != null) {
    var deltaX = evt.e.screenX - mdp.x;
    var deltaY = evt.e.screenY - mdp.y;
    mdp.x = evt.e.screenX;
    mdp.y = evt.e.screenY;
    var delta = new fabric.Point(deltaX, deltaY);
    paper.relativePan(delta);
  }
}

  // reset zoom to 1.0
  document.querySelector("#rzoom").addEventListener("click", function() {
    paper.setZoom(1.0);
  });

  // reset viewport position to 0,0
  document.querySelector("#rpos").addEventListener("click", function() {
    paper.absolutePan(ORIGIN);
  });

window.addEventListener("load", onLoad, true);