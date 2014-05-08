<?PHP
class choiceDisplay {
	var $ID = 0;
	var $Text = '';
	var $Data = 0;
	var $Fact = '';
	
	public function getButton() {
		$newButton = '<button id="choice' . $this->ID . '" class="choiceBtn choice" data-url="' . $this->Data 
					 . '" data-choice="' . $this->ID . '">' . $this->Text . '</button>';
		return $newButton;
	}
}

//** Only load a page if one does not exist already
//if (!isset($story_boxes)){
	$pagePrefix = "editor/";
	include($pagePrefix . "database.php");

	//** Retrieve story id
	if (!empty($_GET['s'])){
		$story = intval($_GET["s"]);
	} else {
		$story = 0;
	}

	//** Retrieve box id
	if (!empty($_GET['p'])){
		$page = intval($_GET["p"]);
	} else {
		$page = 0;
	}

	if ($page > 0){
		loadPage($page);
	} else if ($story > 0){
		
	} else {
		$tmpStory = getRandomStory();
		if (sizeof($tmpStory) > 0){
			loadPage($tmpStory[0]["id"], true);
		}
	}
//}

//** Handle Choice vars
$choices = array();
$choiceCount = count($story_choices);
for ($i=0; $i<$choiceCount; $i++){
	$newChoice = new choiceDisplay();
	$newChoice->ID = $i;
	$newChoice->Text = $story_choices[$i]->Choice;
	$newChoice->Data = $story_choices[$i]->Box2;
	$newChoice->Fact = $story_choices[$i]->Fact;
	array_push($choices, $newChoice);
}

//** Output Page
echo '<html>
	<head>
	<title>BGH Example</title>
	
	<script language="javascript" type="text/javascript" src="editor/js/jquery-1.9.1.min.js"></script>
	<script language="javascript" type="text/javascript" src="editor/js/jquery-ui-1.10.4.min.js"></script>
	<script language="javascript" type="text/javascript" src="editor/js/base_classes.js"></script>
	<script language="javascript" type="text/javascript" src="editor/js/story.js"></script>
	<script type="text/javascript">
		var choice_Facts = [';
		
//** Add facts as a js array(temporary non-ajax method)
for ($i=0; $i<$choiceCount; $i++){
	echo '"' . urldecode($choices[$i]->Fact) . '"';
	if ($i<$choiceCount-1){
		echo ',';
	}
}

//** Coninue page output
echo '];
	</script>
	<link rel="stylesheet" href="editor/css/story.css" />
	<link rel="stylesheet" href="editor/css/storybg.css" />
	</head>
	<body class="storybg_blue">
	<div class="topButtons">
		<button class="tbBtn">Get Help</button>
		<button class="tbBtn">About Us</button>
		<button class="tbBtn">Donate</button>
	</div>
	<div style="width:100%;border-top:1px rgba(0,0,0,0.3) solid;margin-top:2px;"></div>
	<div id="choiceScreen" style="display:none;">';
	
if (count($story_boxes) > 0){
	echo '<div id="storyBox" class="text" >
	<p id="storyText">' . $story_boxes[0]->Text . '</p>
	</div>
	
	<hr class="hr2"></hr>
	
	<div class="choiceBox">';
	
	//** Add choice buttons
	for ($i=0; $i<$choiceCount; $i++){
		echo $choices[$i]->getButton();
		if ($i<$choiceCount-1){
			//** Add vertical divider
			echo '<div id="vr_'.$i.'" class="vr"></div>';
		}
	}
	
	echo '</div>';
} else {
	echo 'No stories are enabled.';
}

echo '</div>
<div id="factScreen" style="display:none;">
	<div id="factText" class="text">
	</div>
	
	<hr class="hr2"></hr>
	<div class="choiceBox">
		<button id="btnContinue" class="choiceBtn">Continue</button>
	</div>
</div>
<div id="loadScreen" style="display:none;">
	<img src="editor/css/images/ajax-loader.gif" class="loaderImg">
</div>
</body></html>';
?>