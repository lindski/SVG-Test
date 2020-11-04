var PAPER_WIDTH  = 620;
var PAPER_HEIGHT = 600;

var paperContainer = document.getElementById("paper");
var paper = new Raphael(paperContainer, PAPER_WIDTH, PAPER_HEIGHT);

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

var selectedUnit;

  var unit1 = paper.path("M 5,5 H 300 V 400 H 5 Z");
  unit1.attr(style);
  initialiseClickHandler(unit1);
  
  var unit2 = paper.path("M 300.1,5 H 400 V 400 H 300.1 Z");
  unit2.attr(style);
  initialiseClickHandler(unit2);

  var unit3 = paper.path("M 400.1,5 H 500 V 400 H 400.1 Z");
  unit3.attr(style);
  initialiseClickHandler(unit3);

  function initialiseClickHandler(unit){
    unit[0].addEventListener("click", function() {
        if(selectedUnit){
            selectedUnit.attr(style);
        }
        unit.attr(style2);
        selectedUnit = unit;
    }, true);
  }