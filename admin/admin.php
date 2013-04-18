<?PHP
header("Content-Type:text/plain");

// This variable holds our "database" until we get a real one. 
// later functions "query" this data for the admin page.
$scenarios = json_decode(
<<<EOJSON
[
    {"descr": "A friend says to you, \"You havent seemed like yourself lately.\"",
     "responses": [
         {"choice": "Carry on",
          "consequence": 1, 
          "factoid": [1]}, 
         {"choice": "Ackowledge a problem",
          "consequence":1,
          "factoid": []}
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

if (action("create_story")) {
  
}

if (action("create_scenario")) {

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