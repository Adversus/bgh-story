<?PHP
include("database.php");

//** If a graph id was sent from client then load that graph
if(isset($_POST['id']) && !empty($_POST['id'])) {
    $gID = intval($_POST['id']);
	loadStory($gID);
	sendGraphObjects();
} else {
	//** No graph id was sent so send nothing
	print '';
}
?>