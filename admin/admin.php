<?PHP
header("Content-Type:text/plain");

include("database.php");

// This variable holds our "database" until we get a real one. 
// later functions "query" this data for the admin page.
$scenarios = json_decode(
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
,true);

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
  /* Undefined behavior: duplicate story names. */

 if (!isset($_POST["story_name"])) {
   return; // TODO: error handling
 }

 // Insert story row
 $stmt = $db->prepare("INSERT INTO STORIES (story_name) VALUES (?)");
 $stmt->execute($_POST["story_name"]);

 // return story_id
   print json_encode(array("response" => "create_story",
                           "body" => array("story_id" => $db->lastInsertId())));
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
    $stmt->execute($story_id, $body_text);
  }
  else {
    $stmt = $db->prepare("INSERT INTO SCENARIOS (scenario_body) VALUES (?, ?)");
    $stmt->execute($body_text);
  }
  
  print json_encode(array("response" => "create_scenario",
                          "body" => array("scenario_id" => $db->lastInsertId())));
 }

if (action("create_fact")) {

 }

if (action("create_response")) {

}

if (action("get_stories")) {

}

if (action("get_story")) {

}

if (action("get_scenario")) {
// if (!isset($_POST['scenario_id'])) {return;}

 print json_encode(array("response" => "get_scenario",
                         "body"     => $scenarios[$_POST['scenario_id']]));
}

if (action("get_scenarios")) {

  print json_encode(array("response" => "get_scenarios",
                          "body"     => $scenarios));
}

if (action("get_fact")) {

}

if (action("get_responses")) {
  if (!isset($_POST['scenario_id'])) {
    return;
  }

  print json_encode(array("response" => "get_responses",
                          "body"     => $scenarios[$_GET['scenario_id']]["responses"]));
}

if (action("rename_story")) {

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

?>