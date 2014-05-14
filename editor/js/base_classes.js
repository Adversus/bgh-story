//**************************************************************//
//		Base Class Prototypes
//		Desc: 
//			  Base classes allow common methods to be shared
//			between the editor and viewer specific classes.
//		
//**************************************************************//
window.box_proto_base = {
	//* Box class prototype for all box objects *//
	/* -Classes extending this share serialize and deserialize methods */
	
	serialize: function(){
		/* Convert the box class vars into a single string and return it */
		return JSON.stringify(this.toCompact());
	},
	
	deserialize: function(str){
		var readObj = {};
		
		//** Handle strings and already decoded strings
		if (typeof str == "string"){
			readObj = jQuery.parseJSON(str);
		} else {
			readObj = str;
		}
		
		//** Set basic vars
		this.BoxID = parseInt(readObj.a);
		this.title = decodeURIComponent(readObj.b);
		this.contentText = decodeURIComponent(readObj.c);
		this.SoundID = readObj.d;
		this.x = parseInt(readObj.x);
		this.y = parseInt(readObj.y);
		this.grad1 = readObj.grad1;
		this.grad2 = readObj.grad2;
		
		//** Update Label (if one is attached)
		if (this.textLabel != ""){
			var obj = $("#cvsGraph").getLayer(this.textLabel);
			if (obj != undefined){
				obj.text = this.contentText;
				obj.x = this.x;
				obj.y = this.y;
			}
		}
		
		//** Catch start and end boxes by checking names
		if (this.title == "Start"){
			this.isStart = true;
		} else if (this.title == "End"){
			this.isEnd = true;
		}
		
		//** Update Label position
		if (this.textLabel != ""){
			var obj = $("#cvsGraph").getLayer(this.textLabel);
			obj.x = this.x;
			obj.y = this.y;
		}
	},
	
	clone: function(){
		var newClone = {};
		newClone.BoxID = -1;
		newClone.title = this.title;
		newClone.contentText = this.contentText;
		newClone.x = this.x;
		newClone.y = this.y;
		newClone.grad1 = this.grad1;
		newClone.grad2 = this.grad2;
		newClone.SoundID = this.SoundID;
		return newClone;
	},
	
	toCompact: function(){
		/* Convert this object into a compact one containing only the important vars */
		return {
			type: "B",
			a: this.BoxID,
			b: encodeURIComponent(this.title),
			c: encodeURIComponent(this.contentText),
			d: this.SoundID,
			x: this.x,
			y: this.y,
			grad1: this.grad1,
			grad2: this.grad2
		};
	}
}

window.line_proto_base = {
	/* Line class prototype for all line objects */
	/* -Classes extending this share serialize and deserialize methods */
	
	serialize: function(){
		/* Convert the line class vars into a single string and return it */
		return JSON.stringify(this.toCompact());
	},
	
	deserialize: function(str){
		var readObj = {};
		
		//** Handle strings and already decoded strings
		if (typeof str == "string"){
			readObj = jQuery.parseJSON(str);
		} else {
			readObj = str;
		}
		
		/* Convert a string into line class vars and apply it */
		var readState = 0;
		var readValue = "";
		var ln = str.length;
		var Box1 = "";
		var Box2 = "";
		
		//** Get the object from str and set values
		this.LineID = readObj.a;
		this.choice = decodeURIComponent(readObj.b);
		this.factText = decodeURIComponent(readObj.c);
		this.SoundID = decodeURIComponent(readObj.d);
		
		//** Get IDs for the two boxes
		Box1 = parseInt(readObj.b1);
		Box2 = parseInt(readObj.b2);
		
		//** Match Box1 and Box2 to box objects
		var layers = $("#cvsGraph").getLayers();
		if (Box1 != ""){
			var tmpBox = getBoxById(Box1);
			if (tmpBox != undefined){
				//** Set line end to box position
				this.p1 = tmpBox.name;
				this.x2 = tmpBox.x + (tmpBox.width/2);
				this.y2 = tmpBox.y;
				tmpBox.front.push(this.name);
			}
		}
		if (Box2 != ""){
			var tmpBox = getBoxById(Box2);
			if (tmpBox != undefined){
				//** Set line beginning to box position
				this.p2 = tmpBox.name;
				this.x1 = tmpBox.x - (tmpBox.width/2);
				this.y1 = tmpBox.y;
				tmpBox.back.push(this.name);
			}
		}
		
		//** Set line color to alt if a fact exists
		if (this.factText == ""){
			this.strokeStyle = this.baseColor = "#AAAACC";
			this.moveColor = "#8888AA";
		} else {
			this.strokeStyle = this.baseColor = "#70DD70";
			this.moveColor = "#50BB50";
		}
	},
	
	toCompact: function(){
		/* Convert this object into a compact one containing only the important vars */
		var obj1 = $("#cvsGraph").getLayer(this.p1);
		var obj2 = $("#cvsGraph").getLayer(this.p2);
		return {
			type: "L",
			a: this.LineID,
			b: encodeURIComponent(this.choice),
			c: encodeURIComponent(this.factText),
			d: this.SoundID,
			b1: obj1.BoxID,
			b2: obj2.BoxID
		};
	}
}