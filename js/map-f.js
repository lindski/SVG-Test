var ZOOM_IN_FACTOR = 0.95;
var ZOOM_OUT_FACTOR = 1.05;
var ORIGIN = new fabric.Point(0, 0);
var paper, paperContainer;
var mdp;
var pausePanning = false;
var zoomStartScale;

var objectOptions = {
    fill: "#ddd",
    stroke: "#aaa",
    "stroke-width": 1,
    "stroke-linejoin": "round",
    opacity: 0.5,
    originX: 'center',
    originY: 'center',
    // hasControls: false,
    // hasBorders: false,
    // lockMovementX: true,
    // lockMovementY: true,
    // lockScalingX: true,
    // lockScalingY: true,
    // lockScewingX: true,
    // lockScewingY: true,
    // lockRotation: true,
    // selectionBackgroundColor: 'rgba(197,225,165,0.3)',
    // hoverCursor: 'pointer'
  };

  var groupOptions = {
    hasControls: false,
    hasBorders: false,
    selectionBackgroundColor: 'rgba(197,225,165,0.3)',
    borderColor: 'red',
    borderWidth: 2,
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockScewingX: true,
    lockScewingY: true,
    lockRotation: true,
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
  var text1 = new fabric.Text('1', {
    fontSize: 48, 
    originX: 'center',
    originY: 'center',
    fill: 'red'
  });
  var group1 = new fabric.Group([unit1, text1], {originX:'left', originY:'top', top:0, left:0});
  group1.setOptions(groupOptions);
  paper.add(group1);
  
  var unit2 = new fabric.Path("M 5,5 H 100 V 400 H 5 Z");
  unit2.set(objectOptions);
  var text2 = new fabric.Text('2', {
    fontSize: 48, 
    originX: 'center',
    originY: 'center',
    fill: 'red'
  });
  var group2 = new fabric.Group([unit2, text2], {originX:'left', originY:'top', top:0, left:group1.get('width')});
  group2.setOptions(groupOptions);
  paper.add(group2);

  var unit3 = new fabric.Path("M 5,5 H 100 V 400 H 5 Z");
  unit3.set(objectOptions);
  var text3 = new fabric.Text('3', {
    fontSize: 48, 
    originX: 'center',
    originY: 'center',
    fill: 'red'
  });
  var group3 = new fabric.Group([unit3, text3], {originX:'left', originY:'top', top:0, left:group2.get('width') + group2.get('left')});
  group3.setOptions(groupOptions);
  paper.add(group3);

  paper.renderAll();

  paper.on('mouse:wheel', function(opt) {
    var zf =  opt.e.deltaY < 0 ? ZOOM_OUT_FACTOR : ZOOM_IN_FACTOR;
    var zoom = paper.getZoom() * zf;
    paper.setZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  paper.on("mouse:down", function(evt) {
    if (evt.e.type.startsWith("touch")) {
      return;
    }
    mdp = {x:evt.e.screenX, y:evt.e.screenY};
  });

  paper.on("mouse:up", function(evt) {
    if (evt.e.type.startsWith("touch")) {
      return;
    }
    updateViewBoxPosition(evt);
    mdp = null;
  });

  paper.on("mouse:move", updateViewBoxPosition);

  paper.on('touch:gesture', function(e) {
      if (e.e.touches && e.e.touches.length == 2) {
          pausePanning = true;
          var point = new fabric.Point(e.self.x, e.self.y);
          if (e.self.state == "start") {
              zoomStartScale = self.paper.getZoom();
          }
          var delta = zoomStartScale * e.self.scale;
          self.paper.zoomToPoint(point, delta);
          pausePanning = false;
      }
  });

  paper.on('touch:drag', function(e) {
      if (pausePanning == false && e.e.touches && e.e.touches.length == 1) {
          if (e.self.state == "down") {
            mdp = {x:e.self.x, y:e.self.y};
          }
          else if (e.self.state == "up") {
            mdp = null;
          }
          else {
            var delta = new fabric.Point(e.self.x - mdp.x, e.self.y - mdp.y);
            if( (Math.abs(delta.x) <= 50) && (Math.abs(delta.y) <= 50)) {
                paper.relativePan(delta);
            }
            mdp = {x:e.self.x, y:e.self.y};
          }
      }
  });

  paper.on('selection:created', function(evt) {
    if (evt.selected.length > 0) {
      evt.selected.forEach(selectItem);
    }
  });

  paper.on('selection:updated', function(evt) {
    if (evt.deselected.length > 0) {
      evt.deselected.forEach(deselectItem);
    }
    if (evt.selected.length > 0) {
      evt.selected.forEach(selectItem);
    }
  });

  paper.on('selection:cleared', function(evt) {
    if (evt.deselected.length > 0) {
      evt.deselected.forEach(deselectItem);
    }
  });

  window.addEventListener("resize", function(evt) {
    var w = paperContainer.offsetWidth;
    var h = paperContainer.offsetHeight;
    paper.setWidth(w);
    paper.setHeight(h);
    paper.renderAll();
  });

}

function selectItem(item) {
  if (item != null && item.type == 'group') {
    item.item(1).set({fill: 'green'});
    paper.requestRenderAll();
    showInfo('Selected item '+item.item(1).text);
  }
}

function deselectItem(item) {
  if (item != null && item.type == 'group') {
    item.item(1).set({fill: 'red'});
    paper.requestRenderAll();
    showInfo('Deselected item '+item.item(1).text);
  }
}

function updateViewBoxPosition(evt) {
  if (evt.e.type.startsWith("touch")) {
    return;
  }
  if (mdp != null) {
    var deltaX = evt.e.screenX - mdp.x;
    var deltaY = evt.e.screenY - mdp.y;
    mdp.x = evt.e.screenX;
    mdp.y = evt.e.screenY;
    var delta = new fabric.Point(deltaX, deltaY);
    paper.relativePan(delta);
  }
}

function showInfo(mess) {
  if (mess != null) {
    document.querySelector("#infofield").value += mess + '\n';
    document.querySelector("#infofield").scrollTop = document.querySelector("#infofield").scrollHeight;
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

// reset viewport position to 0,0
document.querySelector("#clinfo").addEventListener("click", function() {
  document.querySelector("#infofield").value = "";
});

window.addEventListener("load", onLoad, true);
