//**************************************************************//
//		Global Vars
//**************************************************************//
window.Boxes = [];
window.Lines = [];
window.Labels = [];
window.deleteBoxes = [];
window.deleteLines = [];
window.toolLine = "";
window.incBoxName = -1;
window.incLineName = -1;
window.incLabelName = -1;
window.mDownTime = 0;

//**************************************************************//
//		Classes
//**************************************************************//
window.editor = {
	saveURL: '',
	storyID: -1,
	storyName: '',
	storyPublic: 0,
	tool: "",
	dat1: "",
	dat2: "",
	color: "",
	saveObj: "",
	saveFunc: "",
	saveDiv: "",
	hoverColor: "#FFFFFF",
	mouseX: -1,
	mouseY: -1,
	startData: '{"id":-1,"name":"New%20Story","pub":0,"objs":[{"type":"B","a":-2,"b":"End","c":"(Ending%20message)","x":700,"y":210},{"type":"B","a":-1,"b":"Start","c":"(Starting%20message)","x":300,"y":210},{"type":"L","a":-3,"b":"(new%20choice)","c":"","b1":-1,"b2":-2}]}',
	
	deserializeGraph: function(input){
		var ln = input.length;
		var boxList = [];
		var lineList = [];
		var readState = 0;
		var readObj = "";
		
		if (ln == 0){return;}
		
		//** Clear the graph
		editor.clearGraph();
		
		//** Decode graph object and set basic vars
		var newGraph = jQuery.parseJSON(input);
		editor.storyID = parseInt(newGraph.id);
		editor.storyName = decodeURIComponent(newGraph.name);
		editor.storyPublic = parseInt(newGraph.pub);
		
		//** Sort each graph object into arrays of boxes and lines
		for (var o=0; o<newGraph.objs.length; o++){
			if (newGraph.objs[o].type == "B"){
				boxList.push(newGraph.objs[o]);
			} else if (newGraph.objs[o].type == "L"){
				lineList.push(newGraph.objs[o]);
			}
		}
		
		//** Create boxes
		ln = boxList.length;
		for (var b=0;b<ln;b++){
			var newBox = box(0, 0, "");
			newBox.deserialize(boxList[b]);
			newBox.addToGraph();
			window.Boxes.push(newBox.name);
		}
		
		//** Create lines
		ln = lineList.length;
		for (var l=0;l<ln;l++){
			var newLine = line("", "");
			newLine.deserialize(lineList[l]);
			newLine.addToGraph();
			window.Lines.push(newLine.name);
		}
		
		//** Update displays
		getElem("GraphName").value = editor.storyName;
		$('#cvsGraph').drawLayers();
	},
	
	serializeGraph: function(){
		var layers = $("#cvsGraph").getLayers();
		var graphObjs = [];
		
		
		//** Get public check value
		if ($("#GraphPublic").prop('checked')){
			editor.storyPublic = 1;
		} else {
			editor.storyPublic = 0;
		}
		
		//** Create graph object to send
		var graph = {
			id: editor.storyID,
			name: editor.storyName,
			pub: editor.storyPublic,
			objs: []
		};
		
		//** Add all (important) objects to the string
		for (var i=layers.length-1;i>-1;i--){
			if (layers[i].toCompact != undefined){
				graph.objs.push(layers[i].toCompact());
			}
		}
		return JSON.stringify(graph);
	},
	
	clearGraph: function(){
		//** Clear lines
		for (var l=0;l<Lines.length;l++){
			$('#cvsGraph').removeLayer(Lines[l]);
		}
		window.Lines = [];
		
		//** Clear Boxes
		for (var l=0;l<Boxes.length;l++){
			$('#cvsGraph').removeLayer(Boxes[l]);
		}
		window.Boxes = [];
		
		//** Clear Labels
		for (var l=0;l<Labels.length;l++){
			$('#cvsGraph').removeLayer(Labels[l]);
		}
		window.Labels = [];
		
		$('#cvsGraph').drawLayers();
	}
};

//** Class for creating a hidden box that allows the screen to be dragged
window.dragBox = {
	name: "dragBox",
	objType: "dragBox",
	layer: true,
	draggable: true,
	width: 1200,
	height: 800,
	fillStyle: "rgba(0, 0, 0, 0)",
	strokeStyle: "rgba(100, 100, 100, 0)",
	fromCenter: false,
	x: 0,
	y: 0,
	lastX: 0,
	lastY: 0,
	translateX: 0, //** Attribute
	translateY: 0, //** Attribute
	isStart: false,
	isEnd: false,
	drag: function(layer) {
		//** Drag event handler for dragging the screen
		$("#cvsGraph").translateCanvas({
		  translateX: (layer.x-layer.lastX), translateY: (layer.y-layer.lastY)
		});
		layer.translateX += (layer.x - layer.lastX);
		layer.translateY += (layer.y - layer.lastY);
		layer.lastX = layer.x;
		layer.lastY = layer.y;
	},
	dragstop: function(layer) {
		//** Drag event handler for stopping screen drag
		layer.x = -(layer.translateX * 2);
		layer.y = -(layer.translateY * 2);
		layer.lastX = layer.x;
		layer.lastY = layer.y;
	}
};

//** Prototype of the class representing the boxes (pages) on the graph
window.box_proto = {
	mouseover: function(layer) {
		if (editor.color != ""){
			$(this).animateLayer(layer, {
				fillStyle: editor.color
			}, 200);
		}
	},
	mouseout: function(layer) {
		$(this).animateLayer(layer, {
			fillStyle: "#EEEEEE"
		}, 200);
	},
	click: function(layer) {
		if (editor.tool == "Eraser"){
			if (1){//if (!layer.isEnd && !layer.isStart){
				for (var lp=layer.back.length-1; lp>=0; lp--){
					var obj = $("#cvsGraph").getLayer(layer.back[lp]);
					if (obj != undefined){ obj.destroy(); }
				}
				for (var lp=layer.front.length-1; lp>=0; lp--){
					var obj = $("#cvsGraph").getLayer(layer.front[lp]);
					if (obj != undefined){ obj.destroy(); }
				}
				$("#cvsGraph").removeLayer(layer.name);
				removeFromArr(Boxes, layer);
				if (layer.BoxID > -1){
					//** Add to list of deleted boxes with valid IDs
					window.deleteBoxes.push(layer.BoxID);
				}
				if (layer.textLabel != ""){
					var label = $("#cvsGraph").getLayer(layer.textLabel);
					$("#cvsGraph").removeLayer(layer.textLabel);
					removeFromArr(Labels, label);
				}
				$("#cvsGraph").drawLayers();
			}
		}
	},
	dblclick: function(layer) {
		if (editor.tool == "Move"){
			//** Handle open div
			showPopMenu("Box Editor - " + layer.text, layer.name, "edit_Box", updateBox);
		}
	},
	drag: function(layer) {
		//** Update attached line positions
		for (var lp=0;lp<layer.back.length;lp++){
			var obj = $("#cvsGraph").getLayer(layer.back[lp]);
			obj.x1 = layer.x - (layer.width/2);
			obj.y1 = layer.y;
		}
		layer.recalcFront();
		//** Update label position
		if (layer.textLabel != ""){
			var obj = $("#cvsGraph").getLayer(layer.textLabel);
			obj.x = layer.x;
			obj.y = layer.y;
		}
	},
	recalcFront: function(){
		for (var lp=0; lp<this.front.length; lp++){
			var obj = $("#cvsGraph").getLayer(this.front[lp]);
			obj.x2 = this.x + (this.width/2);
			obj.y2 = this.y;
		}
	},
	addToLayer: function(){
		$("#cvsGraph").drawRect( this );
		if (this.textLabel != ""){
			for (var l=0;l<Labels.length;l++){
				if (Labels[l].name == this.textLabel){
					$("#cvsGraph").drawText( Labels[l] );
					break;
				}
			}
		}
	},
	addHooks: function(){
		if (!this.isStart){ window.LineHook(this, 'begin'); }
		if (!this.isEnd){ window.LineHook(this, 'end'); }
	},
	dropHooks: function(){
		if ( this.beginHook != "" ){
			$("#cvsGraph").removeLayer(this.beginHook);
			this.beginHook = "";
		}
		if ( this.endHook != "" ){
			$("#cvsGraph").removeLayer(this.endHook);
			this.endHook = "";
		}
	}, 
	updateLabel: function(){
		if (layer.textLabel != ""){
			var obj = $("#cvsGraph").getLayer(layer.textLabel);
		}
	},
	addToGraph: function(){
		$("#cvsGraph").drawRect( this );
		$('canvas').moveLayer(this.name, 2);
		if (this.contentText != ""){
			attachLabel(this.name);
		}
	},
	prototype: window.box_proto_base,
	__proto__: window.box_proto_base
};

//** Constructor for the class representing the boxes (pages) on the graph
window.box = function(xPos, yPos, newText, boxID){
	var newStart = false;
	var newEnd = false;
	var newContent = "";
	var newID = 0;
	
	//** Retrieve ID
	if (boxID != undefined){
		newID = boxID;
	} else if (window.deleteBoxes.length > 0){
		newID = window.deleteBoxes[window.deleteBoxes.length-1];
		window.deleteBoxes.pop();
	} else {
		--incBoxName;
		newID = incBoxName;
	}
	
	//** Handle type
	if (newText == "Start"){
		newStart =  true;
		newContent = "(Starting message)";
	} else if (newText == "End"){
		newEnd = true;
		newContent = "(Completion message)";
	} else {
		newContent = "(new message)";
	}
	
	//** Create Object
	var newBox = {
		name: "box" + newID,
		objType: "box",
		BoxID: newID, //** Attribute
		layer: true,
		draggable: true,
		fillStyle: "#EEEEEE",
		strokeStyle: "#CCCCCC",
		x: xPos,
		y: yPos,
		width: 60,
		height: 40,
		cornerRadius: 8,
		front: [],
		back: [],
		contentText: newContent,	//** Attribute
		title: newText,	//** Attribute
		textLabel: "",
		beginHook: "",
		endHook: "",
		fromCenter: true,
		isStart: newStart,
		isEnd: newEnd,
		prototype: window.box_proto,
		__proto__: window.box_proto
	};
	return newBox;
};

//** Prototype of the class representing the lines (choices) on the graph
window.line_proto = {
	mouseover: function(layer) {
		if (editor.color != ""){
			$(this).animateLayer(layer, {
				strokeStyle: editor.color
			}, 200);
		}
	},
	mouseout: function(layer) {
		$(this).animateLayer(layer, {
			strokeStyle: layer.baseColor
		}, 200);
	},
	click: function(layer) {
		if (editor.tool == "Eraser"){
			//** Eraser: Line
			if (layer.LineID > -1){ //** Add to list of deleted lines with valid IDs
				window.deleteLines.push(layer.LineID);
			}
			layer.destroy();
		}
	},
	dblclick: function(layer) {
		if (editor.tool == "Move"){
			//** Handle open div
			var title = "Line Editor - ";
			title += $("#cvsGraph").getLayer(layer.p1).text;
			title += " to ";
			title += $("#cvsGraph").getLayer(layer.p2).text;
			showPopMenu(title, layer.name, "edit_Line", updateLine);
		}
	},
	destroy: function(){
		//** Eraser: Line
		var obj1 = $("#cvsGraph").getLayer(this.p1);
		var obj2 = $("#cvsGraph").getLayer(this.p2);
		removeFromArr(obj1.front, this.name);
		removeFromArr(obj2.back, this.name);
		removeFromArr(Lines, this);
		$("#cvsGraph").removeLayer(this.name);
		obj1.recalcFront();
		$("#cvsGraph").drawLayers();
	},
	addToLayer: function(){
		$("#cvsGraph").drawLine( this );
	},
	addToGraph: function(){
		$("#cvsGraph").drawLine( this );
		$('canvas').moveLayer(this.name, 1);
	},
	prototype: window.line_proto_base,
	__proto__: window.line_proto_base
};

//** Constructor for the class representing the lines (choices) on the graph
window.line = function(name1, name2, lineID){
	var obj1 = $("#cvsGraph").getLayer(name1);
	var obj2 = $("#cvsGraph").getLayer(name2);
	var newID = 0;
	
	//** Retrieve ID
	if (lineID != undefined){
		newID = lineID;
	} else if (window.deleteLines.length > 0){
		newID = window.deleteLines[window.deleteLines.length-1];
		window.deleteLines.pop();
	} else {
		--incLineName;
		newID = incLineName;
	}
	
	//** Create Object
	var newLine = {
		name: "line" + newID,
		objType: "line",
		LineID: newID,  //** Attribute
		layer: true,
		draggable: false,
		strokeStyle: '#BBBBDD',
		strokeWidth: 5,
		baseColor: '#AAAACC',
		moveColor: '#8888AA',
		text: "",
		choice: "(new choice)",
		factText: "",
		prototype: window.line_proto,
		__proto__: window.line_proto
	};
	
	//** Handle object 1
	if (obj1 != undefined){
		newLine.p1 = obj1.name;
		newLine.x2 = obj1.x;
		newLine.y2 = obj1.y;
		//** Adjust for box
		if (obj1.objType == "box"){ newLine.x2 += (obj1.width/2); }
		if (obj1.front != undefined){
			obj1.front.push(newLine.name);
		}
	} else {
		newLine.p1 = "";
		newLine.x2 = 0;
		newLine.y2 = 0;
	}
	
	//** Handle object 2
	if (obj2 != undefined){
		newLine.p2 = obj2.name;
		newLine.x1 = obj2.x;
		newLine.y1 = obj2.y;
		//** Adjust for box
		if (obj2.objType == "box"){ newLine.x1 -= (obj2.width/2); }
		if (obj2.back != undefined){
			obj2.back.push(newLine.name);
		}
	} else {
		newLine.p2 = "";
		newLine.x1 = 0;
		newLine.y1 = 0;
	}
	return newLine;
};

//** Prototype of the class representing the circles on boxes that allow connecting lines
window.LineHook_proto = {
	serialize: function(){
		return "";
	},
	mouseover: function(layer) {
		$(this).animateLayer(layer, {
			fillStyle: "#FEFEFE",
			strokeStyle: "#BBBBBB"
		}, 200);
	},
	mouseout: function(layer) {
		$(this).animateLayer(layer, {
			fillStyle: "#EEEEEE",
			strokeStyle: "#9999AA"
		}, 200);
	},
	click: function(layer) {
		//** Attach line
		if (layer.Side == "begin"){
			if (editor.dat2 == ""){
				if (toolLine == ""){
					var newLine = new line(layer, undefined);
					Lines.push(newLine.name);
					toolLine = newLine.name;
					newLine.x2 = layer.x;
					newLine.y2 = layer.y;
					if (editor.dat1 == ""){
						newLine.x1 = newLine.x2;
						newLine.y1 = newLine.y2;
					}
					newLine.addToGraph();
				}
				editor.dat2 = layer.BoxName;
			}
		} else if (layer.Side == "end"){
			if (editor.dat1 == ""){
				if (toolLine == ""){
					var newLine = new line(layer, undefined);
					Lines.push(newLine.name);
					toolLine = newLine.name;
					newLine.x1 = layer.x;
					newLine.y1 = layer.y;
					if (editor.dat2 == ""){
						newLine.x2 = newLine.x1;
						newLine.y2 = newLine.y1;
					}
					newLine.addToGraph();
				}
				editor.dat1 = layer.BoxName;
			}
		}
		//** Check if completed line
		if (editor.dat1 != "" && editor.dat2 != ""){
			$("#cvsGraph").removeLayer( toolLine );
			var point1 = $( "#cvsGraph" ).getLayer(editor.dat1);
			var point2 = $( "#cvsGraph" ).getLayer(editor.dat2);
			//var box1 = $( "#cvsGraph" ).getLayer( point1.objTarget );
			//var box2 = $( "#cvsGraph" ).getLayer( point2.objTarget );
			var newLine = new line(point1, point2);
			Lines.push( newLine.name );
			newLine.addToGraph();
			
			toolLine = "";
			editor.dat1 = "";
			editor.dat2 = "";
		}
		$("#cvsGraph").drawLayers();
	}
}

//** Class representing the circles on boxes that allow connecting lines
window.LineHook = function(obj, str){
	var strName = "";
	var xOff = 0;
	if (str == "begin"){
		strName = "begin";
		xOff = -(obj.width/2);
	} else {
		strName = "end";
		xOff = (obj.width/2);
	}
	var newCircle = {
		name: obj.name + "_" + strName,
		objType: "hook",
		BoxName: obj.name,	//** Attribute
		Side: strName, 		//** Attribute
		objTarget: obj.name,
		layer: true,
		fillStyle: "#EEEEEE",
		strokeStyle: "#9999AA",
		x: obj.x + xOff, y: obj.y,
		fromCenter: true,
		width: 22,
		height: 22,
		prototype: window.LineHook_proto,
		__proto__: window.LineHook_proto
	};
	if (str == "begin"){
		obj.beginHook = newCircle.name;
	} else {
		obj.endHook = newCircle.name;
	}
	$("#cvsGraph").drawEllipse( newCircle );
};
window.SplashScreen = {
	LogoURL: ""
};
window.Database = {
	URL: ""
}

//**************************************************************//
//		Functions
//**************************************************************//
window.getElem = function(id){return document.getElementById(id);}
window.clone = function(obj){return JSON.parse(JSON.stringify(obj));}
window.attachLabel = function(objName){
	++incLabelName;
	var obj = $("#cvsGraph").getLayer( objName );
	obj.textLabel = "label" + incLabelName;
	var newLabel = {
		name: "label" + incLabelName,
		objType: "label",
		layer: true,
		draggable: false,
		strokeStyle: '#999999',
		strokeWidth: 1,
		x: obj.x, 
		y: obj.y,
		fromCenter: true,
		fontSize: 12,
		fontFamily: 'Verdana, sans-serif',
		text: obj.title,
		updateText: function(newText){
			this.text = newText;
		}
	};
	
	$("#cvsGraph").drawText( newLabel );
	window.Labels.push(newLabel.name);
}
window.disableDrag = function(){
	var layers = $('canvas').getLayers();
	for (var i=0;i<layers.length;i++){
		if (layers[i].objType == "box"){
			layers[i].draggable = false;
		}
	}
}
window.enableDrag = function(){
	var layers = $('canvas').getLayers();
	for (var i=0;i<layers.length;i++){
		if (layers[i].objType == "box"){
			layers[i].draggable = true;
		}
	}
}
window.setEditor = function(type, color){
	// Update display
	if (editor.tool != type){
		//** Clear old display
		if (editor.tool == "Line"){
			clearHooks();
		} else if (editor.tool == "Move"){
			disableDrag();
		}
		
		//** Update new display
		if (type == "Line"){
			var layers = $('canvas').getLayers();
			for (var i=0;i<layers.length;i++){
				if (layers[i].objType == "box"){
					layers[i].addHooks();
				}
			}
		} else if (editor.tool == "Move"){
			disableDrag();
		}
	}
	
	//** Set editor vars
	editor.tool = type;
	editor.data1 = "";
	editor.data2 = "";
	editor.color = color;
	$("#cvsGraph").drawLayers();
}
window.clearButtons = function(downBtn){
	var upButton = $( ".btnDown" );
	upButton.removeClass("btnDown");
	upButton.addClass("btnUp");
	if (downBtn != "" && downBtn != undefined){
		$( "#cursor"+downBtn ).removeClass("btnUp");
		$( "#cursor"+downBtn ).addClass("btnDown");
	}
}
window.clearHooks = function(){
	var layers = $('canvas').getLayers();
	for (var i=0;i<layers.length;i++){
		if (layers[i].objType == "box"){
			layers[i].dropHooks();
		}
	}
}
window.removeFromArr = function(arr, obj){
	var ind = arr.indexOf(obj);
	if (ind == -1 && typeof(obj) == "string"){
		ind = getIndByName(arr, obj);
	}
	if (ind != -1){
		arr.splice(ind, 1);
	}
}
window.getIndByName = function(arr, str){
	for (var i=0;i<arr.length;i++){
		if (arr[i].name == str){
			return i;
		}
	}
	return -1;
}
window.showPopMenu = function(title, name, contentDiv, func){
	var contentBox = getElem("editorContent");
	var moveObj = getElem(contentDiv);
	var hideBox = getElem("hideBox");
	var editObj = $("#cvsGraph").getLayer(name);
	
	//** Move all objects from the popup to the hidden box
	while (contentBox.childNodes.length){
		var obj1 = contentBox.childNodes[0];
		contentBox.removeChild(obj1);
		hideBox.appendChild(obj1);
	}
	
	//** Clear content elements
	var children = moveObj.getElementsByTagName('*');
	for (var i=0;i<children.length;i++){
		var clearType = children[i].nodeName;
		if (children[i].nodeName == "INPUT"){
			var dAtt = children[i].getAttribute("data-assign");
			var dDis = children[i].getAttribute("data-disable");
			if (children[i].getAttribute("type") == "text"){
				children[i].value = "";
			}
			if (dAtt != ""){
				children[i].value = editObj[dAtt];
			}
			if (children[i].value == dDis){
				children[i].disabled = true;
			} else {
				children[i].disabled = false;
			}
		} else if (children[i].nodeName == "TEXTAREA"){
			var dAtt = children[i].getAttribute("data-assign");
			var dDis = children[i].getAttribute("data-disable");
			children[i].value = "";
			if (dAtt != ""){
				children[i].value = editObj[dAtt];
			}
			if (children[i].value == dDis){
				children[i].disabled = true;
			} else {
				children[i].disabled = false;
			}
		}
	}
	
	//** Move the target object
	moveObj.parentNode.removeChild(moveObj);
	contentBox.appendChild(moveObj);
	
	getElem("editorTitle").innerHTML = title;
	editor.saveObj = name;
	editor.saveFunc = func;
	editor.saveDiv = contentDiv;
	
	//** Advanced textarea plugin
	tinyMCE.init({
	  mode : "textareas",
	  theme : "modern",
	  plugins: [
		"link image"
	  ],
	  menubar: "false",
	  toolbar1: "link image",
	  content_css : "tiny_mce_content.css",
	  height : "320",
	  gecko_spellcheck: true,
	  autoOpen: false,
	  setup: function (editor) {
			editor.on('keyup', function (e) {  
				if (e.keyCode==27){ //** Escape key
					window.hidePopMenu();
				}
			});
		}
	});
	
	$("#editorBack").show();
}
window.savePopMenu = function(){
	var moveObj = getElem(editor.saveDiv);
	var editObj = $("#cvsGraph").getLayer(editor.saveObj);
	
	//** Update content elements
	var children = moveObj.getElementsByTagName('*');
	for (var i=0;i<children.length;i++){
		var clearType = children[i].nodeName;
		var dAtt = children[i].getAttribute("data-assign");
		if (dAtt != ""){
			if (children[i].nodeName == "INPUT"){
				var dDis = children[i].getAttribute("data-disable");
				var sVal = "";
				if (children[i].getAttribute("type") == "text"){
					sVal = children[i].value;
				}
				if (dDis != sVal){
					editObj[dAtt] = children[i].value;
				}
			} else if (children[i].nodeName == "TEXTAREA"){
				var dDis = children[i].getAttribute("data-disable");
				var sVal = children[i].value;
				if (dDis != sVal){
					editObj[dAtt] = children[i].value;
				}
			}
		}
	}
	
	editor.saveFunc(editor.saveObj);
}
window.hidePopMenu = function(){
	tinyMCE.remove('textarea');
	$("#editorBack").hide();
};
window.updateLine = function(LineID){
	var line = $("#cvsGraph").getLayer(LineID);
	line.factText = getElem("edit_FactContent").value;
	if (line.factText == ""){
		line.baseColor = "#AAAACC";
		line.moveColor = "#8888AA";
	} else {
		line.baseColor = "#70DD70";
		line.moveColor = "#50BB50";
	}
	line.strokeStyle = line.baseColor;
	$("#cvsGraph").drawLayers();
};
window.getTextWidth = function(txt){
	var totalLen = 0;
	for (var i=0;i<txt.length;i++){
		if (txt[i] == "W"){
			totalLen += 13.5;
		} else if (txt[i] == "M"){
			totalLen += 11;
		} else {
			totalLen += 9;
		}
	}
	return totalLen;
}
window.updateBox = function(objID){
	var box = $("#cvsGraph").getLayer(objID);
	if (box.textLabel != ""){
		var txt = $("#cvsGraph").getLayer(box.textLabel);
		var tmpWidth = getTextWidth(box.text) + 8;
		if (tmpWidth <= 60){ tmpWidth = 60; }
		if (txt.text != box.title){
			txt.text = box.title;
		}
		if (tmpWidth != box.width){
			box.width = tmpWidth;
			box.drag(box);
		} else if (tmpWidth <= 60){
			box.width = 60;
		}
	}
	box.contentText = getElem("edit_BoxContent").value;
	$("#cvsGraph").drawLayers();
}
window.toolButtonHandler = function(e){
	if ($("#" + e.currentTarget.id).hasClass("btnUp")){
		clearButtons( $(this).data("tool") );
		enableDrag();
		setEditor( $(this).data("tool"), $(this).data("color"));
		$("#statusBox").html( $(this).data("desc") );
	}
};
window.updateMouseCoords = function(e){
	var rect = getElem("cvsGraph").getBoundingClientRect();
	var pos = $( "#cvsGraph" ).getLayer('dragBox');
	editor.mouseX = e.clientX - rect.left - pos.translateX;
	editor.mouseY = e.clientY - rect.top - pos.translateY;
};
window.getBoxById = function(id){
	var layers = $("#cvsGraph").getLayers();
	for (var b=0;b<layers.length;b++){
		if (layers[b].objType == "box"){
			if (layers[b].BoxID == id){
				return layers[b];
			}
		}
	}
	return undefined;
}
window.parseStoryList = function(str){
	var storyList = [];
	var tmp_id = 0;
	var tmp_name = '';
	var ln = str.length;
	var readState = 0;
	var readValue = "";
	
	for (var ch=0; ch<ln; ch++){
		if (readState == 0){
			if (ch+2 >= ln){
				break; //** Not large enough to read
			}
			if (str[ch] == "{"){
				readState++;
				continue;
			}
		} else {
			if (str[ch] == "," && str[ch-1] != "\\"){
				if (readState == 1){
					tmp_id = parseInt(readValue);
				}
				readValue = "";
				readState++;
			} else if (readState == 2 && str[ch] == "}" && str[ch-1] != "\\"){
				tmp_name = readValue;
				//** Add object to array
				storyList.push({id: tmp_id, name: tmp_name});
				readValue = "";
				readState = 0;
			} else {
				readValue += str[ch];
			}
		}
	}
	
	return storyList;
};

//**************************************************************//
//		Initializer
//**************************************************************//
$( document ).ready( function(){
	$("#cvsGraph").drawRect( dragBox );
	
	//** Canvas events **//
	$( "#cvsGraph" ).mousedown(function(e){
		mDownTime = new Date().getTime();
	});
	$( "#cvsGraph" ).mouseup(function(e){
		var mUpTime = new Date().getTime();
		if (mUpTime - mDownTime < 300){
			if (editor.tool == "Box"){
				var pos = $( "#cvsGraph" ).getLayer('dragBox');
				var rect = getElem("cvsGraph").getBoundingClientRect();
				var newBox = new box((e.clientX - pos.translateX) - rect.left, (e.clientY - pos.translateY) - rect.top, "X");
				newBox.addToGraph();
				Boxes.push(newBox.name);
			}
		}
	});
	$( "#cvsGraph" ).mousemove(function(e) {
		updateMouseCoords(e);
		if ( toolLine != "" ){
			var pos = $( "#cvsGraph" ).getLayer('dragBox');
			
			if (toolLine != ""){
				var tmpLine = $( "#cvsGraph" ).getLayer(toolLine);
				if (tmpLine.p1 == ""){
					tmpLine.x1 = editor.mouseX;
					tmpLine.y1 = editor.mouseY;
					if (tmpLine.x1 < tmpLine.x2){
						tmpLine.x1 += 5;
					} else {
						tmpLine.x1 -= 5;
					}
				} else {
					tmpLine.x2 = editor.mouseX;
					tmpLine.y2 = editor.mouseY;
					if (tmpLine.x2 < tmpLine.x1){
						tmpLine.x2 += 5;
					} else {
						tmpLine.x2 -= 5;
					}
				}
			}
		}
	});
	
	//** Popup events **//
	$("#editCancel").click(function(e){
		window.hidePopMenu();
	});
	$("#editOk").click(function(){
		tinyMCE.triggerSave();
		tinyMCE.remove('textarea');
		savePopMenu();
		$("#editorBack").hide();
	});
	$(document).keyup(function(e) {
		if ($("#editorBack").display != "none"){
			if (e.keyCode == 27) { $('#editCancel').click(); }
		}
		if ( toolLine != "" ){
			$( "#cvsGraph" ).removeLayer(toolLine);
			toolLine = "";
			editor.dat1 = ""
			editor.dat2 = ""
			$("#cvsGraph").drawLayers();
		}
	});
	
	//** Attach toolbar button events **//
	$( ".btnUp" ).click(toolButtonHandler);
	
	//** Attach new button effect
	$( "#graphNew").click(function(){
		$('<div></div>').appendTo('body')
		  .html('<div><h6>Are you sure you want to start a new story?</h6></div>')
		  .dialog({
			  modal: true, title: 'Confirm New Story', zIndex: 10000, autoOpen: true,
			  width: 'auto', resizable: false,
			  buttons: {
				  Yes: function () {
					  editor.deserializeGraph(editor.startData);
					  $(this).dialog("close");
				  },
				  No: function () {
					  $(this).dialog("close");
				  }
			  },
			  close: function (event, ui) {
				  $(this).remove();
			  }
		});
	});
	
	//** Attach save button events
	$( "#graphSave").click(function(){
		var msg = '';
		var title = '';
		var yesFunc = '';
		if (editor.storyID != -1){
			msg = 'Are you sure you want so save over your old story?';
			title = 'Confirm Update Story';
		} else {
			msg = 'Are you sure you to keep this story?';
			title = 'Confirm Keep Story';
		}
		$('<div></div>').appendTo('body')
		  .html('<div><h6>' + msg + '</h6></div>')
		  .dialog({
			  modal: true, title: title, zIndex: 10000, autoOpen: true,
			  width: 'auto', resizable: false,
			  buttons: {
				  Yes: function () {
					getElem("testDiv").innerHTML = editor.serializeGraph();
					
					  //** Send graph to server (save.php)
					  $.ajax({ url: 'save.php',
							 data: {graph: editor.serializeGraph},
							 type: 'post',
							 success: function(responseText){
								getElem("testDiv").innerHTML += "<br><br>" + responseText;
								editor.deserializeGraph(responseText);
							 }
					  });
					  $(this).dialog("close");
				  },
				  No: function () {
					  $(this).dialog("close");
				  }
			  },
			  close: function (event, ui) {
				  $(this).remove();
			  }
		});
	});
	
	//** Load button event
	$( "#graphLoad").click(function(){
		$.ajax({ url: 'storylist.php',
				 data: '',
				 dataType: 'json',
				 type: 'post',
				 success: function(response){
					//** Build and display load menu
					var liStr = "<select id='openList' size='5' style='width:360px;'>";
					
					getElem("testDiv").innerHTML = response;
					//** Create the list options
					for (var i = 0; i < response["lst"].length; i++) {
						liStr += "<option value = " + response["lst"][i][0] + ">[" + response["lst"][i][0] + "] " + response["lst"][i][1] + "</option>";
					}
					liStr += "</select>";
					
					//** Display the load story menu
					$('<div></div>').appendTo('body')
					  .html('<div>' + liStr + '</div>')
					  .dialog({
						  modal: true, title: 'Open Story', zIndex: 10000, autoOpen: true,
						  width: 'auto', resizable: false,
						  buttons: {
							  Open: function () {
								  var gID = $( "#openList" ).val();
								  if (gID > 0){
									  //** Get graph from server (load.php)
									  $.ajax({ url: 'load.php',
											 data: {id: gID},
											 type: 'post',
											 success: function(responseText){
												getElem("testDiv").innerHTML = responseText;
												editor.deserializeGraph(responseText);
											 }
									  });
								  }
								  $(this).dialog("close");
							  },
							  Cancel: function () {
								  $(this).dialog("close");
							  }
						  },
						  close: function (event, ui) {
							  $(this).remove();
						  }
					});
				 }
		  });
	});
	
	$("#cursorMove").click();
	
	//** Attach graph name hover events
	$("#GraphName").hover(
		function() { $(this).addClass("rlHover"); },
		function() { $(this).removeClass("rlHover"); }
	);
	$("#GraphName").change(function(e){
		editor.storyName = e.currentTarget.value;
	});
	
	//** Update all layers
	editor.deserializeGraph(editor.startData);
	$("#cvsGraph").drawLayers();
});