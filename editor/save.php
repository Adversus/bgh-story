<?PHP
include("database.php");

//** Set default graph
$input = "-1{B,-1,Start,(Starting message),150,200}{B,-2,End,(Completion message),550,200}{L,-1,(new choice),,-1,-2}";

//** If a graph was sent from client than the default graph gets replaced
if(isset($_POST['graph']) && !empty($_POST['graph'])) {
    $input = $_POST['graph'];
	$test = parseInput($input);
	saveStory();
	sendGraphObjects();
} else {
	//** No graph was sent so send default
	print ($input);
}
?>