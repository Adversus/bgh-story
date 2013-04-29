<?PHP
header('Content-type: application/json');

include("admin/database.php");

if (!isset($_GET["story"])){
  $story_id = 1;
 }
 else {
   $story_id = $_GET["story"];
 }

if (isValidStory($story_id)) {



$story_scenarios = getStoryScenarios($story_id);

print json_encode(array("scenarios"      => $story_scenarios,
                        "facts"          => getFactsUsedInStory($story_id),
                        "start_screen"   => getStoryStartText($story_id),
                        "end_screen"     => getStoryEndText($story_id),
                        "start_scenario" => getStoryStartScenario($story_id)));

 }
 else{

   print json_encode(array("error" => "INVALID_STORY"));

}

?>
