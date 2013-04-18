factoids=[
    "When an important, but boring, project interfers with a passion there may be a strong temptation to put off what you should be doing.", 
    "It's not uncommon to try to just push-through after hearing a comment like this.",
    "Many people say that...",
    "3 out of 4 dentists...",
    "etc",
    "blah"
];

scenarios = [
    {"descr": "A friend says to you, 'You havent seemed like yourself lately.'",
     "responses": [
         {'choice': "Carry on",
          'consequence': 1, 
          'factoid': [1]}, 
         {'choice': "Ackowledge a problem",
          'consequence':1,
          'factoid': []}
     ]
    },
    {"descr": "At a restaurant, the waiter brings you your order. Broken glass has accidentally found its way into the meal and is possibly dangerous.",
     "responses": [
         {'choice': "Berate the waitor until they cry",
          'consequence': 2,
          'factoid': []}, 
         {'choice': "Don't say anything and eat the food trying to pick out the glass.",
          'consequence': 0,
          'factoid': [1]}
     ]
    }, 
    {"descr": "It's time to work on an important project. But, your favorite TV show is on.",
     "responses": [
         {'choice': "Ignore the project and watch TV.",
          'consequence': -1,
          'factoid': [0]}, 
         {'choice': "Do a sloppy job to get the project done quickly and return to your show.",
          'consequence': -1,
          'factoid': [1]}
     ]
    }
];

// Work-around for IE6 lack of console.log functionality.
if (!window.console) console = {log: function() {}};

function getScenario(id) {
    /* Given a scenario ID, retrieve that scenario object. This will
     * allow us some flexibility in how we store scenarios. */
    return scenarios[id];
}

function displayOnly(screen_name, callback) {
    /* Iterate through all screens marking display=none, then flip on
     * display for `screen_name`. `callback` may be null and is
     * executed while the animation is faded out. */
    screens = ["#start_screen","#end_screen", 
               "#scenario_screen", "#factoid_screen"];

    screen_name = "#" + screen_name; // add jquery class selector id.

    /* If the "next-screen" is already visible, fade it and execute
     * any callback, then fade it back. */
    if ($(screen_name).is(':visible')) {
        $(screen_name).fadeOut(1000, function() {
            if (callback) {callback();}
            $(screen_name).fadeIn(1000);
        }); 
    }
    else {
        if (callback) {callback();}
        for (var i = 0; i < screens.length; i++) {
            if (screens[i] != screen_name)
                $(screens[i]).fadeOut(1000, function() {
                    $(screen_name).fadeIn(1000);
                });
        }
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
    console.log("displayScenario(" + id + ")");
    

    
    function updateScenarioFields() {
        /* This function updates the fields of the scenario_screen */

        var scenario = getScenario(id);

        document.getElementById("scenario_description").innerHTML = 
            "<small>(id = " + id + ")</small> " + scenario.descr;

        var ul = document.getElementById("scenario_responses");

        /* Clear UL */
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }

        /*  Populate UL with available responses. */
        var response = null;
        for (var i = 0; i < scenario.responses.length; i++) {
            response = scenario.responses[i];

            var new_element = document.createElement("li");

            new_element.appendChild(
                document.createTextNode(response.choice 
                                        + "(" 
                                        + response.consequence 
                                        + ")"));

            /* We have to do this so that a unique consequence id is bound
             * to each new_element.onclick handler.
             */ 
            var displayScenarioConsequence = function(response) {
                if (response.factoid.length) {
                    return function () {displayFactoid(response.factoid[0], response.consequence);};
                }
                else {
                    return function() {displayScenario(response.consequence);};
                }
            };

            new_element.onclick = displayScenarioConsequence(response);

            ul.appendChild(new_element);

            console.log(" Consequence map " + response.choice + " -> c_id #" + response.consequence);
        }
    }

    /* Toggle over-all visibility passing in a callback to update the
     * data while the animation is faded.... */
    if (id == -1) {
        displayOnly("end_screen");
    }
    else {
        displayOnly("scenario_screen", updateScenarioFields);
    }
}

function displayFactoid(f_id, next_destination) {
    /* Given a factoid id (f_id), pull it up and display the appropriate data.
       Use next_destination to set an "OK" button appropriately. */
    
    /* Toggle over-all visibility... */
    displayOnly("factoid_screen");

    // Display the text
    document.getElementById("factoid_text").innerHTML = factoids[f_id];

    //    new_button = document.createElement("button");
    //    new_button.innerHTML = "OK";
    //    document.getElementById("factoid_screen").appendChild(new_button);

    document.getElementById("factoid_ok_button").onclick = function() {displayScenario(next_destination);};
    console.log("displayFactoid " + f_id + ", " + next_destination );
    
    console.log("Updated button. Next visit consequence #" + next_destination);
    
}


