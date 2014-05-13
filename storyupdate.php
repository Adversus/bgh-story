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

print getStoryUpdate();
?>