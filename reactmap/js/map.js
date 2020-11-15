class Info extends React.Component {
  constructor(props) {
      super(props)
      this.state = {
          value: ""
      }
      this.clearInfo = this.clearInfo.bind(this);
      this.showInfo = this.showInfo.bind(this);
  }

  clearInfo() {
    this.setState({value: ""});
  }

  showInfo(mess) {
    var nl = '\u000A';
    if (mess != null) {
      var text = this.state.value;
      text += mess + nl;
      this.setState({value: text});
    }
  }

  componentDidMount() {
      this.setState({value: this.props.value})
  }

  componentDidUpdate() {
    var elt = ReactDOM.findDOMNode(this);
    elt.scrollTop = elt.scrollHeight;
  }  

  render() {
    return (
        <textarea readOnly rows={this.props.rows} value={this.state.value}></textarea>
    )
  }

};

class Button extends React.Component {

  render() {
    return (
        <input type="button" value={this.props.value}/>
    )
  }

};
  
class Paper extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
          ids: {
              canvasWrapperId: "canvasWrapper",
              canvasId: "paper",
          },
          wrapperWidth: 600,
          wrapperHeight: 400,
          canvas: null,
          wrapper: null,
          zoomOutFactor: 1.05,
          zoomInFactor: 0.95,
          mdp: null,
          pausePanning: false,
          zoomStartScale: null,
          showInfoHook: null
      }   
    this.selectItem = this.selectItem.bind(this);
    this.deselectItem = this.deselectItem.bind(this);
    this.updateViewBoxPosition = this.updateViewBoxPosition.bind(this);
    this.resetZoom = this.resetZoom.bind(this);
    this.resetPosition = this.resetPosition.bind(this);
  }

  onMouseWheel(opt) {
    var paper = this.state.canvas;
    var zf =  opt.e.deltaY < 0 ? this.state.zoomOutFactor : this.state.zoomInFactor;
    var zoom = paper.getZoom() * zf;
    paper.setZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  }

  onMouseDown(evt) {
    if (evt.e.type.startsWith("touch")) {
      return;
    }
    this.state.mdp = {x:evt.e.screenX, y:evt.e.screenY};
  }

  onMouseUp(evt) {
    if (evt.e.type.startsWith("touch")) {
      return;
    }
    this.updateViewBoxPosition(evt);
    this.state.mdp = null;
  }

  onTouchGesture(e) {
    var paper = this.state.canvas;
    if (e.e.touches && e.e.touches.length == 2) {
        this.state.pausePanning = true;
        var point = new fabric.Point(e.self.x, e.self.y);
        if (e.self.state == "start") {
          this.state.zoomStartScale = paper.getZoom();
        }
        var delta = this.state.zoomStartScale * e.self.scale;
        paper.zoomToPoint(point, delta);
        this.state.pausePanning = false;
    }
  }

  onTouchDrag(e) {
    var paper = this.state.canvas;
    if (this.state.pausePanning == false && e.e.touches && e.e.touches.length == 1) {
      if (e.self.state == "down") {
        this.state.mdp = {x:e.self.x, y:e.self.y};
      }
      else if (e.self.state == "up") {
        this.state.mdp = null;
      }
      else {
        var delta = new fabric.Point(e.self.x - this.state.mdp.x, e.self.y - this.state.mdp.y);
        if( (Math.abs(delta.x) <= 50) && (Math.abs(delta.y) <= 50)) {
            paper.relativePan(delta);
        }
        this.state.mdp = {x:e.self.x, y:e.self.y};
      }
    }
  }

  onSelectionCreated(evt) {
    if (evt.selected.length > 0) {
      evt.selected.forEach(this.selectItem);
    }
  }

  onSelectionUpdated(evt) {
    if (evt.deselected.length > 0) {
      evt.deselected.forEach(this.deselectItem);
    }
    if (evt.selected.length > 0) {
      evt.selected.forEach(this.selectItem);
    }
  }

  onSelectionCleared(evt) {
    if (evt.deselected.length > 0) {
      evt.deselected.forEach(this.deselectItem);
    }
  }

  onWindowResize(evt) {
    var paper = this.state.canvas;
    var w = this.state.wrapper.offsetWidth;
    var h = this.state.wrapper.offsetHeight;
    this.setState({wrapperWidth: w, wrapperHeight: h});
    paper.setWidth(w);
    paper.setHeight(h);
    paper.renderAll();
  }

  selectItem(item) {
    var sih, paper = this.state.canvas;
    if (item != null && item.type == 'group') {
      item.item(1).set({fill: 'green'});
      paper.requestRenderAll();
      sih = this.state.showInfoHook;
      if (sih != null) {
        sih('Selected item '+item.item(1).text);
      }
    }
  }
  
  deselectItem(item) {
    var sih, paper = this.state.canvas;
    if (item != null && item.type == 'group') {
      item.item(1).set({fill: 'red'});
      paper.requestRenderAll();
      sih = this.state.showInfoHook;
      if (sih != null) {
        sih('Deselected item '+item.item(1).text);
      }
    }
  }
  
  updateViewBoxPosition(evt) {
    var paper = this.state.canvas;
    if (evt.e.type.startsWith("touch")) {
      return;
    }
    if (this.state.mdp != null) {
      var deltaX = evt.e.screenX - this.state.mdp.x;
      var deltaY = evt.e.screenY - this.state.mdp.y;
      this.state.mdp.x = evt.e.screenX;
      this.state.mdp.y = evt.e.screenY;
      var delta = new fabric.Point(deltaX, deltaY);
      paper.relativePan(delta);
    }
  }
  // reset zoom to 1.0
  resetZoom() {
    var paper = this.state.canvas;
    paper.setZoom(1.0);
  }

  // reset viewport position to 0,0
  resetPosition() {
    var paper = this.state.canvas;
    paper.absolutePan(new fabric.Point(0, 0));
  }

  initCanvas(paper) {
    var objectOptions = {
        fill: "#ddd",
        stroke: "#aaa",
        "stroke-width": 1,
        "stroke-linejoin": "round",
        opacity: 0.5,
        originX: 'center',
        originY: 'center',
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

    paper.on('mouse:wheel', this.onMouseWheel.bind(this));
    paper.on('mouse:down', this.onMouseDown.bind(this));
    paper.on('mouse:up', this.onMouseUp.bind(this));
    paper.on('mouse:move', this.updateViewBoxPosition);
    paper.on('touch:gesture', this.onTouchGesture.bind(this));
    paper.on('touch:drag', this.onTouchDrag.bind(this));
    paper.on('selection:created', this.onSelectionCreated.bind(this));
    paper.on('selection:updated', this.onSelectionUpdated.bind(this));
    paper.on('selection:cleared', this.onSelectionCleared.bind(this));
    window.addEventListener("resize", this.onWindowResize. bind(this)); 
  }

  componentDidMount() {
    var el = ReactDOM.findDOMNode(this);
    var paper = new fabric.Canvas(this.state.ids.canvasId, {
      height: el.offsetHeight,
      width: el.offsetWidth,
      backgroundColor: "rgba(255,255,0,0.5)"});        
    this.setState({
    wrapperWidth: el.offsetWidth,
    wrapperHeight: el.offsetHeight,
    wrapper: el,
    canvas: paper,
    showInfoHook: this.props.sih
    });
    this.initCanvas(paper);
  }

  render() {
    return (
    <div className="main">
      <div id={this.state.ids.canvasWrapperId}>
        <canvas id={this.state.ids.canvasId}></canvas>
      </div>
    </div>
    )
  }
}
  
class TodoApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        items: [
          { value: "Reset zoom", id: "1" },
          { value: "Reset position", id: "2" },
          { value: "Clear info", id: "3" }
      ],
      info: { value: "", rows: "5", id: "4" },
      sih: null
    }
    this.updateInfo = this.updateInfo.bind(this);
  }

  componentDidMount() {
    var elt = ReactDOM.findDOMNode(this.refs.clr);
    elt.onclick = this.refs.info.clearInfo;
    elt = ReactDOM.findDOMNode(this.refs.rz);
    elt.onclick = this.refs.pap.resetZoom;
    elt = ReactDOM.findDOMNode(this.refs.rp);
    elt.onclick = this.refs.pap.resetPosition;
    this.setState({sih: this.refs.info.showInfo});
  }

  updateInfo(mess) {
    var sih = this.state.sih;
    if (sih != null) {
      sih(mess);
    }
  }

  render() {
    return (
      <div className="main">
        <div className="nav shadow">
          <ul>
            <li key={this.state.items[0].id}>
              <Button ref="rz" value={this.state.items[0].value}/> 
            </li>
            <li key={this.state.items[1].id}>
              <Button ref="rp" value={this.state.items[1].value}/> 
            </li>
            <li key={this.state.items[2].id}>
              <Button ref="clr" value={this.state.items[2].value}/> 
            </li>
            <li key={this.state.info.id}>
                <Info ref="info" value={this.state.info.value} /> 
            </li>
          </ul>
        </div>
        <div className="sand shadow">
            <Paper ref="pap" sih={this.updateInfo}/> 
        </div>
      </div>
    )
  }
}

ReactDOM.render(<TodoApp />, document.querySelector("#app"))
