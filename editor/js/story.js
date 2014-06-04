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
			window.Boxes.push(newBox.name);
		}
		
		//** Create lines
		ln = lineList.length;
		for (var l=0;l<ln;l++){
			var newLine = line("", "");
			newLine.deserialize(lineList[l]);
			window.Lines.push(newLine.name);
		}
	}
	
	//** Update content here
};

//**************************************************************//
//		Classes
//**************************************************************//

//** Box Constructor
window.box = function(){
	var newBox = {
		prototype: window.box_proto_base,
		__proto__: window.box_proto_base
	};
    
    /* IE7-10 Check */
    if (newBox.deserialize == undefined){
        //** Clone the target prototype's attributes
        for (var key in window.box_proto_base) {
            newBox[key] = window.box_proto_base[key];
        }
    }
	return newBox;
};

//** Line Constructor
window.line = function(){
	var newLine = {
		prototype: window.line_proto_base,
		__proto__: window.line_proto_base
	};
    
    /* IE7-10 Check */
    if (newLine.deserialize == undefined){
        //** Clone the target prototype's attributes
        for (var key in window.line_proto_base) {
            newLine[key] = window.line_proto_base[key];
        }
    }
	return newLine;
};

//**************************************************************//
//		Functions
//**************************************************************//
window.getElem = function (id) {return document.getElementById(id);};
window.clone = function (obj) {return JSON.parse(JSON.stringify(obj));};

window.loadPage = function(newURL){
	$("#loadScreen").show();
	
	$.ajax({ url: newURL,
			 type: 'post',
			 dataType: 'json',
			 success: function(response){
				window.storyData = response;
				window.updateDisplayFromData(window.storyData);
				$("#choiceScreen").fadeIn();
			 },
			 error: function(responseText){
			 }
	  });
}

window.updateColorGradient = function(id, clr1, clr2){
    var ua = window.navigator.userAgent;
    
    if (ua.indexOf("MSIE") !== -1){
        //* IE7-9 Fix */
        if (id == "body"){
            document.body.style.backgroundColor = clr2;
        }
        
        //* IE Version catch */
        var msInd = ua.indexOf("MSIE ");
        var vNum = parseInt(ua.substring(msInd + 5, ua.indexOf(".", msInd)));
        if (vNum < 10){ return; }
    }
    
    //** Modify css only for modern browsers
    $(id).css({background: clr2})
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

window.updateDisplayFromData = function(data){
	var i = 4;
	
	//** Set main text
	$("#storyText").html(decodeURIComponent(data.text));
	
	//** Hide unused buttons & dividers
	for (;i > data.choices.length-1;i--){
		$("#choice_" + i).hide();
		if (i < 4){
			$("#vr_" + i).hide();
		}
	}
	
	//** Update used buttons
	for (;i > -1;i--){
		$("#choice_" + i).text(decodeURIComponent(data.choices[i].Choice));
		$("#choice_" + i).show();
		$("#vr_" + i).show();
	}
	
	//** Update background
	if (data.grad1 != "" && data.grad1 != ""){
		window.updateColorGradient(".storybg_box", data.grad1, data.grad2);
	}
};

//**************************************************************//
//		Initializer
//**************************************************************//
$( document ).ready( function(){
	
	//** Set button event handler
	$( ".choice").click(function(e){
		window.choiceClicked = parseInt(e.currentTarget.getAttribute("data-choice"));
		window.choiceURL = storyData.choices[window.choiceClicked].Target;
		
		$("#choiceScreen").fadeOut(function(){
			if (storyData.choices[window.choiceClicked].Fact != ""){
				$("#factText").html(decodeURIComponent(storyData.choices[window.choiceClicked].Fact));
					$("#factScreen").fadeIn();
					return;
			}
			
			//** Load next page by default
			window.loadPage('storyupdate.php?b=' + window.choiceURL);
		});
	});
	
	//** Fact continue button handler
	$( "#btnContinue").click(function(e){
		$("#factScreen").fadeOut(function(){
			window.loadPage('storyupdate.php?b=' + window.choiceURL);
		});
	});
	
	if (storyData["text"] != undefined){
		window.updateDisplayFromData(storyData);
	}
	
	//** This stuff happens when the page loads
	$("#choiceScreen").fadeIn();
});