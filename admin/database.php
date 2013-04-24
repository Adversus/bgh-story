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

function setResponse($id, $parent, $text, $consequence, $fact) {
  /* ID and FACT may be NULL. If ID is null, a new response is
     created. Otherwise, an existing response is updated. */
  global $db;

  $stmt = $db->prepare("REPLACE INTO responses (id, response_text, response_fact_id, parent_scenario_id, response_consequence_scenario_id) VALUES (:id, :text, :fact, :parent, :consequence)");

  $stmt->execute(array(":id" => $id,
                       ":text" => $text,
                       ":fact" => $fact,
                       ":parent" => $parent,
                       "consequence" => $consequence));

}

function truncate($string, $length, $stopanywhere=false) {
  //truncates a string to a certain char length, stopping on a word if not specified otherwise.
  if (strlen($string) > $length) {
    //limit hit!
    $string = substr($string,0,($length -3));
    if ($stopanywhere) {
      //stop anywhere
      $string .= '...';
    } else{
      //stop on a word.
      $string = substr($string,0,strrpos($string,' ')).'...';
    }
  }
  return $string;
}

function getStoryStartScenario($story_id) {
  global $db;

  $stmt = $db->prepare("SELECT first_scenario_id FROM stories WHERE id = ?");
  $stmt->execute(array($story_id));

  $result = $stmt->fetch();

  return $result["first_scenario_id"];
}

function getStoryScenarios($story_id = "ALL") {
  /* return all scenarios (w/o responses) for a given story (or ALL
     stories) */
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
  while ($row = $stmt->fetch()) {
    $short_text = truncate($row["text"], 40);
    array_push($scenarios,
               array("id" => $row["id"],
                     "descr" => $row["text"],
                     "short" => $short_text,
                     "responses" => getResponses($row["id"])));

    $story_descr = $row["story_name"];
  }

  return $scenarios;
}

function addFact($fact_text = "") {
  global $db;

  // Create a body-text entry for the fact and note its ID
  $body_id = addBody($fact_text);

  $stmt = $db->prepare("INSERT INTO facts (id, fact_body) VALUES (NULL, ?)");
  $stmt->execute(array($body_id));
}

function setFact($fact_id, $fact_text) {
  global $db;

  $stmt = $db->prepare("UPDATE facts INNER JOIN bodies ON facts.fact_body = bodies.id SET text = ? WHERE facts.id = ?");
  $stmt->execute(array($fact_text, $fact_id));
}

function getFacts($fact_id = "ALL") {
  global $db;
  if ($fact_id == "ALL") {
    $stmt = $db->prepare("SELECT facts.id, bodies.text FROM facts INNER JOIN bodies ON facts.fact_body = bodies.id");
    $stmt->execute();
  }
  else {
    $stmt = $db->prepare("SELECT facts.id, bodies.text FROM facts INNER JOIN bodies ON facts.fact_body = bodies.id WHERE facts.id = ?");
    $stmt->execute(array($fact_id));
  }

  $results = array();

  while ($row = $stmt->fetch()) {
    array_push($results,
               array("id" => $row["id"],
                     "descr" => $row["text"],
                     "short" => truncate($row["text"], 40)));
  }

  return $results;
}

function removeFact($fact_id) {
  global $db;

  $stmt = $db->prepare("DELETE facts, bodies FROM facts INNER JOIN bodies ON facts.fact_body = bodies.id WHERE facts.id = ?");
  $stmt->execute(array($fact_id));
}

function removeStory($story_id) {
  /* Delete a story. The default story is 1.
   * - Update scenarios: All scenarios in story_id move to default story.
   * - Delete story_id and start + end bodies.
   */
  global $db;

  // Move any scenarios
  $stmt = $db->prepare("UPDATE scenarios SET story_id = :story_id WHERE story_id = :story_id");
  $stmt->execute(array(":story_id" => $story_id));

  // Delete story + start and end bodies
  $stmt = $db->prepare("DELETE stories, start, end FROM stories LEFT JOIN bodies start ON stories.start_screen_body_id = start.id LEFT JOIN bodies end ON stories.end_screen_body_id = end.id WHERE stories.id = ?");
  $stmt->execute(array($story_id));
}

function isValidStory($story_id) {
  global $db;

  $stmt = $db->prepare("SELECT COUNT(*) FROM stories WHERE id = ?");
  $stmt->execute(array($story_id));

  $results = $stmt->fetch();
  return $results[0];
}

function getScenarioStoryId($scenario_id) {
  /* Given a scenario id, return the story_id if none, return 1
     (default story.) */
  global $db;

  $stmt = $db->prepare("SELECT story_id FROM scenarios WHERE id = ?");
  $success = $stmt->execute(array($scenario_id));

  $result = $stmt->fetch();

  // TODO: error checking
  return $result["story_id"];

}

if (!isset($_SERVER["REQUEST_METHOD"])) {
  print isValidStory(11) . "\n";
 }

?>