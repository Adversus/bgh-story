//**************************************************************//
//        Global Vars
//**************************************************************//
/*global editor, $, jQuery*/
/*global box, line*/
/*global getElem*/
/*global Boxes:true, Lines:true, Labels:true, Sounds:true*/
/*global deleteBoxes, deleteLines, toolLine, incBoxName, incLineName, incLabelName, mDownTime, loadCounter, clipboard*/
/*global attachLabel, removeFromArr, showPopMenu, updateBox*/
window.Boxes = [];
window.Lines = [];
window.Labels = [];
window.Sounds = [];
window.deleteBoxes = [];
window.deleteLines = [];
window.toolLine = "";
window.incBoxName = -1;
window.incLineName = -1;
window.incLabelName = -1;
window.mDownTime = 0;
window.loadCounter = 0;
window.clipboard = "";

//**************************************************************//
//        Classes
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
    startData: '{"id":-1,"name":"New%20Story","pub":0,"objs":[' +
        '{"type":"B","a":-2,"b":"End","c":"(Ending%20message)","d":-1,"x":700,"y":210,"grad1":"#EEEEFF","grad2":"#00A3EF"},' +
        '{"type":"B","a":-1,"b":"Start","c":"(Starting%20message)","d":-1,"x":300,"y":210,"grad1":"#EEEEFF","grad2":"#00A3EF"},' +
        '{"type":"L","a":-3,"b":"(new%20choice)","c":"","d":-1,"b1":-1,"b2":-2}],"sounds":[]}',

    deserializeGraph: function (input) {
        if (input.length === 0) {return; }

        var ln = input.length,
            boxList = [],
            lineList = [],
            soundList = [],
            i = 0,
            newGraph = {},
            newBox = {},
            newLine = {};

        //** Clear the graph
        editor.clearGraph();

        //** Decode graph object and set basic vars
        newGraph = jQuery.parseJSON(input);
        editor.storyID = parseInt(newGraph.id, 10);
        editor.storyName = decodeURIComponent(newGraph.name);
        editor.storyPublic = parseInt(newGraph.pub, 10);

        //** Sort each graph object into arrays of boxes and lines
        for (i = 0; i < newGraph.objs.length; i++) {
            if (newGraph.objs[i].type === "B") {
                boxList.push(newGraph.objs[i]);
            } else if (newGraph.objs[i].type === "L") {
                lineList.push(newGraph.objs[i]);
            }
        }

        //** Add sounds to sound list
        for (i = 0; i < newGraph.sounds.length; i++) {
            soundList.push(newGraph.sounds[i]);
        }
        window.Sounds = soundList;

        //** Create boxes
        ln = boxList.length;
        for (i = 0; i < ln; i++) {
            newBox = box(0, 0, "");
            newBox.deserialize(boxList[i]);
            newBox.addToGraph();
            window.Boxes.push(newBox.name);
        }

        //** Create lines
        ln = lineList.length;
        for (i = 0; i < ln; i++) {
            newLine = line("", "");
            newLine.deserialize(lineList[i]);
            newLine.addToGraph();
            window.Lines.push(newLine.name);
        }

        //** Set public check value
        if (editor.storyPublic === 1) {
            $("#GraphPublic").prop('checked', true);
        } else {
            $("#GraphPublic").prop('checked', false);
        }

        //** Update displays
        getElem("GraphName").value = editor.storyName;
        window.fillSoundOptions('#selectSound');
        $('#cvsGraph').drawLayers();
    },

    serializeGraph: function () {
        var layers = $("#cvsGraph").getLayers(),
            graph = {},
            i = 0;

        //** Get public check value
        if ($("#GraphPublic").prop('checked')) {
            editor.storyPublic = 1;
        } else {
            editor.storyPublic = 0;
        }

        //** Create graph object to send
        graph = {
            id: editor.storyID,
            name: encodeURIComponent(editor.storyName),
            pub: editor.storyPublic,
            objs: []
        };

        //** Add all (important) objects to the string
        for (i = layers.length - 1; i > -1; i--) {
            if (layers[i].toCompact !== undefined) {
                graph.objs.push(layers[i].toCompact());
            }
        }
        return JSON.stringify(graph);
    },

    clearGraph: function () {
        var i = 0;

        //** Clear lines
        for (i = 0; i < Lines.length; i++) {
            $('#cvsGraph').removeLayer(Lines[i]);
        }
        Lines = [];

        //** Clear Boxes
        for (i = 0; i < Boxes.length; i++) {
            $('#cvsGraph').removeLayer(Boxes[i]);
        }
        Boxes = [];

        //** Clear Labels
        for (i = 0; i < Labels.length; i++) {
            $('#cvsGraph').removeLayer(Labels[i]);
        }
        Labels = [];

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
    drag: function (layer) {
        //** Drag event handler for dragging the screen
        $("#cvsGraph").translateCanvas({
            translateX: (layer.x - layer.lastX),
            translateY: (layer.y - layer.lastY)
        });
        layer.translateX += (layer.x - layer.lastX);
        layer.translateY += (layer.y - layer.lastY);
        layer.lastX = layer.x;
        layer.lastY = layer.y;
    },
    dragstop: function (layer) {
        //** Drag event handler for stopping screen drag
        layer.x = -(layer.translateX * 2);
        layer.y = -(layer.translateY * 2);
        layer.lastX = layer.x;
        layer.lastY = layer.y;
    }
};

//** Prototype of the class representing the boxes (pages) on the graph
window.box_proto = function(){
    this.mouseover = function (layer) {
        if (editor.color !== "") {
            $(this).animateLayer(layer, {
                fillStyle: editor.color
            }, 200);
        }
    };
    
    this.mouseout = function (layer) {
        $(this).animateLayer(layer, {
            fillStyle: "#EEEEEE"
        }, 200);
    };
    
    this.click = function (layer) {
        var lp = 0,
            obj = {};

        if (editor.tool === "Eraser") {
            for (lp = layer.back.length - 1; lp >= 0; lp--) {
                obj = $("#cvsGraph").getLayer(layer.back[lp]);
                if (obj !== undefined) { obj.destroy(); }
            }
            for (lp = layer.front.length - 1; lp >= 0; lp--) {
                obj = $("#cvsGraph").getLayer(layer.front[lp]);
                if (obj !== undefined) { obj.destroy(); }
            }
            $("#cvsGraph").removeLayer(layer.name);
            removeFromArr(Boxes, layer);
            if (layer.BoxID > -1) {
                //** Add to list of deleted boxes with valid IDs
                window.deleteBoxes.push(layer.BoxID);
            }
            if (layer.textLabel !== "") {
                obj = $("#cvsGraph").getLayer(layer.textLabel);
                $("#cvsGraph").removeLayer(layer.textLabel);
                removeFromArr(Labels, obj);
            }
            $("#cvsGraph").drawLayers();
        }
    };
    
    this.dblclick = function (layer) {
        if (editor.tool === "Move") {
            //** Handle open div
            window.updateColorPreview('#colorPreviewBox', layer.grad1, layer.grad2);
            window.fillSoundOptions('#edit_BoxSoundID', true);
            $("#edit_BoxSoundID option[value='" + layer.SoundID + "']").attr('selected', 'selected');
            showPopMenu("Box Editor - " + layer.text, layer.name, "edit_Box", updateBox);
        } else if (editor.tool === "CopyPaste") {
            window.clipboard = layer.clone();
            $("#statusBox").text("Copy / Paste (" + layer.title + ")");
        }
    };
    
    this.drag = function (layer) {
        var lp = 0,
            obj = {};

        //** Update attached line positions
        for (lp = 0; lp < layer.back.length; lp++) {
            obj = $("#cvsGraph").getLayer(layer.back[lp]);
            obj.x1 = layer.x - (layer.width / 2);
            obj.y1 = layer.y;
        }
        layer.recalcFront();
        //** Update label position
        if (layer.textLabel !== "") {
            obj = $("#cvsGraph").getLayer(layer.textLabel);
            obj.x = layer.x;
            obj.y = layer.y;
        }
    };
    
    this.recalcFront = function () {
        var lp = 0,
            obj = {};

        for (lp = 0; lp < this.front.length; lp++) {
            obj = $("#cvsGraph").getLayer(this.front[lp]);
            obj.x2 = this.x + (this.width / 2);
            obj.y2 = this.y;
        }
    };
    
    this.addToLayer = function () {
        var l = 0;

        $("#cvsGraph").drawRect(this);
        if (this.textLabel !== "") {
            for (l = 0; l < Labels.length; l++) {
                if (Labels[l].name === this.textLabel) {
                    $("#cvsGraph").drawText(Labels[l]);
                    break;
                }
            }
        }
    };
    
    this.addHooks = function () {
        if (!this.isStart) { window.LineHook(this, 'begin'); }
        if (!this.isEnd) { window.LineHook(this, 'end'); }
    };
    
    this.dropHooks = function () {
        if (this.beginHook !== "") {
            $("#cvsGraph").removeLayer(this.beginHook);
            this.beginHook = "";
        }
        if (this.endHook !== "") {
            $("#cvsGraph").removeLayer(this.endHook);
            this.endHook = "";
        }
    };
    
    this.addToGraph = function () {
        $("#cvsGraph").drawRect(this);
        $('canvas').moveLayer(this.name, 2);
        if (this.contentText !== "") {
            attachLabel(this.name);
        }
    };
    
    //** Attempt to set prototype
    this.prototype = window.box_proto_base;
    this.__proto__ = window.box_proto_base;
    
    /* IE7-10 Check */
    if (this.deserialize == undefined){
        //** Clone the base prototype's attributes
        for (var key in window.box_proto_base) {
            this[key] = window.box_proto_base[key];
        }
    }
};

//** Constructor for the class representing the boxes (pages) on the graph
window.box = function (xPos, yPos, newText, boxID) {
    var newStart = false;
    var newEnd = false;
    var newContent = "";
    var newID = 0;

    //** Retrieve ID
    if (boxID !== undefined) {
        newID = boxID;
    } else if (window.deleteBoxes.length > 0) {
        newID = window.deleteBoxes[window.deleteBoxes.length - 1];
        window.deleteBoxes.pop();
    } else {
        --incBoxName;
        newID = incBoxName;
    }

    //** Handle type
    if (newText === "Start") {
        newStart =  true;
        newContent = "(Starting message)";
    } else if (newText === "End") {
        newEnd = true;
        newContent = "(Completion message)";
    } else {
        newContent = "(new message)";
    }

    //** Create Object
    var newBox = new box_proto();
    
    //** Set attributes
    newBox.name = "box" + newID;
    newBox.objType = "box";
    newBox.BoxID = newID; //** Attribute
    newBox.layer = true;
    newBox.draggable = true;
    newBox.fillStyle = "#EEEEEE";
    newBox.strokeStyle = "#CCCCCC";
    newBox.x = xPos;
    newBox.y = yPos;
    newBox.width = 60;
    newBox.height = 40;
    newBox.cornerRadius = 8;
    newBox.front = [];
    newBox.back = [];
    newBox.contentText = newContent;    //** Attribute
    newBox.title = newText;    //** Attribute
    newBox.textLabel = "";
    newBox.beginHook = "";
    newBox.endHook = "";
    newBox.fromCenter = true;
    newBox.isStart = newStart;
    newBox.isEnd = newEnd;
    newBox.grad1 = "#EEEEFF";
    newBox.grad2 = "#00A3EF";
    newBox.SoundID = -1;
    return newBox;
};

//** Prototype of the class representing the lines (choices) on the graph
window.line_proto = function(){
    this.mouseover = function (layer) {
        if (editor.color !== "") {
            $(this).animateLayer(layer, {
                strokeStyle: editor.color
            }, 200);
        }
    };
    
    this.mouseout = function (layer) {
        $(this).animateLayer(layer, {
            strokeStyle: layer.baseColor
        }, 200);
    };
    
    this.click = function (layer) {
        if (editor.tool === "Eraser") {
            //** Eraser: Line
            if (layer.LineID > -1) { //** Add to list of deleted lines with valid IDs
                window.deleteLines.push(layer.LineID);
            }
            layer.destroy();
        }
    };
    
    this.dblclick = function (layer) {
        if (editor.tool === "Move") {
            //** Handle open div
            var title = "Line Editor - ";
            title += $("#cvsGraph").getLayer(layer.p1).text;
            title += " to ";
            title += $("#cvsGraph").getLayer(layer.p2).text;
            window.fillSoundOptions('#edit_ChoiceSoundID', true);
            $("#edit_ChoiceSoundID option[value='" + layer.SoundID + "']").attr('selected', 'selected');
            showPopMenu(title, layer.name, "edit_Line", updateLine);
        }
    };
    
    this.destroy = function () {
        //** Eraser: Line
        var obj1 = $("#cvsGraph").getLayer(this.p1);
        var obj2 = $("#cvsGraph").getLayer(this.p2);
        removeFromArr(obj1.front, this.name);
        removeFromArr(obj2.back, this.name);
        removeFromArr(Lines, this);
        $("#cvsGraph").removeLayer(this.name);
        obj1.recalcFront();
        $("#cvsGraph").drawLayers();
    };
    
    this.addToLayer = function () {
        $("#cvsGraph").drawLine(this);
    };
    
    this.addToGraph = function () {
        $("#cvsGraph").drawLine(this);
        $('canvas').moveLayer(this.name, 1);
    };
    
    //** Attempt to set prototype
    this.prototype = window.line_proto_base;
    this.__proto__ = window.line_proto_base;
    
    /* IE7-10 Check */
    if (this.deserialize == undefined){
        //** Clone the target prototype's attributes
        for (var key in window.line_proto_base) {
            this[key] = window.line_proto_base[key];
        }
    }
};

//** Constructor for the class representing the lines (choices) on the graph
window.line = function (name1, name2, lineID) {
    var obj1 = $("#cvsGraph").getLayer(name1);
    var obj2 = $("#cvsGraph").getLayer(name2);
    var newID = 0;

    //** Retrieve ID
    if (lineID !== undefined) {
        newID = lineID;
    } else if (window.deleteLines.length > 0) {
        newID = window.deleteLines[window.deleteLines.length - 1];
        window.deleteLines.pop();
    } else {
        --incLineName;
        newID = incLineName;
    }

    //** Create Object
    var newLine = new line_proto();
    newLine.name = "line" + newID;
    newLine.objType = "line";
    newLine.LineID = newID;  //** Attribute
    newLine.layer = true;
    newLine.draggable = false;
    newLine.strokeStyle = '#BBBBDD';
    newLine.strokeWidth = 5;
    newLine.baseColor = '#AAAACC';
    newLine.moveColor = '#8888AA';
    newLine.text = "";
    newLine.choice = "(new choice)";
    newLine.factText = "";
    newLine.SoundID = -1;

    //** Handle object 1
    if (obj1 !== undefined) {
        newLine.p1 = obj1.name;
        newLine.x2 = obj1.x;
        newLine.y2 = obj1.y;
        //** Adjust for box
        if (obj1.objType === "box") { newLine.x2 += (obj1.width / 2); }
        if (obj1.front !== undefined) {
            obj1.front.push(newLine.name);
        }
    } else {
        newLine.p1 = "";
        newLine.x2 = 0;
        newLine.y2 = 0;
    }

    //** Handle object 2
    if (obj2 !== undefined) {
        newLine.p2 = obj2.name;
        newLine.x1 = obj2.x;
        newLine.y1 = obj2.y;
        
        //** Adjust for box
        if (obj2.objType === "box") { newLine.x1 -= (obj2.width / 2); }
        if (obj2.back !== undefined) {
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
window.LineHook_proto = function(){
    this.serialize = function () {
        return "";
    };
    
    this.mouseover = function (layer) {
        $(this).animateLayer(layer, {
            fillStyle: "#FEFEFE",
            strokeStyle: "#BBBBBB"
        }, 200);
    };
    
    this.mouseout = function (layer) {
        $(this).animateLayer(layer, {
            fillStyle: "#EEEEEE",
            strokeStyle: "#9999AA"
        }, 200);
    };
    
    this.click = function (layer) {
        var newLine = {};

        //** Attach line
        if (layer.Side === "begin") {
            if (editor.dat2 === "") {
                if (toolLine === "") {
                    newLine = new line(layer, undefined);
                    Lines.push(newLine.name);
                    toolLine = newLine.name;
                    newLine.x2 = layer.x;
                    newLine.y2 = layer.y;
                    if (editor.dat1 === "") {
                        newLine.x1 = newLine.x2;
                        newLine.y1 = newLine.y2;
                    }
                    newLine.addToGraph();
                }
                editor.dat2 = layer.BoxName;
            }
        } else if (layer.Side === "end") {
            if (editor.dat1 === "") {
                if (toolLine === "") {
                    newLine = new line(layer, undefined);
                    Lines.push(newLine.name);
                    toolLine = newLine.name;
                    newLine.x1 = layer.x;
                    newLine.y1 = layer.y;
                    if (editor.dat2 === "") {
                        newLine.x2 = newLine.x1;
                        newLine.y2 = newLine.y1;
                    }
                    newLine.addToGraph();
                }
                editor.dat1 = layer.BoxName;
            }
        }
        //** Check if completed line
        if (editor.dat1 !== "" && editor.dat2 !== "") {
            $("#cvsGraph").removeLayer(toolLine);
            var point1 = $("#cvsGraph").getLayer(editor.dat1);
            var point2 = $("#cvsGraph").getLayer(editor.dat2);
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
    };
};

//** Class representing the circles on boxes that allow connecting lines
window.LineHook = function (obj, str) {
    var strName = "";
    var xOff = 0;
    if (str === "begin") {
        strName = "begin";
        xOff = -(obj.width/2);
    } else {
        strName = "end";
        xOff = (obj.width/2);
    }
    
    //** Create Object
    var newCircle = new LineHook_proto();
    
    //** Set attributes
    newCircle.name = obj.name + "_" + strName;
    newCircle.objType = "hook";
    newCircle.BoxName = obj.name;    //** Attribute
    newCircle.Side = strName;        //** Attribute
    newCircle.objTarget = obj.name;
    newCircle.layer = true;
    newCircle.fillStyle = "#EEEEEE";
    newCircle.strokeStyle = "#9999AA";
    newCircle.x = obj.x + xOff;
    newCircle.y = obj.y;
    newCircle.fromCenter = true;
    newCircle.width = 22;
    newCircle.height = 22;
    
    if (str === "begin") {
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
};

//**************************************************************//
//        Functions
//**************************************************************//
window.getElem = function (id) {return document.getElementById(id);};
window.clone = function (obj) {return JSON.parse(JSON.stringify(obj));};
window.attachLabel = function (objName) {
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
        updateText: function (newText) {
            this.text = newText;
        }
    };

    $("#cvsGraph").drawText( newLabel );
    window.Labels.push(newLabel.name);
};
window.disableDrag = function () {
    var layers = $('canvas').getLayers(),
        i = 0;
    for (;i<layers.length;i++) {
        if (layers[i].objType === "box") {
            layers[i].draggable = false;
        }
    }
};
window.enableDrag = function () {
    var layers = $('canvas').getLayers(),
        i = 0;
    for (;i<layers.length;i++) {
        if (layers[i].objType === "box") {
            layers[i].draggable = true;
        }
    }
};
window.setEditor = function (type, color) {
    var i = 0;

    // Update display
    if (editor.tool != type) {
        //** Clear old display
        if (editor.tool === "Line") {
            clearHooks();
        } else if (editor.tool === "Move") {
            disableDrag();
        }
        if (type === "CopyPaste") {
            if (window.clipboard !== "") {
                $("#statusBox").html($("#statusBox").html() + " (" + window.clipboard.title + ")");
            }
        }

        //** Update new display
        if (type === "Line") {
            var layers = $('canvas').getLayers();
            for (i = 0;i<layers.length;i++) {
                if (layers[i].objType === "box") {
                    layers[i].addHooks();
                }
            }
        } else if (editor.tool === "Move") {
            disableDrag();
        }
    }

    //** Set editor vars
    editor.tool = type;
    editor.data1 = "";
    editor.data2 = "";
    editor.color = color;
    $("#cvsGraph").drawLayers();
};
window.clearButtons = function (downBtn) {
    var upButton = $( ".btnDown" );
    upButton.removeClass("btnDown");
    upButton.addClass("btnUp");
    if (downBtn !== "" && downBtn !== undefined) {
        $( "#cursor"+downBtn ).removeClass("btnUp");
        $( "#cursor"+downBtn ).addClass("btnDown");
    }
};
window.clearHooks = function () {
    var layers = $('canvas').getLayers(),
        i = 0;
    for (i = 0;i<layers.length;i++) {
        if (layers[i].objType === "box") {
            layers[i].dropHooks();
        }
    }
};
window.removeFromArr = function (arr, obj) {
    var ind = arr.indexOf(obj);
    if (ind == -1 && typeof(obj) === "string") {
        ind = getIndByName(arr, obj);
    }
    if (ind !== -1) {
        arr.splice(ind, 1);
    }
};
window.getIndByName = function (arr, str) {
    var i = 0;
    for (i = 0;i<arr.length;i++) {
        if (arr[i].name == str) {
            return i;
        }
    }
    return -1;
};
window.showPopMenu = function (title, name, contentDiv, func) {
    var contentBox = getElem("editorContent");
    var moveObj = getElem(contentDiv);
    var hideBox = getElem("hideBox");
    var editObj = $("#cvsGraph").getLayer(name);
    var dAtt = "", dDis = "";

    //** Move all objects from the popup to the hidden box
    while (contentBox.childNodes.length) {
        var obj1 = contentBox.childNodes[0];
        contentBox.removeChild(obj1);
        hideBox.appendChild(obj1);
    }

    //** Clear content elements
    var children = moveObj.getElementsByTagName('*');
    for (var i = 0;i<children.length;i++) {
        var clearType = children[i].nodeName;
        if (children[i].nodeName === "INPUT") {
            dAtt = children[i].getAttribute("data-assign");
            dDis = children[i].getAttribute("data-disable");
            if (children[i].getAttribute("type") === "text") {
                children[i].value = "";
            }
            if (dAtt !== "") {
                children[i].value = editObj[dAtt];
            }
            if (children[i].value == dDis) {
                children[i].disabled = true;
            } else {
                children[i].disabled = false;
            }
        } else if (children[i].nodeName === "TEXTAREA") {
            dAtt = children[i].getAttribute("data-assign");
            dDis = children[i].getAttribute("data-disable");
            children[i].value = "";
            if (dAtt !== "") {
                children[i].value = editObj[dAtt];
            }
            if (children[i].value == dDis) {
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
        "link image media textcolor"
      ],
      menubar: "false",
      toolbar1: "bold italic underline | link image media | forecolor backcolor | undo redo",
      content_css : "tiny_mce_content.css",
      forced_root_block : false,
      force_br_newlines : true,
      force_p_newlines : false,
      height : "320",
      gecko_spellcheck: true,
      autoOpen: false,
      setup: function (editor) {
            editor.on('keyup', function (e) {  
                if (e.keyCode==27) { //** Escape key
                    window.hidePopMenu();
                }
            });
        }
    });

    $("#editorBack").show();
};
window.savePopMenu = function () {
    var moveObj = getElem(editor.saveDiv);
    var editObj = $("#cvsGraph").getLayer(editor.saveObj);
    var dDis = "", sVal = "";

    //** Update content elements
    var children = moveObj.getElementsByTagName('*');
    for (var i = 0;i<children.length;i++) {
        var clearType = children[i].nodeName;
        var dAtt = children[i].getAttribute("data-assign");
        if (dAtt !== "") {
            if (children[i].nodeName === "INPUT") {
                dDis = children[i].getAttribute("data-disable");
                sVal = "";
                if (children[i].getAttribute("type") === "text") {
                    sVal = children[i].value;
                }
                if (dDis !== sVal) {
                    editObj[dAtt] = children[i].value;
                }
            } else if (children[i].nodeName === "TEXTAREA") {
                dDis = children[i].getAttribute("data-disable");
                sVal = children[i].value;
                if (dDis !== sVal) {
                    editObj[dAtt] = children[i].value;
                    //** Check if it contains a youtube video
                    if (editObj[dAtt].indexOf('youtube.com/embed/') > -1) {
                        var pos = editObj[dAtt].indexOf('<iframe src="');
                        while (pos > -1) {
                            //** Youtube video found; force autoplay
                            var tmpStr = editObj[dAtt].substring(pos+13, editObj[dAtt].indexOf('"', pos+13));
                            if (tmpStr.indexOf("autoplay=1") == -1) {
                                //** Add autoplay
                                if (tmpStr.indexOf("?") == -1) {
                                    tmpStr += "?autoplay=1";
                                } else {
                                    tmpStr += "&autoplay=1";
                                }
                            }
                            pos = editObj[dAtt].indexOf('<iframe src="', pos+1);
                        }
                    }
                }
            } else if (children[i].nodeName === "SELECT") {
                //** Let jquery sort it out
                editObj[dAtt] = $("#" + children[i].id + "  option:selected").val();
            }
        }
    }

    editor.saveFunc(editor.saveObj);
};
window.hidePopMenu = function () {
    tinyMCE.remove('textarea');
    $("#editorBack").hide();
};
window.updateLine = function (LineID) {
    var line = $("#cvsGraph").getLayer(LineID);
    line.factText = getElem("edit_FactContent").value;
    if (line.factText === "") {
        line.baseColor = "#AAAACC";
        line.moveColor = "#8888AA";
    } else {
        line.baseColor = "#70DD70";
        line.moveColor = "#50BB50";
    }
    line.strokeStyle = line.baseColor;
    $("#cvsGraph").drawLayers();
};
window.getTextWidth = function (txt) {
    var totalLen = 0;
    for (var i = 0;i<txt.length;i++) {
        if (txt[i] === "W") {
            totalLen += 13.5;
        } else if (txt[i] === "M") {
            totalLen += 11;
        } else {
            totalLen += 9;
        }
    }
    return totalLen;
};
window.updateBox = function (objID) {
    var box = $("#cvsGraph").getLayer(objID);
    if (box.textLabel !== "") {
        var txt = $("#cvsGraph").getLayer(box.textLabel);
        var tmpWidth = getTextWidth(box.text) + 8;
        if (tmpWidth <= 60) { tmpWidth = 60; }
        if (txt.text != box.title) {
            txt.text = box.title;
        }
        if (tmpWidth != box.width) {
            box.width = tmpWidth;
            box.drag(box);
        } else if (tmpWidth <= 60) {
            box.width = 60;
        }
    }
    box.contentText = getElem("edit_BoxContent").value;
    $("#cvsGraph").drawLayers();
};
window.toolButtonHandler = function (e) {
    if ($("#" + e.currentTarget.id).hasClass("btnUp")) {
        clearButtons( $(this).data("tool") );
        enableDrag();
        $("#statusBox").html( $(this).data("desc") );
        setEditor( $(this).data("tool"), $(this).data("color"));
    }
};
window.updateMouseCoords = function (e) {
    var rect = getElem("cvsGraph").getBoundingClientRect();
    var pos = $( "#cvsGraph" ).getLayer('dragBox');
    editor.mouseX = e.clientX - rect.left - pos.translateX;
    editor.mouseY = e.clientY - rect.top - pos.translateY;
};
window.getBoxById = function (id) {
    var layers = $("#cvsGraph").getLayers();
    for (var b = 0;b<layers.length;b++) {
        if (layers[b].objType === "box") {
            if (layers[b].BoxID == id) {
                return layers[b];
            }
        }
    }
    return undefined;
};
window.updateColorPreview = function (id, clr1, clr2) {
    $(id).css({background: '#FFFFFF'})
    /* IE10 Consumer Preview */ 
    .css({background: '-ms-radial-gradient(center, circle farthest-corner, ' +
        clr1 + ' 0%, ' + clr2 + ' 100%)'})
    /* Mozilla Firefox */ 
    .css({background: '-moz-radial-gradient(center, circle farthest-corner, ' +
        clr1 + ' 0%, ' + clr2 + ' 100%)'})
    /* Opera */ 
    .css({background: '-o-radial-gradient(center, circle farthest-corner, ' +
        clr1 + ' 0%, ' + clr2 + ' 100%)'})
    /* Webkit (Safari/Chrome 10) */ 
    .css({'background': '-webkit-gradient(radial, center center, 0, center center, 506, color-stop(0, ' +
        clr1 + ' 0%, ' + clr2 + ' 100%)'})
    /* Webkit (Chrome 11+) */ 
    .css({'background': '-webkit-radial-gradient(center, circle farthest-corner, ' +
        clr1 + ' 0%, ' + clr2 + ' 100%)'})
    /* W3C Markup, IE10 Release Preview */ 
    .css({background: 'radial-gradient(circle farthest-corner at center, ' +
        clr1 + ' 0%, ' + clr2 + ' 100%)'});
};
window.showLoadLabel = function () {
    window.loadCounter++;
    $("#loadBox").show();
    $("#statusBox").hide();
};
window.hideLoadLabel = function () {
    window.loadCounter--;
    if (window.loadCounter < 0) {window.loadCounter = 0;}
    if (window.loadCounter === 0) {
        $("#loadBox").hide();
        $("#statusBox").show();
    }
};
window.fillSoundOptions = function (elemID, addEmpty) {
    var s = 0;
    $(elemID).find('option').remove().end();
    //** If no ID is given then return the string
    if (elemID !== "") {
        //** Add options to select
        if (addEmpty === true) {
            $(elemID).append('<option value="-1" data-url="">(No Sound Effect)</option>');
        }
        for (s = 0; s<window.Sounds.length; s++) {
            $(elemID).append('<option value="' + window.Sounds[s].id + '" data-url="' + window.Sounds[s].url + '">' + 
                window.Sounds[s].name + '</option>');
        }
    } else {
        //** Create and return string containing options
        var retStr = "";
        if (addEmpty === true) {
            retStr += '<option value="-1" data-url="">(No Sound Effect)</option>';
        }
        for (s = 0; s<window.Sounds.length; s++) {
            retStr += '<option value="' + window.Sounds[s].id + '" data-url="' + window.Sounds[s].url + '">' + 
                window.Sounds[s].name + '</option>';
        }
        return retStr;
    }
};

//**************************************************************//
//        Initializer
//**************************************************************//
$( document ).ready( function () {
    $("#cvsGraph").drawRect( dragBox );

    //** Canvas events **//
    $( "#cvsGraph" ).mousedown(function (e) {
        mDownTime = new Date().getTime();
    });
    $( "#cvsGraph" ).mouseup(function (e) {
        var mUpTime = new Date().getTime();
        if (mUpTime - mDownTime < 300) {
            if (editor.tool === "Box") {
                var pos = $( "#cvsGraph" ).getLayer('dragBox');
                var rect = getElem("cvsGraph").getBoundingClientRect();
                var newBox = new box((e.clientX - pos.translateX) - rect.left, (e.clientY - pos.translateY) - rect.top, "X");
                newBox.addToGraph();
                Boxes.push(newBox.name);
            }
        }
    });
    $( "#cvsGraph" ).mousemove(function (e) {
        updateMouseCoords(e);
        if ( toolLine !== "" ) {
            var pos = $( "#cvsGraph" ).getLayer('dragBox');

            if (toolLine !== "") {
                var tmpLine = $( "#cvsGraph" ).getLayer(toolLine);
                if (tmpLine.p1 === "") {
                    tmpLine.x1 = editor.mouseX;
                    tmpLine.y1 = editor.mouseY;
                    if (tmpLine.x1 < tmpLine.x2) {
                        tmpLine.x1 += 5;
                    } else {
                        tmpLine.x1 -= 5;
                    }
                } else {
                    tmpLine.x2 = editor.mouseX;
                    tmpLine.y2 = editor.mouseY;
                    if (tmpLine.x2 < tmpLine.x1) {
                        tmpLine.x2 += 5;
                    } else {
                        tmpLine.x2 -= 5;
                    }
                }
            }
        }
    });
    $( "#cvsGraph" ).dblclick(function (e) {
        if (editor.tool === "CopyPaste" && window.clipboard !== "") {
            var pos = $( "#cvsGraph" ).getLayer('dragBox');
            var rect = getElem("cvsGraph").getBoundingClientRect();
            var newBox = new box((e.clientX - pos.translateX) - rect.left, (e.clientY - pos.translateY) - rect.top, window.clipboard.title);
            newBox.contentText = window.clipboard.contentText;
            newBox.grad1 = window.clipboard.grad1;
            newBox.grad2 = window.clipboard.grad2;
            newBox.addToGraph();
            Boxes.push(newBox.name);
            window.clipboard = "";
            $("#statusBox").text("Copy / Paste");
        }
    });
    
    //** Popup events **//
    $("#editCancel").click(function (e) {
        window.hidePopMenu();
    });
    $("#editOk").click(function () {
        tinyMCE.triggerSave();
        tinyMCE.remove('textarea');
        savePopMenu();
        $("#editorBack").hide();
    });
    $(document).keyup(function (e) {
        var focusElem = "";
        if (e.keyCode == 27) {
            if ($("#editorBack").display !== "none") {
                 $('#editCancel').click();
            }
            if (editor.tool === "CopyPaste") {
                focusElem = document.activeElement.tagName.toLowerCase();
                if (focusElem !== "input" && focusElem !== "textarea") { //** Only if not typing
                    window.clipboard = "";
                    $("#statusBox").text("Copy / Paste");
                }
            }
        }
        if ( toolLine !== "" ) {
            $( "#cvsGraph" ).removeLayer(toolLine);
            toolLine = "";
            editor.dat1 = "";
            editor.dat2 = "";
            $("#cvsGraph").drawLayers();
        }
        
        //** Toggle editor output
        focusElem = document.activeElement.tagName.toLowerCase();
        if (focusElem != "input" && focusElem != "textarea") { //** Only if not typing
            var kCode = e.keyCode || e.which;
            if (kCode == 192 || kCode == 223) {
                $("#testDiv").toggle();
            }
        }
    });
    
    //** Attach toolbar button events **//
    $( ".btnUp" ).click(toolButtonHandler);
    $("#cursorCopyPaste").dblclick(function () {
        //** Clear clipboard on button double click
        window.clipboard = "";
        $("#statusBox").text("Copy / Paste");
    });
    
    //** Attach new button effect
    $( "#graphNew").click(function () {
        $('<div></div>').appendTo('body')
          .html('<div><h6>Are you sure you want to start a new story?</h6></div>')
          .dialog({
              modal: true, title: 'Confirm New Story', zIndex: 10000, autoOpen: true,
              width: 'auto', resizable: false,
              buttons: {
                  Yes: function () {
                      window.showLoadLabel();
                      editor.deserializeGraph(editor.startData);
                      $(this).dialog("close");
                      window.hideLoadLabel();
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
    $( "#graphSave").click(function () {
        var msg = '';
        var title = '';
        var yesFunc = '';
        if (editor.storyID != -1) {
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
                    window.showLoadLabel();
                    getElem("testDiv").innerHTML = editor.serializeGraph();

                      //** Send graph to server (save.php)
                      $.ajax({ url: 'save.php',
                             data: {graph: editor.serializeGraph},
                             type: 'post',
                             success: function (responseText) {
                                if (responseText !== "") {
                                    getElem("testDiv").innerHTML += "<br><br>" + responseText;
                                    editor.deserializeGraph(responseText);
                                } else {
                                    getElem("testDiv").innerHTML += "<br><br>No response received.";
                                }
                                window.hideLoadLabel();
                             },
                             error: function (responseText) {
                                window.hideLoadLabel();
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
    
    //** Color picker preview update events
    $("#edit_color1").change(function () {
        window.updateColorPreview('#colorPreviewBox', $("#edit_color1").val(), $("#edit_color2").val());
    });
    $("#edit_color2").change(function () {
        window.updateColorPreview('#colorPreviewBox', $("#edit_color1").val(), $("#edit_color2").val());
    });

    //** Load button event
    $( "#graphLoad").click(function () {
        window.showLoadLabel();
        $.ajax({ url: 'storylist.php',
                 data: '',
                 dataType: 'json',
                 type: 'post',
                 success: function (response) {
                    //** Build and display load menu
                    var liStr = "<select id='openList' size='5' style='width:360px;'>";

                    //** Create the list options
                    for (var i = 0; i < response.lst.length; i++) {
                        liStr += "<option value = " + response.lst[i][0] + ">[" +
                        response.lst[i][0] + "] " +
                        decodeURIComponent(response.lst[i][1]) + "</option>";
                    }
                    liStr += "</select>";

                    //** Display the load story menu
                    window.hideLoadLabel();
                    $('<div></div>').appendTo('body')
                      .html('<div>' + liStr + '</div>')
                      .dialog({
                          modal: true, title: 'Open Story', zIndex: 10000, autoOpen: true,
                          width: 'auto', resizable: false,
                          buttons: {
                              Open: function () {
                                  var gID = $( "#openList" ).val();
                                  if (gID > 0) {
                                      //** Get graph from server (load.php)
                                      window.showLoadLabel();
                                      $.ajax({ url: 'load.php',
                                             data: {id: gID},
                                             type: 'post',
                                             success: function (responseText) {
                                                getElem("testDiv").innerHTML = responseText;
                                                editor.deserializeGraph(responseText);
                                                window.hideLoadLabel();
                                             },
                                             error: function (responseText) {
                                                window.hideLoadLabel();
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
                 },
                 error: function (response) {
                    window.hideLoadLabel();
                 }
          });
    });
    
    //** Add sound event
    $("#soundAdd").click(function () {
        //** Display the add sound menu
        $('<div></div>').appendTo('body')
          .html('<div class="editContentDiv"><div class="label">Sound Name</div><input type="text" id="soundName" style="width:240px;"><br><div class="label">Sound URL</div><input type="text" id="soundURL" style="width:240px;"></div>')
          .dialog({
              modal: true, title: 'Add New Sound', zIndex: 10000, autoOpen: true,
              width: 'auto', resizable: false,
              buttons: {
                  Add: function () {
                      var soundObj = {
                          name: encodeURIComponent($("#soundName").val()),
                          url: encodeURIComponent($("#soundURL").val())};
                      $.ajax({ url: 'soundadd.php',
                             data: soundObj,
                             type: 'post',
                             success: function (responseText) {
                                getElem("testDiv").innerHTML = responseText;
                                var response = jQuery.parseJSON(responseText);
                                if (response.sounds.length > 0){
                                    //** Add sounds to sound list
                                    window.Sounds = [];
                                    for (i = 0; i < response.sounds.length; i++) {
                                        window.Sounds.push(response.sounds[i]);
                                    }
                                    window.fillSoundOptions('#selectSound');
                                }
                             },
                             error: function (responseText) {
                                getElem("testDiv").innerHTML = responseText;
                             }
                      });
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
    });
    
    //** Edit sound event
    $("#soundEdit").click(function () {
        //* Check if nothing is selected
        var sIndex = $('#selectSound').prop("selectedIndex");
        if (sIndex === -1 || sIndex === null) {
            return;
        }

        var sID = $( "#selectSound option:selected" ).val();
        var sName = $( "#selectSound option:selected" ).text();
        var sURL = $( "#selectSound option:selected" ).data("url");

        //** Display the add sound menu
        $('<div></div>').appendTo('body')
          .html('<div class="editContentDiv"><div class="label">Sound ID</div><input type="text" style="width:200px;" value="' + sID + '" disabled><br>' + 
                '<div class="label">Sound Name</div><input type="text" style="width:240px;" value="' + sName + '"><br>' +
                '<div class="label">Sound URL</div><input type="text" style="width:240px;" value="' + sURL + '"></div>')
          .dialog({
              modal: true, title: 'Edit Sound', zIndex: 10000, autoOpen: true,
              width: 'auto', resizable: false,
              buttons: {
                  Save: function () {
                      //** TODO: Verify data
                      //** TODO: Send to server
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
    });
    
    //** Delete sound event
    $("#soundDelete").click(function () {
        //* Check if nothing is selected
        var sIndex = $('#selectSound').prop("selectedIndex");
        if (sIndex == -1 || sIndex === null) {
            return;
        }

        var sName = $( "#selectSound option:selected" ).text();
        var sID = $( "#selectSound option:selected" ).val();

        $('<div></div>').appendTo('body')
          .html('<div><h6>Are you sure you want to delete ' + sName + '?</h6></div>')
          .dialog({
              modal: true, title: "Delete Sound", zIndex: 10000, autoOpen: true,
              width: 'auto', resizable: false,
              buttons: {
                  Yes: function () {
                      var soundObj = { sID: sID };
                      $.ajax({ url: 'sounddelete.php',
                             data: soundObj,
                             type: 'post',
                             success: function (responseText) {
                                getElem("testDiv").innerHTML = responseText;
                                var response = jQuery.parseJSON(responseText);
                                if (response.sounds.length > 0){
                                    //** Add sounds to sound list
                                    window.Sounds = [];
                                    for (i = 0; i < response.sounds.length; i++) {
                                        window.Sounds.push(response.sounds[i]);
                                    }
                                    window.fillSoundOptions('#selectSound');
                                }
                             },
                             error: function (responseText) {
                                getElem("testDiv").innerHTML = responseText;
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

    $("#cursorMove").click();

    //** Attach graph name hover events
    $("#GraphName").hover(
        function () { $(this).addClass("rlHover"); },
        function () { $(this).removeClass("rlHover"); }
    );
    $("#GraphName").change(function (e) {
        editor.storyName = e.currentTarget.value;
    });

    //** Update all layers
    editor.deserializeGraph(editor.startData);
    $("#cvsGraph").drawLayers();
});