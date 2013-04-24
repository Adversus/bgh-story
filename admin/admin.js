var adminURL = "http://fiery.morningside.edu/bgh/admin/admin.php";

var numResponses = 0; // we start with one response initially. 

window.onload = function () {
    /* Initialize page onLoad. */
    getScenarios();
    getStories();
    getFacts();
    createResponseForm(); // add response 0 to a blank/fresh scenario

    document.getElementById("delete_this_story_button").onclick = deleteThisStory;
    document.getElementById("stories_dropdown").onchange = storiesDropdownOnchange;
    document.getElementById("consequences_for_scenarios").onchange = scenarioOverviewDropdownOnchange;
    document.getElementById("move_scenario_dropdown").onchange = moveScenarioDropdownOnchange;

    // ALL consequences / scenario / fact dropdowns available at:
    // document.getElementsByName("consequence_dropdown") and
    // document.getElementsByName("scenarios_dropdown")
    // document.getElementsbyName("fact_dropdown");
};

/*
 * END of window.onload stuff. 
 */

var consequences = [{id: 1, 'descr':'A friend says to you, ...'},
                    {id: 2, 'descr': 'You spend all night worrying, ...'}];

var facts = [{id: 0, 'descr': "You know, 2 out of 3 facts are..."},
             {id: 1, 'descr': "8 out of 10 dentists agree, ..."}];

var stories = [];

function requestNewStory(story_name) {
    /* Make an ajax call requesting a new story. */
    var data = {"action": "create_story",
                "story_name": story_name};

    sendData2(data, adminURL, "POST", function (msg) {
        var stories_dropdown = document.getElementById("stories_dropdown");
        var body = JSON.parse(msg)["body"];
        console.log(body);
        
        // Update global stories list with new story. 
        stories.push(body);
        setStoryOptions(stories_dropdown);
        stories_dropdown.value = body.id;

    });
       
}

function getFacts() {
    /* Make an ajax call to retrieve the facts. */
    var data = {"action": "get_facts"};
    sendData2(data, adminURL, "POST", function (msg) {
        var body = JSON.parse(msg)["body"];
        console.log(body);

        // update global facts list
        facts = body;

        // refresh fact dropdowns
        var fact_dropdowns = document.getElementsByName("fact_dropdown");
        for (var i = 0; i < fact_dropdowns.length; i++) {
            setFactOptions(fact_dropdowns[i]);
        }
    });
    
}

function getStories() {
    /* Make an ajax call to retrieve the stories list. */
    var data = {"action": "get_stories"};
    sendData2(data, adminURL, "POST", function(msg) {
        var body = JSON.parse(msg)["body"];
        console.log(body);

        // Update global stories list
        stories = body;

        // Force refresh the stories_dropdowns
        setStoryOptions(document.getElementById("stories_dropdown"));
        setStoryOptions(document.getElementById("move_scenario_dropdown"));
    });
}

function getScenarios() {
    /* Make an ajax call to retrieve the scenarios for our current
     * story. */

    var current_story_selection = document.getElementById("stories_dropdown").value;
    
    var data = {"action": "get_scenarios",
                "story_id": "ALL"};

    if (current_story_selection != ""
        && current_story_selection != "null") {
        data.story_id = Number(current_story_selection);
    }

    
    sendData2(data, adminURL, "POST", function (msg) {
        var body = JSON.parse(msg)["body"];
        console.log(body);

        // Update global scenarios list
        consequences = body;

        // Force refresh all scenarios dropdowns.
        var scenario_dropdowns = document.getElementsByName("scenarios_dropdown");
        for (var i = 0; i < scenario_dropdowns.length; i++) {
            setConsequenceOptions(scenario_dropdowns[i]);
        }
    });
}

function selectOptionValues(obj) {
    /* Given a SELECT object, return an array of the OPTION
     * values. */
    var values = [];
    for (var i = 0; i < obj.options.length; i++)
        values.push(obj.options[i].value);

    return values;
}

function newOption(value, text) {
    /* Create and return a new option element with value `value` and
     * text `text` */
    var new_option = document.createElement("option");
    new_option.value = value;
    new_option.innerHTML = text;
    return new_option;
}

function clearForms() {
    /* Clear the page input forms out: body_text and responseForms. */
    clearResponses();
    tinyMCE.get("body_text").setContent("");
}

function clearResponses() {
    /* Clear all response input forms and clear global counter. */

    var div = document.getElementById("responses");
    div.innerHTML = "";

    numResponses = 0;
}

function setConsequenceOptions(obj) {
/* Request (ajax / etc) the present consequences, prepend two generic
 * "null" and "new" options, and return an element set. */

    // get the current selection
    var current_value = obj.value;
    
    // clear the options
    obj.options.length = 0;

    // Insert std options (choose description based on select name attribute)
    if (obj.name == "consequence_dropdown") {
        obj.add(newOption("null", "Choose a consequence"));
        obj.add(newOption("new", "Create a new consequence"));
        obj.add(newOption("-1", "End Screen"));
    }
    if (obj.name == "scenarios_dropdown") {
        obj.add(newOption("null", "Choose a scenario to edit"));
        obj.add(newOption("new", "Create a new scenario"));
    }


    // add all imported consequences
    for (var i = 0; i < consequences.length; i++) {
        var c_text = consequences[i].id + " - " + consequences[i].short;
        obj.add(newOption(consequences[i].id, c_text));
    }

    // Set value to old value if that is still possible.
    if (selectOptionValues(obj).indexOf(current_value) >= 0) {
        obj.value = current_value;
    }
}

function setFactOptions(obj) {
/* Request (ajax / etc) the present consequences, prepend two generic
 * "null" and "new" options, and return an element set. */

    // get the current selection
    var current_value = obj.value;
    
    // clear the options
    obj.options.length = 0;

    // Insert std options
    obj.add(newOption("null", "Choose a fact (NONE)"));
    obj.add(newOption("new", "Create a new fact"));

    // add all imported consequences
    for (var i = 0; i < facts.length; i++) {
        var c_text = facts[i].id + " - " + facts[i].descr;
        obj.add(newOption(facts[i].id, c_text));
    }

    // Set value to old value if that is still possible.
    if (selectOptionValues(obj).indexOf(current_value) >= 0) {
        obj.value = current_value;
    }
}

function setStoryOptions(obj) {
/* Request (ajax / etc) the present consequences, prepend two generic
 * "null" and "new" options, and return an element set. */

    // get the current selection
    var current_value = obj.value;
    
    // clear the options
    obj.options.length = 0;

    console.log("setStoryOptions: " + obj.id);

    // Insert std options
    if (obj.id == "move_scenario_dropdown") {
        obj.add(newOption("null", "Select a story to move scenario into"));
    }
    else {
        obj.add(newOption("null", "Displaying all stories"));
        obj.add(newOption("new", "Create a new story"));
    }

    // add all imported consequences
    for (var i = 0; i < stories.length; i++) {
        if (stories[i].id == Number(document.getElementById("stories_dropdown").value) 
            && obj.id == "move_scenario_dropdown") {
            /* Skip the current Story Id if this is the MOVE-TO dropdown box. */
            continue;
        }
        var c_text = stories[i].id + " - " + stories[i].descr;
        obj.add(newOption(stories[i].id, c_text));
    }

    // Set value to old value if that is still possible.
    if (selectOptionValues(obj).indexOf(current_value) >= 0) {
        obj.value = current_value;
    }
}

function createResponseForm(responseId, responseText, consequenceId, factId) {
    /* create a new form-row to handle a new response. */

    console.log("Creating response form responseID: " + responseId
                + " responseText: " + responseText 
                + " consequenceId: " + consequenceId
                + " factId: " + factId);

    var div = document.getElementById("responses");
    
    var new_label                = document.createElement("label");
    var new_hidden_id            = document.createElement("input");
    var new_response_textbox     = document.createElement("input");
    var condition                = (typeof responseText === "undefined");
    var new_consequence_dropdown = document.createElement("select");
    var new_fact_dropdown        = document.createElement("select");
    var new_delete_button        = document.createElement("input");
    var new_br                   = document.createElement("br");

    var new_responseid = "response" + numResponses;

    new_label.appendChild(document.createTextNode("Response " + numResponses + ": "));
    new_label.for = new_responseid;

    new_hidden_id.type               = "hidden";
    new_hidden_id.id                 = "id_for_" + new_responseid;
    new_hidden_id.name               = "response_id";
    new_hidden_id.value              = typeof responseId === "undefined" ? "" : responseId;

    new_response_textbox.id          = new_responseid;
    new_response_textbox.name        = "response_textbox";
    new_response_textbox.value       = responseText ? responseText : "";
    new_response_textbox.placeholder = new_responseid + " text";
    new_response_textbox.required    = true;
    new_response_textbox.oninput     = function () {
        /* Disable consequence & fact selection when textbox is empty. */
        var condition = new_response_textbox.value == "";

        new_fact_dropdown.disabled        = condition;
        new_consequence_dropdown.disabled = condition;
    };

    new_consequence_dropdown.id       = "consequences_for_" + new_responseid;
    new_consequence_dropdown.name     = "consequence_dropdown";
    new_consequence_dropdown.onchange = ScenarioDropdownOnchange;
    new_consequence_dropdown.disabled = condition;

    new_fact_dropdown.id              = "facts_for_" + new_responseid;
    new_fact_dropdown.name            = "fact_dropdown";
    new_fact_dropdown.onchange        = FactDropdownOnchange;
    new_fact_dropdown.disabled        = condition;

    new_delete_button.type = "button";
    new_delete_button.value = "Delete this Response";
    new_delete_button.onclick = function() {
        div.removeChild(new_label);
        div.removeChild(new_hidden_id);
        div.removeChild(new_response_textbox);
        div.removeChild(new_consequence_dropdown);
        div.removeChild(new_fact_dropdown);
        div.removeChild(new_delete_button);
        div.removeChild(new_br);
        //TODO: add ajax delete call here.
        //TODO: Handle re-indexing responses here.
    }

    div.appendChild(new_label);
    div.appendChild(new_hidden_id);
    div.appendChild(new_response_textbox);
    div.appendChild(new_consequence_dropdown);
    div.appendChild(new_fact_dropdown);
    div.appendChild(new_delete_button);
    div.appendChild(new_br);

    // populate drop-downs
    setConsequenceOptions(new_consequence_dropdown);
    setFactOptions(new_fact_dropdown);

    // pre-select an option if we're loading and the option exists
    if (typeof consequenceId != "undefined" && 
        selectOptionValues(new_consequence_dropdown).indexOf(String(consequenceId)) >= 0) {
        new_consequence_dropdown.value = consequenceId;
    }

    if (typeof factId != "undefined" && 
        selectOptionValues(new_fact_dropdown).indexOf(String(factId)) >= 0) {
        new_fact_dropdown.value = factId;
    }

    console.log("Creating response #" + numResponses);
    numResponses++;

}

function moveScenarioDropdownOnchange() {
    /* This handler is triggered when the "move_scenario_dropdown"
     * selection is changed. If the option is changed away from
     * "null", an ajax request should be made to move the scenario to
     * a new story. */

    var scenario_id = document.getElementById("consequences_for_scenarios").value;
    var story_id    = document.getElementById("move_scenario_dropdown").value;

    if (scenario_id == "null" || story_id == "null") {
        /* Nothing to do. Reset the selection */
        this.value = "null";
        return;
    }

    console.log("Moving scenario " + scenario_id + " to story " + story_id);

    var data = {"action": "move_scenario",
               "story_id": Number(story_id),
               "scenario_id": Number(scenario_id)};

    sendData2(data, adminURL, "POST", function(msg) {
        document.getElementById("stories_dropdown").value = story_id;
        getScenarios();
        getStories();
    });

    return;
}

function storiesDropdownOnchange() {
    /* This is the onChange handler for the stories dropdown.
       obj.value is one of "null", "new", or the story ID (int) */

    console.log(this);

    if (this.value == "new")  {
        // TODO: add story loading code.
        
        var new_name = prompt("New story name:");
        
        // TODO: Sanitize name
        new_name = new_name.replace(" ", "_");
        
        requestNewStory(new_name);

        console.log("Creating STORY: '" + new_name + "'");
    }

    // Disable the delete button when null or the DEFAULT story is selected.
    if (this.value == "null" || this.value == "1") {
        document.getElementById("delete_this_story_button").disabled = true;
    }
    else {
        document.getElementById("delete_this_story_button").disabled = false;
    }

    getScenarios();
    clearForms(); // Presently, clear the forms when stories are changed.
}

function scenarioOverviewDropdownOnchange() {
    /* Called by onChange from consequences_for_scenarios "scenario overview". */
    var obj = document.getElementById("consequences_for_scenarios");

    if (obj.value == "null") {
    }

    else if (obj.value == "new") {
        console.log("Creating a new consequence!");
        clearForms();
        createResponseForm();
    }

    else {
        console.log("Loading scenario " + obj.value);
        
        clearForms();
        
        data = {action: "get_scenario",
                scenario_id: obj.value};
        
        sendData2(data, 
                  adminURL,
                  "POST", function(msg) {
                      var scenario = JSON.parse(msg)["body"];
                      if (scenario == null) {
                          console.warn("Loaded null body.");
                          return;
                      }
                      
                      /* Populate all needed response forms */
                      for (var i = 0; i < scenario.responses.length; i++) {
                          createResponseForm(scenario.responses[i].id,
                                             scenario.responses[i].choice, 
                                             scenario.responses[i].consequence);
                      }
                      
                      tinyMCE.get("body_text").setContent(scenario.descr);
                  });
    }
    
    // Disable button when a scenario is not selected
    if (obj.value == "null") {
        document.getElementById("delete_this_scenario_button").disabled = true;
    }
    else {
        document.getElementById("delete_this_scenario_button").disabled = false;
    }
}

function ScenarioDropdownOnchange() {
    /* Called by dropdown "onChange" handler for consequence
     * dropdowns, so we have to be a little clever about identifying
     * what we actually are. */

    // `this` is the select, obj is the selected option.
    var obj = this.options[this.selectedIndex];

    if (this.value != "new") 
        return;

    var responseid = this.id.replace("consequences_for_", "");
    console.log("responseid: " + this.id);

    var responseValue = document.getElementById(responseid).value;

    console.log("Creating generic new scenario as a 'consequence' for response #" 
                + responseid +  ".");
    console.log("Default text: 'Response to " + responseValue + "'");
    console.log("Now, regenerate all consequence dialogs...");
    
}

function FactDropdownOnchange() {
    /* Called by "fact" selector dropdown onChange. */

    if (this.value != "new")
        return;

    var response_id = this.id.replace("facts_for_", "");
    console.log("Creating new dropdown for " + document.getElementById(response_id).value);
    return;
}

function deleteThisStory() {
    /* Delete the currently selected story (from
     * id="stories_dropdown") */

    var story = document.getElementById("stories_dropdown").value;

    if (story == "null" || story == "new") 
        return;

    story = Number(story); // Cast to integer

    console.log("Deleting story " + story);

    var data = {"action": "delete_story",
                "story_id": story};

    sendData2(data, adminURL, "POST", function (msg) {
        // No response, really, but refresh the stories.
        console.log(msg);
        getStories();
    });
    
}

function responses() {
    /* Generate the json string representing all responses. */
    //TODO: Error checking

    var responses = [];

    var response_textboxes = document.getElementsByName("response_textbox");
    for (var i = 0; i < response_textboxes.length; i++) {
        var response_num = response_textboxes[i].id; // responseN
        var response_id  = document.getElementById("id_for_" + response_num).value;
        var response    = {};
        var consequence = Number(document.getElementById("consequences_for_" + response_num).value);
        var fact        = document.getElementById("facts_for_" + response_num).value;

        if (response_id == "")
            response.id = null;
        else
            response.id = Number(response_id);

        if (fact == "null")
            fact = null;
        else
            fact = Number(fact);

        response.text = document.getElementById(response_num).value;

        response.consequence = consequence;
        response.fact        = fact;

        responses.push(response);
    }

    return responses;
}

function submit_scenario() {
    /* Package up and POST the details of the scenario as it is
     * displayed in the gui. */
    
    var data = {
        "scenario_id"   : null,
        "story_id"      : null,
        "scenario_text" : tinyMCE.get("body_text").getContent(),
        "responses"     : responses()
    };

    var scenario_id = document.getElementById("consequences_for_scenarios").value;
    var story_id    = document.getElementById("stories_dropdown").value;

    if (scenario_id != "null")
        data.scenario_id = Number(scenario_id);

    if (story_id != "null")
        data.story_id = Number(story_id);

    console.log(data);
    return data;
}

function testJson() {
/* Testing some submission code. This is pretty awesome. */

    var data = {json: JSON.stringify([1,2,3]),
                shaun: 1,
                mike: 2};

    data.nested = JSON.stringify(data);

    sendData2(data,
              adminURL,
              "POST", 
              null);
}
