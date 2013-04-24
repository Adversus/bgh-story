<?PHP
header("Content-Type:text/plain");

include("database.php");

// This variable holds our "database" until we get a real one.
// later functions "query" this data for the admin page.
/* $scenarios = json_decode(
   <<<EOJSON
   [
   {"descr": "A friend says to you, \"You havent seemed like yourself lately.\"",
   "responses": [
   {"id": 0,
   "choice": "Carry on",
   "consequence": 1,
   "factoid": [1]},
   {"id": 1, "choice": "Ackowledge a problem",
   "consequence":1,
   "factoid": []}
   ]
   },
   {"descr": "At a restaurant, the waiter brings you your order. Broken glass has accidentally found its way into the meal and is possibly dangerous.",
   "responses": [
   {"id":2, "choice": "Berate the waitor until they cry",
   "consequence": 2,
   "factoid": []},
   {"id":3, "choice": "Don't say anything and eat the food trying to pick out the glass.",
   "consequence": 0,
   "factoid": [1]}
   ]
   }
   ]
   EOJSON
   ,true); */

// Fake stories table

$stories = array("story_name" => "default",
                 "scenarios" => array(0));
// End of fake-database

/* code-cleaning functions */

function action($action_name) {
  /* Check if a $_POST["action"] == $action_name */
  if (isset($_POST["action"]) && $_POST["action"] == $action_name) {
    return true;
  }
  return false;
}

/*
 * Request handlers:
 */

/*
 * CREATE_STORY
 */

if (action("create_story")) {
  if (!isset($_POST["story_name"])) {
    return; // TODO: error handling
  }

  // Insert story row
  $stmt = $db->prepare("INSERT INTO stories (story_name) VALUES (?)");
  $stmt->execute(array($_POST["story_name"]));

  // return story_id
  print json_encode(array("response" => "create_story",
                          "body" => array("descr" => $_POST["story_name"],
                                          "id" => $db->lastInsertId())));
 }

/*
 * CREATE_SCENARIO
 */

if (action("create_scenario")) {
  $body_text = "";
  $story_id  = null;

  if (isset($_POST["body_text"])) {
    $body_text = $_POST["body_text"];
  }

  if (isset($_POST["story_id"])) {
    $story_id = $_POST["story_id"];

    $stmt = $db->prepare("INSERT INTO SCENARIOS (story_id, scenario_body) VALUES (?, ?)");
    $stmt->execute(array($story_id, $body_text));
  }
  else {
    $stmt = $db->prepare("INSERT INTO SCENARIOS (scenario_body) VALUES (?, ?)");
    $stmt->execute(array($body_text));
  }
  
  print json_encode(array("response" => "create_scenario",
                          "body" => array("scenario_id" => $db->lastInsertId())));
 }

/* 
 * CREATE_FACT
 */

if (action("create_fact")) {
  $body_text = null;
  if (isset($_POST["body_text"])) {
    $body_text = $_POST["body_text"];
  }

  $body_id = addBody($body_text);

  $stmt = $db->prepare("INSERT INTO facts (id, fact_body) VALUES (NULL, ?)");
  $stmp->execute(array($body_id));

  print json_encode(array("response" => "create_fact",
                          "body" => array("fact_id" => $db->lastInsertId())));

 }

/*
 * CREATE_RESPONSE
 */


if (action("create_response")) {


  "INSERT INTO responses (id, response_text, response_fact_id, parent_scenario_id, response_consequence_scenario_id)
VALUES (NULL, ..., ..., ..., ...);";
 }

/*
 * GET_STORIES
 */

if (action("get_stories")) {
  $stmt = $db->prepare("SELECT id, story_name FROM stories");

  $stories = array();

  if ( $stmt->execute() ) {
    while ($row = $stmt->fetch()) {
      array_push($stories,
                 array("id" => $row["id"],
                       "descr" => $row["story_name"]));
    }
  }

  print json_encode(array("response" => "get_stories",
                          "body" => $stories));

 }

/*
 * GET_STORY
 */

if (action("get_story")) {
  if (!isset($_POST["story_id"])) {
    return;
  }

  $stmt = $db->prepare("SELECT id, story_name FROM stories WHERE id = ?");
  $stmt->execute(array($_POST["story_id"]));



 }

/*
 * GET_SCENARIO
 */

if (action("get_scenario")) {
  // if (!isset($_POST['scenario_id'])) {return;}
  $stmt = $db->prepare("SELECT scenarios.id, story_id, bodies.text FROM scenarios, bodies WHERE scenario_body_id = bodies.id AND scenarios.id = ?");

  $stmt->execute(array($_POST['scenario_id']));

  $row = $stmt->fetch();
  $scenarios = array("id" => $row["id"],
                     "descr" => $row["text"],
                     "responses" => getResponses($row["id"]));

  print json_encode(array("response" => "get_scenario",
                          "body"     => $scenarios));

 }

/*
 * GET_SCENARIOS
 */

if (action("get_scenarios")) {

  print json_encode(array("response" => "get_scenarios",
                          "body"     => getStoryScenarios($_POST["story_id"]),
                          "id"       => $_POST["story_id"]));
 }

/*
 * GET_FACTS
 */

if (action("get_facts")) {
  if (isset($_POST["fact_id"])) {
    $fact_id = $_POST["fact_id"];
  }
  else {
    $fact_id = "ALL";
  }

  print json_encode(array("response" => "get_facts",
                          "body" => getFacts($fact_id)));

 }

/* 
 * GET_RESPONSES
 */

if (action("get_responses")) {
  if (!isset($_POST['scenario_id'])) {
    return;
  }
  $responses = getResponses($_POST['scenario_id']);

  print json_encode(array("response" => "get_responses",
                          "body"     => $responses));
 }

if (action("rename_story")) {

 }

/*
 * MOVE_SCENARIO
 */

if (action("move_scenario")) {
  if (!isset($_POST["story_id"]) || !isset($_POST["scenario_id"])) {
    return; // nothing to do
  }

  $stmt = $db->prepare("UPDATE scenarios SET story_id = :story_id WHERE id = :scenario_id");
  $stmt->execute(array(":story_id" => $_POST["story_id"],
                       ":scenario_id" => $_POST["scenario_id"]));

  print json_encode(array("response" => "get_responses",
                          "body"     => "OK"));

 }

/*
 * UPDATE_SCENARIO
 */

if (action("update_scenario")) {

  if ($_POST["scenario_id"] == "null") return;

  // update body text
  $stmt = $db->prepare("UPDATE scenarios INNER JOIN bodies ON scenarios.scenario_body_id = bodies.id SET text = ? WHERE scenarios.id = ?");
  $stmt->execute(array($_POST["scenario_text"], $_POST["scenario_id"]));

  // update responses
  $responses = json_decode($_POST["responses"]);
  foreach ($responses as $response) {
    setResponse($response->id,
                $_POST["scenario_id"],
                $response->text,
                $response->consequence,
                $response->fact);
  }

  print json_encode(array("response" => "update_scenario",
                          "body" => "OK"));
 }

/*
 * DELETE_STORY
 */
if (action("delete_story")) {
  if (!isset($_POST["story_id"])) {
    return;
  }

  if (intval($_POST["story_id"]) == 1) {
    print json_encode(array("response" => "delete_story",
                            "body" => "WILL NOT DELETE DEFAULT STORY"));
  }
  else {
    removeStory($_POST["story_id"]);

    print json_encode(array("response" => "delete_story",
                            "body" => array("id" => $_POST["story_id"])));
  }
 }

/*
 * Output some debugging information if no ACTION has been posted.
 */

if (!isset($_POST['action'])) {
  print "print_r(_POST):\n";
  print_r($_POST);
  print "print_r(_GET):\n";
  print_r($_GET);
  return;
 }

/* QUERIES AND INSERTS
   INSERT INTO stories (id, story_name, start_screen_body_id, end_screen_body_id, first_scenario_id)
   VALUES (NULL, $story_name, ..., ..., ...);

   INSERT INTO facts (id, fact_body)
   VALUES (NULL, $fact_body);

   INSERT INTO bodies (id, text)
   VALUES (NULL, ...);

   INSERT INTO scenarios (id, story_id, scenario_body_id)
   VALUES (NULL, ..., ...,);

   INSERT INTO responses (id, response_text, response_fact_id, parent_scenario_id, response_consequence_scenario_id)
   VALUES (NULL, ..., ..., ..., ...);

   SELECT *
   FROM stories;

   SELECT st.id, st. story_name, sc.scenario_body_id
   FROM stories st, scenarios sc
   WHERE st.id = sc.story_id
   AND $id = st.id;	//include responses?

   SELECT is_starting_scenario, parent_story, bo.text, re.response_text, re.response_consequence_scenario_id, re.response_fact_id, fa.fact_body
   FROM scenarios sc, bodies bo, responses re, facts fa
   WHERE $scenario_id = sc.id
   AND fa.id = bo.id
   AND re.id = bo.id;

   SELECT *
   FROM responses
   WHERE parent_scenario_id in (SELECT id
   FROM scenarios
   WHERE story_id = $story_id);



*/


?>