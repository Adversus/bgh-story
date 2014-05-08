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
		return json_encode($this->toCompact());
	}
	public function deserialize($str){
		$readObj = new stdClass();
		
		//** Handle strings and already decoded strings
		if (is_str($str)){
			$readObj = json_decode($str);
		} else {
			$readObj = $str;
		}
		
		$this->ID = $obj->a;
		$this->Title = $obj->b;
		$this->Text = $obj->c;
		$this->x = $obj->x;
		$this->y = $obj->y;
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
	
	public function toCompact(){
		/* Convert this object into a compact one containing only the important vars */
		$obj = new stdClass();
		$obj->type = "B";
		$obj->a = $this->ID;
		$obj->b = $this->Title;
		$obj->c = $this->Text;
		$obj->x = $this->x;
		$obj->y = $this->y;
		return $obj;
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
		//** Return the object as a string
		return json_encode($this->toCompact());
	}
	public function deserialize($str){
		$readObj = new stdClass();
		
		//** Handle strings and already decoded strings
		if (is_str($str)){
			$readObj = json_decode($str);
		} else {
			$readObj = $str;
		}
		
		$this->ID = intval($obj->a);
		$this->Choice = $obj->b;
		$this->Fact = $obj->c;
		$this->Box1 = intval($obj->b1);
		$this->Box2 = intval($obj->b2);
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
	
	public function toCompact(){
		/* Convert this object into a compact one containing only the important vars */
		$obj = new stdClass();
		$obj->type = "L";
		$obj->a = $this->ID;
		$obj->b = $this->Choice;
		$obj->c = $this->Fact;
		$obj->b1 = $this->Box1;
		$obj->b2 = $this->Box2;
		return $obj;
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
		$result = $stmt->execute(array($story_name, $story_public));
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
		$stmt->execute(array($story_name, $story_public, $story_id));
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
	
	//** Decode the input into and set relevent vars
	$graph = json_decode($input);
	$story_id = intval($graph->id);
	$story_name = $graph->name;
	$story_public = intval($graph->pub);
	
	//** Convert graph objects into boxes and lines
	for ($o = sizeof($graph["objs"])-1; $o>-1; $o--) {
		if ($graph["objs"][$o]->type == "B"){
			$newBox = new box;
			$newBox->deserialize($graph["objs"][$o]);
			$newBox->StoryID = $story_id;
			array_push($story_boxes, $newBox);
		} else if ($graph["objs"][$o]->type == "L"){
			$newLine = new choice;
			$newLine->deserialize($graph["objs"][$o]);
			$newLine->StoryID = $story_id;
			array_push($story_choices, $newLine);
		}
	}
}

function sendGraphObjects(){
	global $story_id;
	global $story_name;
	global $story_public;
	global $story_boxes;
	global $story_choices;
	
	//** Create story object with relevent vars
	$sendObj = new stdClass();
	$sendObj->id = $story_id;
	$sendObj->name = $story_name;
	$sendObj->pub = $story_public;
	$sendObj->objs = [];
	
	//** Send Boxes
	foreach ($story_boxes as $obj){
		array_push($sendObj->objs, $obj->toCompact());
	}
	
	//** Send Choices
	foreach ($story_choices as $obj){
		array_push($sendObj->objs, $obj->toCompact());
	}
	
	//** Send the graph object to the client
	print(json_encode($sendObj));
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