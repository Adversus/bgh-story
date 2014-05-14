<?PHP
include("database.php");

//** If a graph was sent from client than the default graph gets replaced
if(isset($_POST['graph']) && !empty($_POST['graph'])) {
    $input = $_POST['graph'];
	$test = parseInput($input);
	saveStory();
	sendGraphObjects();
} else {
	//** No graph was sent so send nothing
	print ("");
}
?>