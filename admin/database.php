<?PHP
include("config.php");

$db = NULL;
$dsn = "mysql:host=$db_host;dbname=$db_name";
try {
 $db = new PDO($dsn, $db_user, $db_pass);

 $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
 }

catch(PDOException $e) {
    echo "An error occured while connecting to the database.\n";
    echo $e->getMessage() . "\n";
}

function testDB() {
    global $db, $dsn;

    $query = "SHOW TABLES";
    try {
    $stmt = $db->query($query);
    print_r($stmt->fetchAll());    
    }

    catch(PDOException$e) {
    echo "An error occured while querying the database.\n";
    echo $e->getMessage() . "\n";
    echo "DSN: $dsn\n";
    }
    
}

testDB();

?>