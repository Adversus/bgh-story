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
	var $SoundID = -1;
	var $x = 0;
	var $y = 0;
	var $grad1 = "";
	var $grad2 = "";
	
	public function __construct($str = "") {
		/* Box class constructor */
		if ($str != ""){
			$this->deserialize($str);
		}
	}
	public function setup($row){
		$this->ID = $row['id'];
		$this->StoryID = $row['story_id'];
		$this->Title = $row['title'];
		$this->Text = $row['text'];
		$this->SoundID = $row['sound_id'];
		$this->x = $row['x'];
		$this->y = $row['y'];
		$this->grad1 = $row['grad_primary'];
		$this->grad2 = $row['grad_secondary'];
	}
	public function serialize(){
		/* Convert the box class vars into a single string and return it */
		return json_encode($this->toCompact());
	}
	public function deserialize($str){
		$readObj = new stdClass();
		
		//** Handle strings and already decoded strings
		if (is_string($str)){
			$readObj = json_decode($str);
		} else {
			$readObj = $str;
		}
		
		//** Get vars from the array or object
		if (is_array($readObj)){
			$this->ID = intval($readObj["a"]);
			$this->Title = $readObj["b"];
			$this->Text = $readObj["c"];
			$this->SoundID = $readObj["d"];
			$this->x = intval($readObj["x"]);
			$this->y = intval($readObj["y"]);
			if (isset($readObj["grad1"])){
				$this->grad1 = $readObj["grad1"];
			} else {
				$this->grad1 = "";
			}
			if (isset($readObj["grad2"])){
				$this->grad2 = $readObj["grad2"];
			} else {
				$this->grad2 = "";
			}
		} else {
			$this->ID = intval($obj->a);
			$this->Title = $obj->b;
			$this->Text = $obj->c;
			$this->SoundID = $obj->d;
			$this->x = intval($obj->x);
			$this->y = intval($obj->y);
			if (isset($readObj["grad1"])){
				$this->grad1 = $obj->grad1;
			} else {
				$this->grad1 = "";
			}
			if (isset($readObj["grad2"])){
				$this->grad2 = $obj->grad2;
			} else {
				$this->grad2 = "";
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
			$stmt = $db->prepare("INSERT INTO boxes ( story_id, title, text, sound_id, x, y, grad_primary, grad_secondary ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
			$stmt->execute(array($this->StoryID, $this->Title, $this->Text, $this->SoundID, $this->x, $this->y, $this->grad1, $this->grad2));
			
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
			$stmt = $db->prepare("UPDATE boxes SET title = ?, text=?, sound_id=?, x=?, y=?, grad_primary=?, grad_secondary=? WHERE id=?");
			$stmt->execute(array($this->Title, $this->Text, $this->SoundID, $this->x, $this->y, $this->grad1, $this->grad2, $this->ID));
		}
	}
	
	public function toCompact(){
		/* Convert this object into a compact one containing only the important vars */
		$obj = new stdClass();
		$obj->type = "B";
		$obj->a = $this->ID;
		$obj->b = $this->Title;
		$obj->c = $this->Text;
		$obj->d = $this->SoundID;
		$obj->x = $this->x;
		$obj->y = $this->y;
		$obj->grad1 = $this->grad1;
		$obj->grad2 = $this->grad2;
		return $obj;
	}
}

class choice {
	var $ID = -1;
	var $StoryID = -1;
	var $Choice = "";
	var $Fact = "";
	var $SoundID = -1;
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
		$this->SoundID = $row['sound_id'];
		$this->Box1 = $row['box1_id'];
		$this->Box2 = $row['box2_id'];
	}
	public function serialize(){
		/* Convert the choice class vars into a single string and return it */
		return json_encode($this->toCompact());
	}
	public function deserialize($str){
		$readObj = new stdClass();
		
		//** Handle strings and already decoded strings
		if (is_string($str)){
			$readObj = json_decode($str);
		} else {
			$readObj = $str;
		}
		
		//** Get vars from the array or object
		if (is_array($readObj)){
			$this->ID = intval($readObj["a"]);
			$this->Choice = $readObj["b"];
			$this->Fact = $readObj["c"];
			$this->SoundID = $readObj["d"];
			$this->Box1 = intval($readObj["b1"]);
			$this->Box2 = intval($readObj["b2"]);
		} else {
			$this->ID = intval($readObj->a);
			$this->Choice = $readObj->b;
			$this->Fact = $readObj->c;
			$this->SoundID = $readObj->d;
			$this->Box1 = intval($readObj->b1);
			$this->Box2 = intval($readObj->b2);
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
			$stmt = $db->prepare("INSERT INTO choices ( story_id, choice, fact, sound_id, box1_id, box2_id ) VALUES (?, ?, ?, ?, ?, ?)");
			$stmt->execute(array($this->StoryID, $this->Choice, $this->Fact, $this->SoundID, $this->Box1, $this->Box2));
			$this->ID = $db->lastInsertId();
		} else {
			//** Update preexisting database entry
			$stmt = $db->prepare("UPDATE choices SET choice = ?, fact=?, sound_id=?, box1_id=?, box2_id=? WHERE id=?");
			$stmt->execute(array($this->Choice, $this->Fact, $this->SoundID, $this->Box1, $this->Box2, $this->ID));
		}
	}
	
	public function toCompact(){
		/* Convert this object into a compact one containing only the important vars */
		$obj = new stdClass();
		$obj->type = "L";
		$obj->a = $this->ID;
		$obj->b = $this->Choice;
		$obj->c = $this->Fact;
		$obj->d = $this->SoundID;
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
	$stmt = $db->prepare("DELETE FROM boxes WHERE story_id = " . $story_id . " AND id NOT IN ( " . $vals . " )");
	$stmt->execute($delBoxes);
	
	//** Clean up deleted choices
	$delChoices = array();
	foreach ($story_choices as $obj){
		array_push($delChoices, $obj->ID);
	}
	$vals = implode(',', array_fill(0, count($delChoices), '?')); //** Borrowed form stack overflow
	$stmt = $db->prepare("DELETE FROM choices WHERE story_id = " . $story_id . " AND id NOT IN ( " . $vals . " )");
	$stmt->execute($delChoices);
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
	
	//** Confirm story has boxes
	if (count($story_boxes) == 0 ){
		return;
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
	$graph = json_decode($input, true);
	$story_id = intval($graph["id"]);
	$story_name = $graph["name"];
	$story_public = intval($graph["pub"]);
	
	//** Convert graph objects into boxes and lines
	for ($o = sizeof($graph["objs"])-1; $o>-1; $o--) {
		if ($graph["objs"][$o]["type"] == "B"){
			$newBox = new box;
			$newBox->deserialize($graph["objs"][$o]);
			$newBox->StoryID = $story_id;
			array_push($story_boxes, $newBox);
		} else if ($graph["objs"][$o]["type"] == "L"){
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

function getStoryUpdate(){
	global $story_boxes;
	global $story_choices;
	if (count($story_boxes) > 0){
		$obj = new stdClass();
		$obj->text = $story_boxes[0]->Text;
		$obj->grad1 = $story_boxes[0]->grad1;
		$obj->grad2 = $story_boxes[0]->grad2;
		$obj->sound = "";
		$obj->choices = Array();
		
		if (count($story_choices) > 0){
			foreach ($story_choices as $choice){
				$newChoice = new stdClass();
				$newChoice->Choice = $choice->Choice;
				$newChoice->Fact = $choice->Fact;
				$newChoice->Target = $choice->Box2;
				array_push($obj->choices, $newChoice);
			}
		}
		
		return json_encode($obj);
	}
	return "";
}
?>