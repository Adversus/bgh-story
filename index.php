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

$choiceCount = 5;

//** Output Page
echo '<html>
	<head>
	<title>BGH Example</title>';
	
//** Output background
echo '<style rel="stylesheet" type="text/css">
	.storybg_box{
	background: '.$story_boxes[0]->grad2.' no-repeat center center fixed; 
	-webkit-background-size: cover;
	-moz-background-size: cover;
	-o-background-size: cover;
	background-size: cover;

	/* IE10 Consumer Preview */ 
	background-image: -ms-radial-gradient(center, circle farthest-corner, '.$story_boxes[0]->grad1.' 0%, '.$story_boxes[0]->grad2.' 100%);

	/* Mozilla Firefox */ 
	background-image: -moz-radial-gradient(center, circle farthest-corner, '.$story_boxes[0]->grad1.' 0%, '.$story_boxes[0]->grad2.' 100%);

	/* Opera */ 
	background-image: -o-radial-gradient(center, circle farthest-corner, '.$story_boxes[0]->grad1.' 0%, '.$story_boxes[0]->grad2.' 100%);

	/* Webkit (Safari/Chrome 10) */ 
	background-image: -webkit-gradient(radial, center center, 0, center center, 506, color-stop(0, '.$story_boxes[0]->grad1.'), color-stop(1, '.$story_boxes[0]->grad2.'));

	/* Webkit (Chrome 11+) */ 
	background-image: -webkit-radial-gradient(center, circle farthest-corner, '.$story_boxes[0]->grad1.' 0%, '.$story_boxes[0]->grad2.' 100%);

	/* W3C Markup, IE10 Release Preview */ 
	background-image: radial-gradient(circle farthest-corner at center, '.$story_boxes[0]->grad1.' 0%, '.$story_boxes[0]->grad2.' 100%);
	}
</style>';

//** Output scripts
echo '<script language="javascript" type="text/javascript" src="editor/js/jquery-1.9.1.min.js"></script>
	<script language="javascript" type="text/javascript" src="editor/js/jquery-ui-1.10.4.min.js"></script>
	<script language="javascript" type="text/javascript" src="editor/js/base_classes.js"></script>
	<script language="javascript" type="text/javascript" src="editor/js/story.js"></script>
	<script type="text/javascript">
		window.storyData = ' . getStoryUpdate() . ';
	</script>
	<link rel="stylesheet" href="editor/css/story.css" />
	<link rel="stylesheet" href="editor/css/storybg.css" />
	</head>
	<body class="storybg_box">
	<div class="centerColumn">
	<div class="bgOverlay">
	</div>
	<div class="topButtons">
		<button class="tbBtn">Get Help</button>
		<a href="' . $about_us_url . '"><button class="tbBtn">About Us</button></a>';

//** Paypal donate button
echo '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" style="display:inline-block;">
<input type="hidden" name="cmd" value="_s-xclick">
<input type="hidden" name="hosted_button_id" value="' . $paypal_button_id . '">
<input type="submit" class="tbBtn" value="Donate" name="submit"></button></form>';

echo '</div>
	<div style="width:100%;border-top:1px rgba(0,0,0,0.3) solid;margin-top:2px;"></div>
	<div id="choiceScreen" style="display:none;">';
	
echo '<div id="storyBox" class="text" >
	<p id="storyText"></p>
	</div>
	
	<hr class="hr2"></hr>
	
	<div class="choiceBox">';
	
//** Add choice buttons
for ($i=0; $i<$choiceCount; $i++){
	echo '<button id="choice_' . $i . '" class="choiceBtn choice"'
			. '" data-choice="' . $i . '">button'.$i.'</button>';
	if ($i<$choiceCount-1){
		//** Add vertical divider
		echo '<div id="vr_'.$i.'" class="vr"></div>';
	}
}
	
echo '</div>
</div>
<div id="factScreen" style="display:none;">
	<div id="factText" class="text">
	</div>
	
	<hr class="hr2"></hr>
	<div class="choiceBox">
		<button id="btnContinue" class="choiceBtn">Continue</button>
	</div>
</div>
</div>
<div id="loadScreen" style="display:none;">
	<img src="editor/css/images/ajax-loader.gif" class="loaderImg">
</div>
<div class="leftBar"></div>
<div class="rightBar"></div>
</body></html>';
?>