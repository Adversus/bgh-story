<?PHP
//************************ Setup ************************//
//** Import database config
if (!isset($pagePrefix)){
	$pagePrefix = '';
}
include($pagePrefix . "config.php");

$db = NULL;
$story_id = 0;
$story_name = "(New Graph)";
$story_public = 0;
$story_boxes = array();
$story_choices = array();
$delete_boxes = array();
$delete_choices = array();

//** Initial connection
try {
  global $db_host, $db_name, $db_user, $db_pass;
  $dsn = "mysql:host=$db_host;dbname=$db_name";
  $db  = new PDO($dsn, $db_user, $db_pass);

  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch(PDOException $e) {
  echo "An error occured while connecting to the database.\n";
  echo $e->getMessage() . "\n";
}

//************************ Classes ************************//

class box {
	var $ID = -1;
	var $StoryID = -1;
	var $Title = "";
	var $Text = "";
	var $x = 0;
	var $y = 0;
	
	public function __construct($str = "") {
		if ($str != ""){
			$this->deserialize($str);
		}
	}
	public function setup($row){
		$this->ID = $row['id'];
		$this->StoryID = $row['story_id'];
		$this->Title = $row['title'];
		$this->Text = $row['text'];
		$this->x = $row['x'];
		$this->y = $row['y'];
	}
	public function serialize(){
		$str = "{B,";
		$str .= $this->ID . ",";
		$str .= addStorySlashes($this->Title) . ",";
		$str .= addStorySlashes($this->Text) . ",";
		$str .= $this->x . ",";
		$str .= $this->y;
		$str .= "}";
		return $str;
	}
	public function deserialize($str){
		$readState = 0;
		$readValue = "";
		$ln = strlen($str);
		
		for ($c=0; $c<$ln; $c++){
			if ($readState == 0){
				if ($c+2>=$ln){
					break; //** Not large enough to read
				}
				if ($str[$c] == "{" && $str[$c+1] == "B" && $str[$c+2] == ","){
					$c+=2; //** Advance 2 + 1 from for loop
					$readState++;
					continue;
				}
			} else {
				if ($str[$c] == "," && $str[$c-1] != "\\"){
					if ($readState == 1){
						$this->ID = intval($readValue);
					} else if ($readState == 2){
						$this->Title = dropStorySlashes($readValue);
					} else if ($readState == 3){
						$this->Text = dropStorySlashes($readValue);
					} else if ($readState == 4){
						$this->x = intval($readValue);
					}
					$readValue = "";
					$readState++;
				} else if ($readState == 5 && $str[$c] == "}" && $str[$c-1] != "\\"){
					$this->y = intval($readValue);
					break;
				} else {
					$readValue .= $str[$c];
				}
			}
		}
	}
	public function saveToDB(){
		global $db, $story_choices;
		$isValid = false;
		
		//** Check if this exists
		if ($this->ID > 0){
			$isValid = isValidElement($this->ID, 'boxes');
		}
		
		//** Add content to db
		if (!$isValid){
			//** Insert into db because it doesn't exist
			$stmt = $db->prepare("INSERT INTO boxes ( story_id, title, text, x, y ) VALUES (?, ?, ?, ?, ?)");
			$stmt->execute(array($this->StoryID, $this->Title, $this->Text, $this->x, $this->y));
			
			$lastID = $this->ID;
			$this->ID = $db->lastInsertId();
			foreach ($story_choices as $obj){
				if ($obj->Box1 == $lastID){
					$obj->Box1 = $this->ID;
				}
				if ($obj->Box2 == $lastID){
					$obj->Box2 = $this->ID;
				}
			}
		} else {
			//** Update preexisting database entry
			$stmt = $db->prepare("UPDATE boxes SET title = ?, text=?, x=?, y=? WHERE id=?");
			$stmt->execute(array($this->Title, $this->Text, $this->x, $this->y, $this->ID));
		}
	}
}

class choice {
	var $ID = -1;
	var $StoryID = -1;
	var $Choice = "";
	var $Fact = "";
	var $Box1 = -1;
	var $Box2 = -1;
	public function __construct($str = "") {
		if ($str != ""){
			$this->deserialize($str);
		}
	}
	public function setup($row){
		$this->ID = $row['id'];
		$this->StoryID = $row['story_id'];
		$this->Choice = $row['choice'];
		$this->Fact = $row['fact'];
		$this->Box1 = $row['box1_id'];
		$this->Box2 = $row['box2_id'];
	}
	public function serialize(){
		$str = "{L,";
		$str .= $this->ID . ",";
		$str .= addStorySlashes($this->Choice) . ",";
		$str .= addStorySlashes($this->Fact) . ",";
		$str .= $this->Box1 . ",";
		$str .= $this->Box2;
		$str .= "}";
		return $str;
	}
	public function deserialize($str){
		$readState = 0;
		$readValue = "";
		$ln = strlen($str);
		
		for ($c=0; $c<$ln; $c++){
			if ($readState == 0){
				if ($c+2>=$ln){
					break; //** Not large enough to read
				}
				if ($str[$c] == "{" && $str[$c+1] == "L" && $str[$c+2] == ","){
					$c+=2; //** Advance 2 + 1 from for loop
					$readState++;
					continue;
				}
			} else {
				if ($str[$c] == "," && $str[$c-1] != "\\"){
					if ($readState == 1){
						$this->ID = intval($readValue);
					} else if ($readState == 2){
						$this->Choice = dropStorySlashes($readValue);
					} else if ($readState == 3){
						$this->Fact = dropStorySlashes($readValue);
					} else if ($readState == 4){
						$this->Box1 = intval($readValue);
					}
					$readValue = "";
					$readState++;
				} else if ($readState == 5 && $str[$c] == "}" && $str[$c-1] != "\\"){
					$this->Box2 = intval($readValue);
					break;
				} else {
					$readValue .= $str[$c];
				}
			}
		}
	}
	public function saveToDB(){
		global $db;
		$isValid = false;
		
		//** Check if this exists
		if ($this->ID > 0){
			$isValid = isValidElement($this->ID, 'choices');
		}
		
		//** Add content to db
		if (!$isValid){
			//** Insert into db because it doesn't exist
			$stmt = $db->prepare("INSERT INTO choices ( story_id, choice, fact, box1_id, box2_id ) VALUES (?, ?, ?, ?, ?)");
			$stmt->execute(array($this->StoryID, $this->Choice, $this->Fact, $this->Box1, $this->Box2));
			$this->ID = $db->lastInsertId();
		} else {
			//** Update preexisting database entry
			$stmt = $db->prepare("UPDATE choices SET choice = ?, fact=?, box1_id=?, box2_id=? WHERE id=?");
			$stmt->execute(array($this->Choice, $this->Fact, $this->Box1, $this->Box2, $this->ID));
		}
	}
}

//************************ Utility Methods ************************//

function loadStory($sID){
	//** Retrieve all boxes and choices for the story
	global $db;
	global $story_id;
	global $story_name;
	global $story_public;
	global $story_boxes;
	global $story_choices;
	
	$story_id = $sID;
	
	//** Retrieve story
	$stmt = $db->prepare('SELECT * FROM stories WHERE id = ? LIMIT 1');
	$stmt->execute(array($story_id));
	$story = $stmt->fetchAll(PDO::FETCH_ASSOC);
	$story_name = $story[0]['story_name'];
	$story_public = $story[0]['is_public'];
	
	//** Retrieve boxes
	$stmt1 = $db->prepare("SELECT * FROM boxes WHERE story_id=?");
	$stmt1->execute(array($story_id));
	$result = $stmt1->fetchAll(PDO::FETCH_ASSOC);
	empty($story_boxes);
	foreach ($result as $row){
		//** Create new instances of the box class for every box in the story
		$newBox = new box;
		$newBox->setup($row);
		array_push($story_boxes, $newBox);
	}
	
	
	//** Retrieve choices
	$stmt2 = $db->prepare("SELECT * FROM choices WHERE story_id=?");
	$stmt2->execute(array($story_id));
	$result = $stmt2->fetchAll(PDO::FETCH_ASSOC);
	empty($story_choices);
	foreach ($result as $row){
		//** Create new instances of the choice class for every choice in the story
		$newChoice = new choice;
		$newChoice->setup($row);
		array_push($story_choices, $newChoice);
	}
}

function saveStory(){
	global $db;
	global $story_id;
	global $story_name;
	global $story_public;
	global $story_boxes;
	global $story_choices;
	
	if ($story_id < 0){
		//** Create new story in db
		$stmt = $db->prepare("INSERT INTO stories (story_name, is_public) VALUES (?, ?)");
		$result = $stmt->execute(array(addStorySlashes($story_name), $story_public));
		$story_id = $db->lastInsertId();
		
		//** Update object story_ids
		foreach ($story_boxes as $obj){
			$obj->StoryID = $story_id;
		}
		foreach ($story_choices as $obj){
			$obj->StoryID = $story_id;
		}
	} else {
		$stmt = $db->prepare("UPDATE stories SET story_name = ?, is_public = ? WHERE id = ?");
		$stmt->execute(array(addStorySlashes($story_name), $story_public, $story_id));
	}
	
	foreach ($story_boxes as $obj){
		$obj->saveToDB();
	}
	foreach ($story_choices as $obj){
		$obj->saveToDB();
	}
	
	//** Clean up deleted boxes
	$delBoxes = array();
	foreach ($story_boxes as $obj){
		array_push($delBoxes, $obj->ID);
	}
	$vals = implode(',', array_fill(0, count($delBoxes), '?')); //** Borrowed form stack overflow
	$stmt = $db->prepare("DELETE FROM boxes WHERE id NOT IN ( " . $vals . " )");
	$stmt->execute($delBoxes);
	
	//** Clean up deleted choices
	$delChoices = array();
	foreach ($story_choices as $obj){
		array_push($delChoices, $obj->ID);
	}
	$vals = implode(',', array_fill(0, count($delChoices), '?')); //** Borrowed form stack overflow
	$stmt = $db->prepare("DELETE FROM choices WHERE id NOT IN ( " . $vals . " )");
	$stmt->execute($delChoices);
}

function loadFirstPage($story_id){
	global $db;
	
	//loadPage($pageID);
}

function loadPage($id, $isStart = false){
	//** Variant on loadStory that retrieves a single page and its choices
	global $db;
	global $story_boxes;
	global $story_choices;
	
	//** Retrieve boxes
	if (!$isStart){
		$stmt1 = $db->prepare("SELECT * FROM boxes WHERE id=?");
	} else {
		$stmt1 = $db->prepare("SELECT * FROM boxes WHERE story_id=? AND title='Start'");
	}
	$stmt1->execute(array($id));
	$result = $stmt1->fetchAll(PDO::FETCH_ASSOC);
	empty($story_boxes);
	foreach ($result as $row){
		//** Create new instances of the box class for every box in the story
		$newBox = new box;
		$newBox->setup($row);
		array_push($story_boxes, $newBox);
	}
	$id = $story_boxes[0]->ID;
	
	//** Retrieve choices
	$stmt2 = $db->prepare("SELECT * FROM choices WHERE box1_id=?");
	$stmt2->execute(array($id));
	$result = $stmt2->fetchAll(PDO::FETCH_ASSOC);
	empty($story_choices);
	foreach ($result as $row){
		//** Create new instances of the choice class for every choice in the story
		$newChoice = new choice;
		$newChoice->setup($row);
		array_push($story_choices, $newChoice);
	}
}

function isValidElement($id, $table) { //** Adapted from isValidStory (database.php:226)
  global $db;

  $stmt = $db->prepare("SELECT COUNT(*) FROM " . $table . " WHERE id = ?");
  $stmt->execute(array($id));

  $results = $stmt->fetch(PDO::FETCH_ASSOC);
  return $results;
}

function deleteBoxList($str){
	$readState = 0;
	$readValue = "";
	$ln = strlen($str);
	$boxList = array();
	
	//** Parse string object
	for ($c=0; $c<$ln; $c++){
		if ($readState == 0){
			if ($c+2>=$ln){
				break; //** Not large enough to read
			}
			if ($str[$c] == "{" && $str[$c+1] == "A" && $str[$c+2] == ","){
				$c+=2; //** Advance 2 + 1 from for loop
				$readState++;
				continue;
			}
		} else {
			if ($str[$c] == "," && $str[$c-1] != "\\"){
				array_push($boxList, intval($readValue));
				$readValue = "";
			} else if ($str[$c] == "}" && $str[$c-1] != "\\"){
				break;
			} else {
				$readValue .= $str[$c];
			}
		}
	}
	
	//** Delete objects in list
	$vals = implode(',', array_fill(0, count($boxList), '?')); //** Borrowed form stack overflow
	$stmt = $db->prepare("DELETE FROM boxes WHERE id IN ( " . $vals . " )");
	$stmt->execute($boxList);
}

function deleteChoiceList($str){
	$readState = 0;
	$readValue = "";
	$ln = strlen($str);
	$choiceList = array();
	
	//** Parse string object
	for ($c=0; $c<$ln; $c++){
		if ($readState == 0){
			if ($c+2>=$ln){
				break; //** Not large enough to read
			}
			if ($str[$c] == "{" && $str[$c+1] == "B" && $str[$c+2] == ","){
				$c+=2; //** Advance 2 + 1 from for loop
				$readState++;
				continue;
			}
		} else {
			if ($str[$c] == "," && $str[$c-1] != "\\"){
				array_push($choiceList, intval($readValue));
				$readValue = "";
			} else if ($str[$c] == "}" && $str[$c-1] != "\\"){
				break;
			} else {
				$readValue .= $str[$c];
			}
		}
	}
	
	if (count($choiceList) < 1){return;}
	
	//** Delete objects in list
	$vals = implode(',', array_fill(0, count($choiceList), '?')); //** Borrowed form stack overflow
	$stmt = $db->prepare("DELETE FROM choices WHERE id IN ( " . $vals . " )");
	$stmt->execute($boxList);
}

function dropStorySlashes($str){
	$ln = strlen($str);
	$newString = "";
	$hasSlashes = false;
	
	for ($ch=0; $ch<$ln; $ch++){
		if ($str[$ch] == "\\"){
			//** Found slash
			if ($hasSlashes == true){
				//** Second slash, add slash to string
				$newString .= $str[$ch];
				$hasSlashes = false;
			} else {
				//** Keep track of this slash
				$hasSlashes = true;
			}
		} else {
			//** Append character
			$newString .= $str[$ch];
			$hasSlashes = false;
		}
	}
	return $newString;
}

function addStorySlashes($str){
	$ln = strlen($str);
	$newString = "";
	
	for ($ch=0; $ch<$ln; $ch++){
		if ($str[$ch] == "{" || $str[$ch] == "}" || $str[$ch] == "," || $str[$ch] == "\\"){
			$newString .= "\\";
		}
		$newString .= $str[$ch];
	}
	return $newString;
}

function parseInput($input){
	global $story_id;
	global $story_name;
	global $story_public;
	global $story_boxes;
	global $story_choices;
	
	if ($input == ""){ return null; }
	$ln = strlen($input);
	$objNum = 0;
	$lineNum = 0;
	$boxNum = 0;
	
	$readState = 0;
	$readObj = "";
	
	$story_id = 0;
	$story_name = '';
	$story_public = 0;
	$story_boxes = array();
	$story_choices = array();
	for ($c=0; $c<$ln; $c++){
		//** Get graph ID & Name
		if ($readState == 0){
			if ($input[$c] == "," && (($c == 0) || ($input[$c-1] != "\\"))){
				$readState++;
				$story_id = intval($readObj);
				$readObj = "";
			} else {
				$readObj .= $input[$c];
				continue;
			}
		} else if ($readState == 1){
			if ($input[$c] == "," && (($c == 0) || ($input[$c-1] != "\\"))){
				$readState++;
				$story_name = $readObj;
				$readObj = "";
			} else {
				$readObj .= $input[$c];
				continue;
			}
		} else if ($readState == 2){
			if ($input[$c] == "{" && ($input[$c-1] != "\\")){
				$readState++;
				$story_public = intval($readObj);
				$readObj = "";
				//** This state doesn't advance so the object can be started in the same loop
			} else {
				$readObj .= $input[$c];
				continue;
			}
		}
		
		//** Get Objects
		if ($readState == 3){
			if ($input[$c] == "{" && ($input[$c-1] != "\\")){
				$readState++;
				$readObj = $input[$c];
			}
		} else if ($readState == 4){
			$readObj .= $input[$c];
			if ($input[$c] == "}"){
				if ($c > 0 && ($input[$c-1] != "\\")){
					//** End of object
					if ($readObj[1] == "B"){
						$newBox = new box;
						$newBox->deserialize($readObj);
						$newBox->StoryID = $story_id;
						array_push($story_boxes, $newBox);
					} else if ($readObj[1] == "L"){
						$newLine = new choice;
						$newLine->deserialize($readObj);
						$newLine->StoryID = $story_id;
						array_push($story_choices, $newLine);
					} else if ($readObj[1] == "Y"){
						//** Delete boxes
						//deleteBoxList($readObj);
					} else if ($readObj[1] == "Z"){
						//** Delete choices
						//deleteChoiceList($readObj);
					}
					$readState--;
					$readObj = "";
				}
			}
		}
	}
}

function sendGraphObjects(){
	global $story_id;
	global $story_name;
	global $story_public;
	global $story_boxes;
	global $story_choices;
	
	//** Send Story Data
	print($story_id . ',');
	print($story_name . ',');
	print($story_public);
	
	//** Send Boxes
	foreach ($story_boxes as $obj){
		print($obj->serialize());
	}
	
	//** Send Choices
	foreach ($story_choices as $obj){
		print($obj->serialize());
	}
}

function getStory($id){
	global $db;
	
	$stmt = $db->prepare('SELECT * FROM stories WHERE is_public = 1 AND id = ? LIMIT 1');
	$stmt->execute(array($id));

	return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getRandomStory(){
	global $db;
	
	$stmt = $db->prepare('SELECT * FROM stories WHERE is_public != 0 ORDER BY RAND() LIMIT 1');
	$stmt->execute();

	return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getStoryList(){
	global $db;
	
	$stmt = $db->query('SELECT * FROM stories');

	return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>