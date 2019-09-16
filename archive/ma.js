/*
const STATES = {
    "draw": false
}

const ELEMENTS = {
    "cursor": null,
    "brush": null
}

const NAMES = {
    GRID_LINE: "gridLine",
    BRUSH_LINE: "brushLine",
    DRAW_LINE: "drawLine",
    CURSOR_DOT: "cursorDot",
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