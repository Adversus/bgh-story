<?PHP
include("database.php");

$sList = getStoryList();
foreach ($sList as $row){
	echo "{" . $row['id'] . "," . addStorySlashes($row['story_name']) . "}";
}
?>