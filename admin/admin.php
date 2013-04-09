<?PHP
header("Content-Type:text/plain");

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

if (!isset($_GET['action'])) {
  print "_POST:\n";
  print_r($_POST);
  print json_encode($_POST);
  return;
}

if ($_GET['action'] == "get_scenarios") {

  print json_encode(array("response" => "get_scenarios",
                          "body"     => $scenarios));
}

if ($_GET['action'] == "get_scenario") {
 if (!isset($_GET['scenario_id'])) {return;}

 print json_encode(array("response" => "get_scenario",
                         "body"     => $scenarios[$_GET['scenario_id']]));
}

if ($_GET['action'] == "get_responses") {
  if (!isset($_GET['scenario_id'])) {
    return;
  }

  print json_encode(array("response" => "get_responses",
                          "body"     => $scenarios[$_GET['scenario_id']]["responses"]));
}

?>