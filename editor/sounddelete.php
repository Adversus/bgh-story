<?PHP
include("database.php");

//** If a graph was sent from client than the default graph gets replaced
if(isset($_POST['sID']) && !empty($_POST['sID'])) {
    $sID = intval($_POST['sID']);
    
    //** TODO: Add sound to database
    $stmt = $db->prepare("DELETE FROM sounds WHERE ID = ?");
	$stmt->execute(array($sID));
    
    $stmt = $db->prepare("UPDATE boxes SET sound_id = -1 WHERE sound_id = ?");
	$stmt->execute(array($sID));
    $stmt = $db->prepare("UPDATE choices SET sound_id = -1 WHERE sound_id = ?");
	$stmt->execute(array($sID));
    
    loadSounds();
    sendSounds();
} else {
	//** No graph was sent so send default
	print ("");
}
?>