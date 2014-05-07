//**************************************************************//
//		Global Vars
//**************************************************************//
window.story = {
	deserializeGraph: function(input){
		var ln = input.length;
		var boxList = [];
		var lineList = [];
		var readState = 0;
		var readObj = "";
		
		//** Clear the graph
		editor.clearGraph();
		
		//** Split full string into strings representing each object
		for (var ch=0; ch<ln; ch++){
			if (readState == 0){
				if (input[ch] == "," && ((ch == 0) || (input[ch-1] != "\\"))){
					readState++;
					editor.graphID = parseInt(readObj);
					readObj = '';
				} else {
					readObj += input[ch];
				}
			} else if (readState == 1){
				if (input[ch] == "{" && ((ch == 0) || (input[ch-1] != "\\"))){
					readState++;
					editor.graphName = readObj;
					getElem('GraphName').value = editor.graphName;
					readObj = '';
				} else {
					readObj += input[ch];
				}
			}
			if (readState == 2){
				if (input[ch] == "{" && ((ch == 0) || (input[ch-1] != "\\"))){
					readState++;
					readObj = input[ch];
				}
			} else if (readState == 3){
				readObj += input[ch];
				if (input[ch] == "}"){
					if (ch > 0 && (input[ch-1] != "\\")){
						//** End of object
						if (readObj[1] == "B"){
							boxList.push(readObj);
						} else if (readObj[1] == "L"){
							lineList.push(readObj);
						}
						readState = 2;
						readObj = "";
					}
				}
			}
		}
		
		//** Create boxes
		ln = boxList.length;
		for (var b=0;b<ln;b++){
			var objName = box(0,0,"");
			window.Boxes.push(objName);
			var tmpObj = $("#cvsGraph").getLayer(objName);
			tmpObj.deserialize(boxList[b]);
		}
		
		//** Create lines
		ln = lineList.length;
		for (var l=0;l<ln;l++){
			var objName = line();
			window.Lines.push(objName);
			var tmpObj = $("#cvsGraph").getLayer(objName);
			tmpObj.deserialize(lineList[l]);
		}
		
		//Update content here
	}
};

//**************************************************************//
//		Classes
//**************************************************************//
window.box_proto = {
	prototype: window.box_proto_base,
	__proto__: window.box_proto_base
};

//** Box Constructor
window.box = function(){
	var newBox = {
		prototype: window.box_proto,
		__proto__: window.box_proto
	};
	return newBox;
};

window.line_proto = {
	prototype: window.line_proto_base,
	__proto__: window.line_proto_base
};

//** Line Constructor
window.line = function(){
	var newLine = {
		prototype: window.line_proto,
		__proto__: window.line_proto
	};
	return newLine;
};

window.loadPage = function(newURL){
	$("#loadScreen").show();
	setTimeout(function(){document.location.href = newURL}, 500);
}

//**************************************************************//
//		Initializer
//**************************************************************//
$( document ).ready( function(){
	
	//** Set button event handler
	$( ".choice").click(function(e){
		window.choiceClicked = parseInt(e.currentTarget.getAttribute("data-choice"));
		window.choiceURL = e.currentTarget.getAttribute("data-url");
		
		$("#choiceScreen").fadeOut(function(){
			if (window.choiceClicked == 1){
				if (choice1_Fact != ""){
					$("#factText").html(choice1_Fact);
					$("#factScreen").fadeIn();
					return;
				}
			} else if (window.choiceClicked == 2){
				if (choice2_Fact != ""){
					$("#factText").html(choice2_Fact);
					$("#factScreen").fadeIn();
					return;
				}
			} else if (window.choiceClicked == 3){
				if (choice3_Fact != ""){
					$("#factText").html(choice3_Fact);
					$("#factScreen").fadeIn();
					return;
				}
			} else if (window.choiceClicked == 4){
				if (choice4_Fact != ""){
					$("#factText").html(choice4_Fact);
					$("#factScreen").fadeIn();
					return;
				}
			}
			//** Load next page by default
			window.loadPage('index.php?p=' + window.choiceURL);
		});
	});
	
	//** Fact continue button handler
	$( "#btnContinue").click(function(e){
		$("#factScreen").fadeOut(function(){
			window.loadPage('index.php?p=' + window.choiceURL);
		});
	});
	
	//** This stuff happens when the page loads
	$("#choiceScreen").fadeIn();
});