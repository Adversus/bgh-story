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

function getResponses($scenario_id) {
  /* Given a scenario_id, return an array of dictionaries for each
     response with `id`, `choice`, `consequence`, and `factoid`
     attributes. */
  global $db;
  
  $stmt = $db->prepare("SELECT id, response_text, response_fact_id, parent_scenario_id, response_consequence_scenario_id FROM responses WHERE parent_scenario_id = ?");
  $stmt->execute(array($scenario_id));

  $responses = array();

  while ($row = $stmt->fetch()) {
    array_push($responses,
               array("id" => $row["id"],
                     "choice" => $row["response_text"],
                     "consequence" => $row["response_consequence_scenario_id"],
                     "factoid" => $row["response_fact_id"]));
  }
  
  return $responses;

}

function getStory($story_id = "ALL") {

  global $db;
  
  if ($story_id == "ALL") {
    $stmt = $db->prepare("SELECT scenarios.id,stories.story_name,bodies.text FROM stories,scenarios,bodies WHERE scenarios.scenario_body_id = bodies.id AND scenarios.story_id = stories.id");
  }
  else {
    $stmt = $db->prepare("SELECT scenarios.id,stories.story_name,bodies.text FROM stories,scenarios,bodies WHERE scenarios.scenario_body_id = bodies.id AND scenarios.story_id = stories.id AND stories.id = ?");
  }

  //"select scenarios.id,stories.story_name, bodies.text from stories,scenarios,bodies where   scenarios.scenario_body_id = bodies.id and scenarios.story_id = stories.id and story_id = ?"

  $stmt->execute(array($story_id));

  $scenarios = array();
  $story_descr = "";
  while ($row = $stmt->fetch()) {
    array_push($scenarios,
               array("id" => $row["scenario_id"],
                     "descr" => $row["text"]));
    $story_descr = $row["story_name"];
  }
  
  return array("story_id" => $story_id,
               "story_name" => $story_name,
               "scenarios" => $scenarios);

}

if (!isset($_SERVER["REQUEST_METHOD"])) {
  print_r(getStory());
}

?>