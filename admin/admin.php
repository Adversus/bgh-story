<?PHP
header("Content-Type:text/plain");

include("database.php");

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
  $story_id  = 1;

  if (isset($_POST["body_text"])) {
    $body_text = $_POST["body_text"];
  }

  if (isset($_POST["story_id"])) {
    $story_id = $_POST["story_id"];
  }

  $body_id = addBody($body_text);

  $stmt = $db->prepare("INSERT INTO scenarios (story_id, scenario_body_id) VALUES (?, ?)");
  $stmt->execute(array($story_id, $body_id));

  print json_encode(array("response" => "create_scenario",
                          "body" => array("scenario_id" => $db->lastInsertId(),
                                          "scenarios"   => getStoryScenarios($story_id))));
 }

/*
 * CREATE_FACT
 */

if (action("create_fact")) {
  $body_text = null;
  if (isset($_POST["body_text"])) {
    $body_text = $_POST["body_text"];
  }

  addFact($body_text);

  print json_encode(array("response" => "create_fact",
                          "body" => array("fact_id" => $db->lastInsertId(),
                                          "facts" => getFacts("ALL"))));

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

  $is_start = getStoryStartScenario( getScenarioStoryId( $_POST["scenario_id"]) ) == $_POST["scenario_id"];

  $stmt = $db->prepare("SELECT scenarios.id, story_id, bodies.text FROM scenarios, bodies WHERE scenario_body_id = bodies.id AND scenarios.id = ?");

  $stmt->execute(array($_POST['scenario_id']));

  $row = $stmt->fetch();
  $scenario = array("id" => $row["id"],
                    "descr" => $row["text"],
                    "start_screen" => $is_start,
                    "responses" => getResponses($row["id"]));

  print json_encode(array("response" => "get_scenario",
                          "body"     => $scenario));

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

/*
 * RENAME_STORY
 */

if (action("rename_story")) {
  $stmt = $db->prepare("UPDATE stories SET story_name = ? WHERE id = ?");
  $stmt->execute(array($_POST["story_name"], $_POST["story_id"]));

  print json_encode(array("response" => "rename_story",
                          "body"     => "OK"));


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
  $response_ids = array();
  foreach ($responses as $response) {

    // Skip invalid responses (with empty consequences)
    if ($response->consequence == NULL)
      continue;

    array_push($response_ids, $response->id);

    setResponse($response->id,
                $_POST["scenario_id"],
                $response->text,
                $response->consequence,
                $response->fact);
  }

  // delete any response-id not seen in the client submission from
  // this scenario.
  if (count($responses) == 0) {
    $stmt = $db->prepare("DELETE FROM responses WHERE parent_scenario_id = ?");
    $stmt->execute(array($_POST["scenario_id"]));
  }
  else {
    $qMarks = str_repeat('?,', count($response_ids) -1) . '?';
    $stmt = $db->prepare("DELETE FROM responses WHERE parent_scenario_id = ? AND id not in ($qMarks)");
    $stmt->execute(array_merge(array($_POST["scenario_id"]), $response_ids));
  }

  // Set start_scenario if flagged.
  if ($_POST["start_scenario"] == "true") {
    $stmt = $db->prepare("UPDATE stories SET first_scenario_id = ? WHERE id = ?");
    $stmt->execute(array($_POST["scenario_id"],
                         getScenarioStoryId($_POST["scenario_id"])));
  }


  print json_encode(array("response" => "update_scenario",
                          "body"     => "OK"));
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
 * DELETE_SCENARIO
 */

if (action("delete_scenario")) {
  if (!isset($_POST["scenario_id"])) return;

  // Delete the scenario
  $stmt = $db->prepare("DELETE FROM scenarios WHERE id = ?");
  $stmt->execute(array($_POST["scenario_id"]));

  // And all its response options. (orphaned scenarios are still intact)
  $stmt = $db->prepare("DELETE FROM responses WHERE parent_scenario_id = ?");
  $stmt->execute(array($_POST["scenario_id"]));

  print json_encode(array("response" => "delete_scenario",
                          "body" => "OK"));

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