/*
  (C) Copyright 2019, Oliver Lenehan

  TODO:
   + css/js var integration
   + resize grid live (from corner or centre)
*/

/// <reference lib="dom"/>

type lineTypes = "grid" | "brushed" | "brushing" 

interface DrawingProperties {
	root: SVGSVGElement
	scale: number
	width: number
	height: number
}

interface Viewbox {
	minX: number
	minY: number
	width: number
	height: number
	toString(): string
}

interface Point {
	x: number
	y: number
}

interface DrawingLayers {
	grid: SVGGElement
	brush: SVGGElement
	cursor: SVGGElement
}

function round(n: number, step: number){
    return step * Math.ceil((n + (step**2)) / step - 1)
}

/** A coordinate system that can scale from the dom, viewbox or local grid system */
class Coords {
	viewbox: Viewbox
	constructor( private d: DrawingProperties ){
		this.viewbox = {
			"minX": -this.d.scale, "minY": -this.d.scale,
			"width": (this.d.width + 2) * this.d.scale , "height": (this.d.height + 2) * this.d.scale,
			toString(){return `${this.minX} ${this.minY} ${this.width} ${this.height}`}
		}
	}
	fromGrid( p: Point ){return{
		toViewbox: ()=>({
			"x": p.x * this.d.scale,
			"y": p.y * this.d.scale
		} as Point)
	}}
	fromViewbox( p: Point ){return{
		toGrid: ( step: number = 0.5 )=>({
			"x": round(p.x / this.d.scale, step),
			"y": round(p.y / this.d.scale, step)
		} as Point)
	}}
}

/** A line that holds the svg element and local grid coords */
class Line {
	element: SVGLineElement = document.createElementNS("http://www.w3.org/2000/svg", "line")
	constructor( public lineType: lineTypes, public pointA: Point, public pointB: Point ){}
	update( c: Coords ){
		if (this.lineType === "brushed"){
			this.element.setAttribute("class", "GridDraw-BrushLine")
		} else if (this.lineType === "brushing"){
			this.element.setAttribute("class", "GridDraw-DrawLine")
		} else if (this.lineType === "grid"){
			this.element.setAttribute("class", "GridDraw-GridLine")
			this.element.setAttribute("vector-effect", "non-scaling-size")
		}
		let a = c.fromGrid(this.pointA).toViewbox()
		let b = c.fromGrid(this.pointB).toViewbox()
		this.element.setAttribute("x1",a.x.toString())
		this.element.setAttribute("y1",a.y.toString())
		this.element.setAttribute("x2",b.x.toString())
		this.element.setAttribute("y2",b.y.toString())
	}
}

class Cursor {
	point: Point = {x:0, y: 0}
	element: SVGCircleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle")
	constructor(){
		this.element.setAttribute("class","GridDraw-Cursor")
		this.element.setAttribute("r","10")
	}
	update( c: Coords ){
		let p = c.fromGrid(this.point).toViewbox()
		this.element.setAttribute("cx", p.x.toString())
		this.element.setAttribute("cy", p.y.toString())
	}
}

class Paintbrush {
	line: Line = null
	isPainting: boolean = false
	constructor( private coords: Coords ){}
	begin(p: Point){
		this.isPainting = true
		this.line = new Line("brushing", {x:0,y:0}, {x:0,y:0})
		this.line.element.style.visibility = "hidden"
		this.line.pointA = p
		this.line.update(this.coords)
	}
	update(p: Point){
		if (this.isPainting) {
			this.line.element.style.visibility = "visible"
			this.line.pointB = p
			this.line.update(this.coords)
		}
	}
	cancel(){
		this.isPainting = false
		if (this.line !== null) this.line.element.remove()
		this.line = null
	}
	end(p: Point){
		if (this.isPainting === true) {
			this.line.element.style.visibility = "visible"
			this.line.pointB = p
			this.line.lineType = "brushed"
			this.line.update(this.coords)
		}
		this.isPainting = false
		this.line = null
	}
}

//
class BrushHistory {
	list: Line[] = []
	constructor( private coords: Coords, private root: Element ){}
	add( l: Line ){
		if (l === null) return
		this.list.push(l)
		l.update(this.coords)
		this.root.appendChild(l.element)
	}
	undo(){
		let l = this.list.pop()
		if (l) l.element.remove()
	}
	remove( l: Line ){
		if (l === null) return
		l.element.remove()
		this.list = this.list.filter(v=>v.element!=l.element)
	}
	flush(){
		for (let l of this.list) l.element.remove()
		this.list = []
	}
	// comma separates each line
	// each point is :x1:y1:x2:y2
	// : is replaced with ; for a fraction
	// e.g. 0.5 -> ;2
	export(){return this.list.map(v=>`${v.pointA.x.toString()}:${v.pointA.y.toString()}:${v.pointB.x.toString()}:${v.pointB.y.toString()}`).join(",\r\n")}
	import(data: string){
		//this.flush()
		if(!data)return
		data = data.replace(/\s/g,"")
		let dataList = data.split(",")
		for (let d of dataList){
			let dSplit = d.split(":").map(Number)
			this.add(new Line("brushed",{x:dSplit[0],y:dSplit[1]},{x:dSplit[2],y:dSplit[3]}))
		}
	}
}

class Drawing {
	root: SVGSVGElement
	layers: DrawingLayers
	coords: Coords
	history: BrushHistory
	cursor: Cursor
	paintbrush: Paintbrush
	selectedLine: Line
	constructor( d: DrawingProperties ){

		// init/assign members
		this.root = d.root
		this.initLayers()
		this.coords = new Coords(d)
		this.history = new BrushHistory(this.coords, this.layers.brush)

		// init svg root properties
		this.root.setAttribute("class", "GridDraw")
		this.root.setAttribute("viewBox", this.coords.viewbox.toString())
		// establish as the captured input element using tab-index=0
		this.root.tabIndex = 0
		
		// draw the grid
		this.initGrid(d)

		// Add cursor
		this.cursor = new Cursor()
		this.layers.cursor.appendChild(this.cursor.element)

		// Add paintbrush
		this.paintbrush = new Paintbrush(this.coords)
		
		// set the drawing to capture keyboard events
		window.setTimeout(()=>{this.root.focus()},0)

		// event handlers

		// when the mouse goes down
		this.root.onmousedown = e => {
			// begin painting
			this.paintbrush.begin(this.cursor.point)
			// add painting line to history
			this.history.add(this.paintbrush.line)
		}

		// when the mouse goes up
		this.root.onmouseup = e => {
			// finish painting
			this.paintbrush.end(this.cursor.point)
		}

		// when the mouse moves
		this.root.onmousemove = e => {
			// set the position of the cursor from the mouse position
			this.cursor.point = this.coords.fromViewbox({
				x: (e.offsetX - this.root.getCTM().e) / this.root.getCTM().a,
				y : (e.offsetY - this.root.getCTM().f) / this.root.getCTM().d
			}).toGrid()
			// update the position of the cursor in the svg element
			this.cursor.update(this.coords)
			// update the position of the brush line in the svg element
			this.paintbrush.update(this.cursor.point)

			// Get the currently hovered line
			this.selectedLine = null
			for (let b of this.history.list){
				if (b.element.matches(":hover")){
					this.selectedLine = b
				}
			}
			// set the drawing to capture keyboard events
			window.setTimeout(()=>{this.root.focus()},0)
		}

		// when the keyboard is pressed
		this.root.onkeydown = e => {
			// cancel current brushing
			if (["Escape", "c", "C"].includes(e.key)){
				// remove from history
				this.history.remove(this.paintbrush.line)
				// cancel the brush
				this.paintbrush.cancel()
			}
			// undo previous brush
			else if (["u", "U"].includes(e.key)){
				this.history.undo()
			}
			// delete hovered brush
			else if (["d", "D"].includes(e.key)){
				this.history.remove(this.selectedLine)
			}
		}
	}
	private initLayers(){
		// add groups for each z-level of brushes
		this.layers = {
			"grid": document.createElementNS("http://www.w3.org/2000/svg", "g"),
			"brush": document.createElementNS("http://www.w3.org/2000/svg", "g"),
			"cursor": document.createElementNS("http://www.w3.org/2000/svg", "g")
		}
		this.root.appendChild(this.layers.grid)
		this.root.appendChild(this.layers.brush)
		this.root.appendChild(this.layers.cursor)
	}
	private initGrid( d: DrawingProperties ){
        for (let y = 0; y < d.width+1; y++) {
			let l = new Line("grid", {x:0, y:y}, {x:d.width, y:y})
			l.update(this.coords)
			this.layers.grid.appendChild(l.element)
		}
		for (let x = 0; x < d.height+1; x++) {
			let l = new Line("grid", {x:x, y:0}, {x:x, y:d.height})
			l.update(this.coords)
			this.layers.grid.appendChild(l.element)
		}
	}
}

function GridDraw( e: SVGSVGElement ){
	window["d"] = new Drawing({
		"root": e,
		"width": parseInt(e.getAttribute("data-xy").split(" ")[0]) || 5,
		"height": parseInt(e.getAttribute("data-xy").split(" ")[1]) || 5,
		"scale": 100
	})
}

/* Program Init */
console.log("GridDraw v2.0 :D")
console.log("GridDraw Controls: ('u' for undo, 'escape'/'c' for cancel, 'd' for delete)")