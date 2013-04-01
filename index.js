factoids=["Some fact", 
          "Many people say that...",
          "3 out of 4 dentists...",
          "etc",
          "blah"];

scenarios = [
    {"descr": "A friend says to you, 'You havent seemed like yourself lately.'",
     "responses": [{'choice': "Carry on",
                   'consequence': 0, 
                   'factoid': []}, 
                   {'choice': "Ackowledge a problem",
                   'consequence':1,
                   'factoid': []}]
    },
    {"descr": "At a restaurant, the waiter brings you your order. The food is udnercooked and possibly dangerous.",
    "responses": [{'choice': "Yell at the waitor until they cry",
                   'consequence': 1,
                   'factoid': []}, 
                  {'choice': "Don't say anything and eat the food.",
                   'consequence': 0,
                   'factoid': []},]
    }
    ];

function displayOnly(screen_name) {
    /* Iterate through all screens marking display=none, then flip on
     * display for `screen_name`. */
    screens = ["#start_screen","#end_screen", 
               "#scenario_screen", "#factoid_screen"];

    screen_name = "#" + screen_name; // add jquery class selector id.

    for (var i = 0; i < screens.length; i++) {
        if (screens[i] != screen_name)
            $(screens[i]).fadeOut(2000, function() {
                $(screen_name).fadeIn(2000);
            });
    }


}

function displayOnly1(screen_name) {
    /* Iterate through all screens marking display=none, then flip on
     * display for `screen_name`. */
    screens = ["start_screen","end_screen", 
               "scenario_screen", "factoid_screen"];

    for (var i = 0; i < screens.length; i++) {
        document.getElementById(screens[i]).style.display="none";
    }

    document.getElementById(screen_name).style.display="block";
}


function displayScenario(id) {
    /* Given a scenario id, pull it up and display the appropriate screen. */

    /* Toggle over-all visibility... */
    displayOnly("scenario_screen");
    
    console.log("displayScenario(" + id + ")");
    
    var scenario = scenarios[id];
    document.getElementById("scenario_description").innerHTML = 
        "id = " + id + " " + scenario.descr;

    var ul = document.getElementById("scenario_responses");

    /* Clear UL */
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }

    /*  Populate the UL. */
    var consequence = null;
    for (var i = 0; i < scenario.responses.length; i++) {

        consequence = scenario.responses[i].consequence;

        var new_element = document.createElement("li");

        new_element.appendChild(
            document.createTextNode(scenario.responses[i].choice 
                                    + "(" 
                                    + scenario.responses[i].consequence 
                                    + ")"));

        /* We have to do this so that a unique consequence id is bound
         * to each new_element.onclick handler.
         */ 
        var displayScenarioConsequence = function(c_id) {
            return function() {displayScenario(c_id);}
            };

        new_element.onclick = displayScenarioConsequence(consequence);

        ul.appendChild(new_element);

        console.log(scenario.responses[i].choice + " " 
                    + scenario.responses[i].consequence);
    }
    
}

function displayFactoid(f_id, next_destination) {
    /* Given a factoid id, pull it up and display the appropriate data.
       Use next_destination to set an "OK" button appropriately. */
    
    /* Toggle over-all visibility... */
    displayOnly("factoid_screen");

    // Display the text
    document.getElementById("factoid_text").innerHTML = factoids[f_id];

    new_button = document.createElement("button");
    new_button.innerHTML = "OK";
    new_button.onclick = function() {displayScenario(next_destination);};

    document.getElementById("factoid_screen").appendChild(new_button);
    
    
}


