<?PHP
include("database.php");

$sList = getStoryList();
$sendObj = new stdClass();
$sendObj->lst = Array();

//** Iterate through each returned row
foreach ($sList as $row){
	//** Convert each row into an array and add it to the send object
	array_push($sendObj->lst, Array(
		$row['id'],
		$row['story_name']
	));
}

//** Send the list to the client
print(json_encode($sendObj));
?>