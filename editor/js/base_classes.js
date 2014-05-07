window.story_base = {
	addStorySlashes: function(str){
		var ln = str.length;
		var newString = "";
		
		for (var ch=0; ch<ln; ch++){
			if (str[ch] == "{" || str[ch] == "}" || str[ch] == "," || str[ch] == "\\"){
				newString += "\\";
			}
			newString += str[ch];
		}
		return newString;
	},
	dropStorySlashes: function(str){
		var ln = str.length;
		var newString = "";
		var hasSlashes = false;
		
		for (var ch=0; ch<ln; ch++){
			if (str[ch] == "\\"){
				//** Found slash
				if (hasSlashes == true){
					//** Second slash, add slash to string
					newString += str[ch];
					hasSlashes = false;
				} else {
					//** Keep track of this slash
					hasSlashes = true;
				}
			} else {
				//** Append character
				newString += str[ch];
				hasSlashes = false;
			}
		}
		return newString;
	}
};

window.box_proto_base = {
	serialize: function(){
		var str = "{B,";
		str += this.BoxID + ",";
		str += window.story.addStorySlashes(this.title) + ",";
		str += window.story.addStorySlashes(this.contentText) + ",";
		str += this.x + ",";
		str += this.y;
		str += "}";
		return str;
	},
	deserialize: function(str){
		var readState = 0;
		var readValue = "";
		var ln = str.length;
		
		for (var ch=0; ch<ln; ch++){
			if (readState == 0){
				if (ch+2>=ln){
					break; //** Not large enough to read
				}
				if (str[ch] == "{" && str[ch+1] == "B" && str[ch+2] == ","){
					ch+=2; //** Advance 2 + 1 from for loop
					readState++;
					continue;
				}
			} else {
				if (str[ch] == "," && str[ch-1] != "\\"){
					if (readState == 1){
						this.BoxID = parseInt(readValue);
					} else if (readState == 2){
						this.title = window.story.dropStorySlashes(readValue);
						if (this.title == "Start"){
							this.isStart = true;
						} else if (this.title == "End"){
							this.isEnd = true;
						}
					} else if (readState == 3){
						if (this.textLabel != ""){
							var obj = $("#cvsGraph").getLayer(this.textLabel);
							if (obj != undefined){
								obj.text = this.contentText;
								obj.x = this.x;
								obj.y = this.y;
							} else {
								this.contentText = window.story.dropStorySlashes(readValue);
							}
						} else {
							this.contentText = window.story.dropStorySlashes(readValue);
							//attachLabel(this.name);
						}
					} else if (readState == 4){
						this.x = parseInt(readValue);
					}
					readValue = "";
					readState++;
				} else if (readState == 5 && str[ch] == "}" && str[ch-1] != "\\"){
					this.y = parseInt(readValue);
					break;
				} else {
					readValue += str[ch];
				}
			}
		}
		
		//** Update Label position
		if (this.textLabel != ""){
			var obj = $("#cvsGraph").getLayer(this.textLabel);
			obj.x = this.x;
			obj.y = this.y;
		}
	}
}

window.line_proto_base = {
	serialize: function(){
		var obj1 = $("#cvsGraph").getLayer(this.p1);
		var obj2 = $("#cvsGraph").getLayer(this.p2);
		var str = "{L,";
		str += this.LineID + ",";
		str += window.story.addStorySlashes(this.choice) + ",";
		str += window.story.addStorySlashes(this.factText) + ",";
		str += obj1.BoxID + ",";
		str += obj2.BoxID;
		str += "}";
		return str;
	},
	deserialize: function(str){
		var readState = 0;
		var readValue = "";
		var ln = str.length;
		var Box1 = "";
		var Box2 = "";
		
		for (var ch=0; ch<ln; ch++){
			if (readState == 0){
				if (ch+2 >= ln){
					break; //** Not large enough to read
				}
				if (str[ch] == "{" && str[ch+1] == "L" && str[ch+2] == ","){
					ch+=2; //** Advance 2 + 1 from for loop
					readState++;
					continue;
				}
			} else {
				if (str[ch] == "," && str[ch-1] != "\\"){
					if (readState == 1){
						this.LineID = parseInt(readValue);
					} else if (readState == 2){
						this.Choice = window.story.dropStorySlashes(readValue);
					} else if (readState == 3){
						this.Fact = window.story.dropStorySlashes(readValue);
					} else if (readState == 4){
						Box1 = parseInt(readValue);
					}
					readValue = "";
					readState++;
				} else if (readState == 5 && str[ch] == "}" && str[ch-1] != "\\"){
					Box2 = parseInt(readValue);
					break;
				} else {
					readValue += str[ch];
				}
			}
		}
		
		//** Match Box1 and Box2 to box objects
		var layers = $("#cvsGraph").getLayers();
		if (Box1 != ""){
			var tmpBox = getBoxById(Box1);
			if (tmpBox != undefined){
				this.p1 = tmpBox.name;
				this.x2 = tmpBox.x + (tmpBox.width/2);
				this.y2 = tmpBox.y;
				tmpBox.front.push(this.name);
			}
		}
		if (Box2 != ""){
			var tmpBox = getBoxById(Box2);
			if (tmpBox != undefined){
				this.p2 = tmpBox.name;
				this.x1 = tmpBox.x - (tmpBox.width/2);
				this.y1 = tmpBox.y;
				tmpBox.back.push(this.name);
			}
		}
		
		var blah = 1;
	}
}