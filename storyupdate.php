<?PHP
$pagePrefix = "editor/";
include($pagePrefix . "database.php");

//** Retrieve box id
if (!empty($_GET['b'])){
	$page = intval($_GET["b"]);
} else {
	$page = 0;
}

if ($page > 0){
	loadPage($page);
} else {
	return 0;
}

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
	
	print json_encode($obj);
}
?>