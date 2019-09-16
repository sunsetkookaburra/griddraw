///<reference lib="dom"/>
//@ts-check

// Coordinate Systems: grid, viewBox, svgDrawing
// scale = the distance between grid lines horizontal/vertical
// zoom = enlargement of the image

/*
TODO:
Ability to select line and manually move endpoints
Ability to select line and delete
Recolour lines

*/


// svgElement.getCTM().{e/f}

function round(number=0, increment=1, offset=0){
    return Math.ceil((number - offset) / increment ) * increment;
}

class Coords {
    constructor( viewBox={minX:0,minY:0,width:0,height:0}, svgDrawingElement=SVGSVGElement.prototype, scale=0 ){
        this.properties = {
            "scale": scale,
            "viewBox": {
                "x": viewBox["minX"]*scale,
                "y": viewBox["minY"]*scale,
                "width": viewBox["width"]*scale,
                "height": viewBox["height"]*scale
            },
            "svgDrawing": {
                get width(){return svgDrawingElement.width},
                //set width(v){v.baseVal.value},
                get height(){return svgDrawingElement.height},
                //set height(v){},
            }
        }
    }
    grid(x=0,y=0){
        let viewBoxX = x*this.properties["scale"]
        let viewBoxY = y*this.properties["scale"]
        return {
            "grid":         {"x":x,"y":y},
            "svgDrawing":   {"x":0,"y":0},
            "viewBox":      {"x":viewBoxX,"y":viewBoxY}
        }
    }
    svgDrawing(x=0,y=0){
        return {
            "grid":         {"x":0,"y":0},
            "svgDrawing":   {"x":x,"y":y},
            "viewBox":      {"x":0,"y":0}
        }
    }
    viewBox(x=0,y=0){
        let gridX = x/this.properties["scale"]
        let gridY = y/this.properties["scale"]
        return {
            "grid":         {"x":gridX,"y":gridY},
            "svgDrawing":   {"x":0,"y":0},
            "viewBox":      {"x":y,"y":x}
        }
    }
}

class Line {
    constructor( coords=Coords.prototype, x1=0, y1=0, x2=0, y2=0 ){
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "line")
        this.element.setAttribute("x1",coords.grid(x1,0).viewBox.x.toString())
        this.element.setAttribute("y1",coords.grid(0,y1).viewBox.y.toString())
        this.element.setAttribute("x2",coords.grid(x2,0).viewBox.x.toString())
        this.element.setAttribute("y2",coords.grid(0,y2).viewBox.y.toString())
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
    }
}

class BrushLine extends Line {
    constructor( coords=Coords.prototype, x1=0, y1=0, x2=0, y2=0 ){
        super(coords, x1, y1, x2, y2)
        this.element.setAttribute("class", "GridDraw-BrushLine")
    }
}

class GridLine extends Line {
    constructor( coords=Coords.prototype, x1=0, y1=0, x2=0, y2=0 ){
        super(coords, x1, y1, x2, y2)
        this.element.setAttribute("class", "GridDraw-GridLine")
    }
}

class Drawing {
    constructor(e=SVGSVGElement.prototype, properties={scale:100,zoom:1,numRows:5,numCols:5}){
        
        // brush history
        // current brush

        this.MOUSEDOWN = false
        this.currentLineEle = null
        this.currentLine = [0,0,0,0]
        
        // The SVG Root Element
        this.svgRoot = e
        // List of Brush Line Entities
        this.brushHistory = []
        // Set Drawing Properties
        this.properties = properties
        // Initialise Coordinate System
        this.coords = new Coords({
            "minX": -1,
            "minY": -1,
            "width": this.properties["numCols"]+2,
            "height": this.properties["numRows"]+2
            },this.svgRoot,this.properties["scale"])

        // current line viewed
        this.currentLineEle = new Line(this.coords,0,0,0,0)
        this.currentLineEle.element.style.visibility = "hidden"
        
        // Set HTML Properties
        e.setAttribute("class", `GridDraw`)
        //e.setAttribute("width", `${this.properties["scale"]*(this.properties["numCols"]+2)*this.properties["zoom"]}`)
        //e.setAttribute("height", `${this.properties["scale"]*(this.properties["numRows"]+2)*this.properties["zoom"]}`)
        e.setAttribute("viewBox", `${-this.properties["scale"]} ${-this.properties["scale"]} `+
            `${this.properties["scale"]*(this.properties["numCols"]+2)} `+
            `${this.properties["scale"]*(this.properties["numRows"]+2)}`)

        // Draw Grid
        for (let y = 0; y < this.properties["numRows"]+1; y++){
            this.svgRoot.appendChild(new GridLine(this.coords, 0, y, this.properties["numCols"], y).element);
        }
        for (let x = 0; x < this.properties["numCols"]+1; x++){
            this.svgRoot.appendChild(new GridLine(this.coords, x, 0, x, this.properties["numRows"]).element);
        }
        // Other
        for (let a of [
            [2,2,3,3],
            [3,2,2,3],

            [3,2,2,0],
            [3,0,2,2],

            [3,2,5,3],
            [3,3,5,2],

            [3,3,2,5],
            [2,3,3,5],

            [0,2,2,3],
            [0,3,2,2],

            [2,0,0,2],
            [3,0,5,2],
            [0,3,2,5],
            [3,5,5,3],
        ]){
            this.brush(new BrushLine(this.coords, a[0], a[1], a[2], a[3]))
        }

        // Create cursor
        this.cursor = document.createElementNS("http://www.w3.org/2000/svg","circle")
        this.cursor.setAttribute("class","GridDraw-Cursor")
        this.cursor.setAttribute("r","1")
        this.svgRoot.appendChild(this.cursor)
        
        // Detect mouse movement
        this.svgRoot.onmousemove = e => {
            this.cursor.setAttribute("cx", (
                this.coords.grid(round(this.coords.viewBox((e.offsetX - this.cursor.getCTM().e) / this.cursor.getCTM().a, 0).grid.x,0.5,0.25),0).viewBox.x
            ).toString())
            this.cursor.setAttribute("cy", (
                this.coords.grid(0,round(this.coords.viewBox(0,(e.offsetY - this.cursor.getCTM().f) / this.cursor.getCTM().d).grid.y,0.5,0.25)).viewBox.y
                //((e.offsetY - this.cursor.getCTM().f) / this.cursor.getCTM().d)
            ).toString())
            this.currentLine[2] = round(this.coords.viewBox((e.offsetX - this.cursor.getCTM().e) / this.cursor.getCTM().a, 0).grid.x,0.5,0.25)
            this.currentLine[3] = round(this.coords.viewBox(0,(e.offsetY - this.cursor.getCTM().f) / this.cursor.getCTM().d).grid.y,0.5,0.25)
            if (this.MOUSEDOWN) {

            } else {
            }
            
        }
        this.svgRoot.onmousedown = e => {
            this.MOUSEDOWN = true
            this.currentLine[0] = round(this.coords.viewBox((e.offsetX - this.cursor.getCTM().e) / this.cursor.getCTM().a, 0).grid.x,0.5,0.25)
            this.currentLine[1] = round(this.coords.viewBox(0,(e.offsetY - this.cursor.getCTM().f) / this.cursor.getCTM().d).grid.y,0.5,0.25)
        }
        this.svgRoot.onmouseup = e => {
            if (this.MOUSEDOWN){
                new BrushLine(this.coords,this.currentLine[0],this.currentLine[1],this.currentLine[2],this.currentLine[3])
            }
            this.MOUSEDOWN = false
        }
        window.onkeydown = e => {
            if (e.key === "Escape"){
                this.MOUSEDOWN = false
            }
        }
    }
    brush(line=BrushLine.prototype){
        this.brushHistory.push(line)
        this.svgRoot.appendChild(line.element)
    }
    undo(){
        let e = this.brushHistory.pop().element
        if (e) this.svgRoot.removeChild(e)
    }
}

function GridDraw( e=SVGSVGElement.prototype ){
    window["d"] = new Drawing(e, {
        "scale": 100,
        "zoom": 1,
        "numRows": 5,
        "numCols": 5
    });
}

/*
function initGrid(){
    for (let y = 0; y < PROPERTIES["rows"]+1; y++){
        drawLine(0, y, PROPERTIES["columns"], y, v=>{v.setAttribute("class", NAMES.GRID_LINE)})
    }
    for (let x = 0; x < PROPERTIES["columns"]+1; x++){
        drawLine(x, 0, x, PROPERTIES["rows"], v=>{v.setAttribute("class", NAMES.GRID_LINE)})
    }
}
*/
/*
const STATES = {
    "draw": false
}

const ELEMENTS = {
    "drawing": null,
    "cursor": null,
    "brush": null
}

const PROPERTIES = {
    rows: 10,
    columns: 10,
    scale: 100,
    cursorSize: 0.2
}
const LINES = [];
const URL_SVG = "http://www.w3.org/2000/svg"

// Vector Canvas
const VIEWBOX = [0,0,0,0];
VIEWBOX[0] = -PROPERTIES["scale"]
VIEWBOX[1] = -PROPERTIES["scale"]
VIEWBOX[2] = (PROPERTIES["columns"]+2) * PROPERTIES["scale"]
VIEWBOX[3] = (PROPERTIES["rows"]+2) * PROPERTIES["scale"]

const CURR_LINE = [0,0,0,0];
let DO_DRAW = false;

// Bac

const DRAWING = document.getElementById("drawing");
const CURSOR = document.createElementNS(URL_SVG, "circle");
CURSOR.setAttribute("id",NAMES.CURSOR_DOT)
CURSOR.setAttribute("r",(PROPERTIES.cursorSize*PROPERTIES["scale"]).toString())

function round(number=0, increment=1, offset=0){
    return Math.ceil((number - offset) / increment ) * increment;
}

// Grid to canvas
function g2c(c=0){return round(c*PROPERTIES["scale"],0.5,0.25)}
function c2g(c=0){return round(c/PROPERTIES["scale"],0.5,0.25)}
// viewBox to canvas
function b2c(c=0,w=1){return Math.round(c/500*w - PROPERTIES["scale"])}
function c2b(c=0,w=1){return Math.round(c*500/w - PROPERTIES["scale"])}

function drawLine(x1,y1,x2,y2,cb=(v=document.createElementNS(URL_SVG, "line"))=>{}){
    let tempLine = document.createElementNS(URL_SVG, "line");
    tempLine.setAttribute("x1", g2c(x1).toString());
    tempLine.setAttribute("y1", g2c(y1).toString());
    tempLine.setAttribute("x2", g2c(x2).toString());
    tempLine.setAttribute("y2", g2c(y2).toString());
    DRAWING.append(tempLine);
    cb(tempLine);
    return tempLine
}

function initGrid(){
    for (let y = 0; y < PROPERTIES["rows"]+1; y++){
        drawLine(0, y, PROPERTIES["columns"], y, v=>{v.setAttribute("class", NAMES.GRID_LINE)})
    }
    for (let x = 0; x < PROPERTIES["columns"]+1; x++){
        drawLine(x, 0, x, PROPERTIES["rows"], v=>{v.setAttribute("class", NAMES.GRID_LINE)})
    }
}

DRAWING.addEventListener("mousemove",function(e){
    CURSOR.setAttribute("cx", g2c(c2g(b2c(e.offsetX,VIEWBOX[2]))).toString())
    CURSOR.setAttribute("cy", g2c(c2g(b2c(e.offsetY,VIEWBOX[3]))).toString())

    CURR_LINE[2] = c2g(b2c(e.offsetX, VIEWBOX[2]))
    CURR_LINE[3] = c2g(b2c(e.offsetY, VIEWBOX[3]))

    drawLine(CURR_LINE[0],CURR_LINE[1],CURR_LINE[2],CURR_LINE[3], v=>{v.setAttribute("class", NAMES.BRUSH_LINE)})
})

DRAWING.addEventListener("mousedown",function(e){
    DO_DRAW = false;
})

DRAWING.addEventListener("mousedown",function(e){
    DO_DRAW = true;
    CURSOR.setAttribute("cx", g2c(c2g(b2c(e.offsetX,VIEWBOX[2]))).toString())
    CURSOR.setAttribute("cy", g2c(c2g(b2c(e.offsetY,VIEWBOX[3]))).toString())

    CURR_LINE[0] = c2g(b2c(e.offsetX, VIEWBOX[2]))
    CURR_LINE[1] = c2g(b2c(e.offsetY, VIEWBOX[3]))
})

DRAWING.setAttribute("viewBox", `${VIEWBOX[0]} ${VIEWBOX[1]} ${VIEWBOX[2]} ${VIEWBOX[3]}`)

initGrid();
DRAWING.append(CURSOR);

*/