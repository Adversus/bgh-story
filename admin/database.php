<?PHP
include("config.php");

$db = NULL;

try {
 $dsn = "mysql:host=$db_host;dbname=$db_name";
 $db  = new PDO($dsn, $db_user, $db_pass);

 $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
 }

catch(PDOException $e) {
    echo "An error occured while connecting to the database.\n";
    echo $e->getMessage() . "\n";
}

function testDB() {
    global $db;

    $query = "SHOW TABLES";
    try {
    $stmt = $db->query($query);
    print_r($stmt->fetchAll());    
    }

    catch(PDOException$e) {
    echo "An error occured while querying the database.\n";
    echo $e->getMessage() . "\n";
    }
    
}

function addBody($body_text) {
    global $db;

    $stmt = $db->prepare("INSERT INTO bodies (id, text) VALUES (NULL, ?)");
    $stmt->execute(array($body_text));
    
    return $db->lastInsertId();
}

function setBody($id, $body_text) {
    global $db;

    $stmt = $db->prepare("UPDATE bodies SET text = ? WHERE id = ?");
    $stmt->execute(array($body_text, $id));
}

function getBody($id) {
    global $db;
    
    $stmt = $db->prepare("SELECT text from bodies WHERE id = ?");
    if ($stmt->execute(array($id))) {
    $row = $stmt->fetch();
    return $row["text"];
    }

    
}

function removeBody($id) {
    global $db;

    $stmt = $db->prepare("DELETE FROM bodies WHERE id = ?");
    $stmt->execute(array($id));
}

if (!isset($_SERVER["REQUEST_METHOD"])) {
 echo "addBody()\n";
 $body_id = addBody("Test body!");

 echo "body_id: $body_id\n";

 echo "body_text: " . getBody($body_id) . "\n";

 removeBody($body_id);
}

?>