<?PHP
include("database.php");

//** If a graph was sent from client than the default graph gets replaced
if(isset($_POST['name']) && !empty($_POST['name'])) {
    $sName = $_POST['name'];
    $sUrl = $_POST['url'];
    
    //** TODO: Add sound to database
    $stmt = $db->prepare("INSERT INTO sounds ( name, url ) VALUES (?, ?)");
	$stmt->execute(array($sName, $sUrl));
    loadSounds();
    sendSounds();
} else {
	//** No graph was sent so send default
	print ("");
}
?>