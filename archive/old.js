/*const DRAW_LINES = []
const DRAW_PROP = {
	offset: 0.5,
	res: 2,
	cols: 8,
	rows: 8,
	scale: 80,
	getScale(){return this.scale * this.res},
	bgColour: "#FFFFFF",
	gridWidth: 2,
	getGridWidth(){return this.gridWidth * this.res},
	gridColour: "#77C8FF",
	brushWidth: 16,
	getBrushWidth(){return this.brushWidth * this.res},
	brushColour: "#000000",
	canvasWidth: 0,
	getCanvasWidth(){return this.canvasWidth * this.res},
	canvasHeight: 0,
	getCanvasHeight(){return this.canvasHeight * this.res},
}
const INIT_WH = 256

const canvasGroup = document.getElementById("canvasGroup");

const cnvCursor = document.createElement("canvas");
const ctxCursor = cnvCursor.getContext("2d");
cnvCursor.id = "cnvCursor";
cnvCursor.width = INIT_WH;
cnvCursor.height = INIT_WH;

const cnvBrush = document.createElement("canvas");
const ctxBrush = cnvBrush.getContext("2d");
cnvBrush.id = "cnvBrush";
cnvBrush.width = INIT_WH;
cnvBrush.height = INIT_WH;

const cnvDrawing = document.createElement("canvas");
const ctxDrawing = cnvDrawing.getContext("2d");
cnvDrawing.id = "cnvDrawing";
cnvDrawing.width = INIT_WH;
cnvDrawing.height = INIT_WH;

const cnvGrid = document.createElement("canvas");
const ctxGrid = cnvGrid.getContext("2d");
cnvGrid.id = "cnvGrid";
cnvGrid.width = INIT_WH;
cnvGrid.height = INIT_WH;

const cnvBackground = document.createElement("canvas");
const ctxBackground = cnvBackground.getContext("2d");
cnvBackground.id = "cnvBackground";
cnvBackground.width = INIT_WH;
cnvBackground.height = INIT_WH;

canvasGroup.appendChild(cnvBackground);
canvasGroup.appendChild(cnvGrid);
canvasGroup.appendChild(cnvDrawing);
canvasGroup.appendChild(cnvBrush);
canvasGroup.appendChild(cnvCursor);

// Convert point from grid coord to canvas px
function gtc(coord){
	return ((coord+DRAW_PROP["offset"]) * DRAW_PROP.getScale())
}

function drawLine(ctx, x1, y1, x2, y2){
	ctx.moveTo(gtc(x1), gtc(y1))
	ctx.lineTo(gtc(x2), gtc(y2))
}

function drawGrid(){
	for (let y=0; y < DRAW_PROP["rows"]+1; y++){
		drawLine(ctxGrid, 0, y, DRAW_PROP["rows"], y)
	}
	for (let x=0;x < DRAW_PROP["cols"]+1; x++){
		drawLine(ctxGrid, x, 0, x, DRAW_PROP["cols"])
	}
	ctxGrid.stroke()
}

function add( p1x=0, p1y=0, p2x=0, p2y=0 )
{
	drawLine(ctxDrawing, p1x, p1y, p2x, p2y)
	ctxDrawing.stroke()
}
function select( px=0, py=0 )
{

}

function setCanvasSize(){
	DRAW_PROP["canvasWidth"] = (DRAW_PROP["cols"] + 1) * (DRAW_PROP["scale"]) + (DRAW_PROP["gridWidth"] / 2)
	DRAW_PROP["canvasHeight"] = (DRAW_PROP["rows"] + 1) * (DRAW_PROP["scale"]) + (DRAW_PROP["gridWidth"] / 2)
	canvasGroup.style.width = DRAW_PROP["canvasWidth"]+"px"
	canvasGroup.style.height = DRAW_PROP["canvasWidth"]+"px"
	for (let c of canvasGroup.children){
		c.width = DRAW_PROP.getCanvasWidth()
		c.height = DRAW_PROP.getCanvasHeight()
	}
}

function setStyles(){
	ctxDrawing.lineWidth = DRAW_PROP.getBrushWidth()
	ctxDrawing.lineCap = "round"
	ctxDrawing.strokeStyle = DRAW_PROP["brushColour"]
	
	ctxGrid.strokeStyle = DRAW_PROP["gridColour"]
	ctxGrid.lineWidth = DRAW_PROP.getGridWidth()
	ctxGrid.lineCap = "square"
	
	ctxBackground.fillStyle = DRAW_PROP["bgColour"]
}

function updatePane(){
	setCanvasSize()
	setStyles()
	ctxBackground.fillRect(0,0,cnvBackground.width,cnvBackground.height)
	drawGrid()
}

// Init Program 
updatePane()
add(0,0,1,1)
*/
