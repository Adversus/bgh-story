<?PHP
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
$c1Vis = 'inline-block';
$c1Text = '';
$c1Data = 0;
$c1Fact = '';

$c2Vis = 'inline-block';
$c2Text = '';
$c2Data = 0;
$c2Fact = '';

$c3Vis = 'inline-block';
$c3Text = '';
$c3Data = 0;
$c3Fact = '';

$c4Vis = 'inline-block';
$c4Text = '';
$c4Data = 0;
$c4Fact = '';

if (count($story_choices) < 4){
	$c4Vis = 'none';
} else {
	$c4Text = $story_choices[3]->Choice;
	$c4Data = $story_choices[3]->Box2;
	$c4Fact = $story_choices[3]->Fact;
}
if (count($story_choices) < 3){
	$c3Vis = 'none';
} else {
	$c3Text = $story_choices[2]->Choice;
	$c3Data = $story_choices[2]->Box2;
	$c3Fact = $story_choices[2]->Fact;
}
if (count($story_choices) < 2){
	$c2Vis = 'none';
} else {
	$c2Text = $story_choices[1]->Choice;
	$c2Data = $story_choices[1]->Box2;
	$c2Fact = $story_choices[1]->Fact;
}
if (count($story_choices) < 1){
	$c1Vis = 'none';
} else {
	$c1Text = $story_choices[0]->Choice;
	$c1Data = $story_choices[0]->Box2;
	$c1Fact = $story_choices[0]->Fact;
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
		var choice1_Fact = "' .urldecode($c1Fact). '";
		var choice2_Fact = "' .urldecode($c2Fact). '";
		var choice3_Fact = "' .urldecode($c3Fact). '";
		var choice4_Fact = "' .urldecode($c4Fact). '";
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
	
	<div class="choiceBox">
		<button id="choice1" style=\'display:'.$c1Vis.'\' class="choiceBtn choice" data-url="'.$c1Data.'" data-choice="1">'.$c1Text.'</button>
		<div id="vr2" style=\'display:'.$c2Vis.'\' class="vr"></div>
		
		<button id="choice2" style=\'display:'.$c2Vis.'\' class="choiceBtn choice" data-url="'.$c2Data.'" data-choice="2">'.$c2Text.'</button>
		<div id="vr3" style=\'display:'.$c3Vis.'\' class="vr"></div>
		
		<button id="choice3" style=\'display:'.$c3Vis.'\' class="choiceBtn choice" data-url="'.$c3Data.'" data-choice="3">'.$c3Text.'</button>
		<div id="vr4" style=\'display:'.$c4Vis.'\' class="vr"></div>
		
		<button id="choice4" style=\'display:'.$c4Vis.'\' class="choiceBtn choice" data-url="'.$c4Data.'" data-choice="4">'.$c4Text.'</button>
	</div>';
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