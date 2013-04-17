var adminURL = "http://gimli.morningside.edu/~meyersh/bgh/admin/admin.php";

var numResponses = 0; // we start with one response initially. 

window.onload = function () {
    /* Initialize page onLoad. */
    setConsequenceOptions(document.getElementById("consequences_for_scenarios"));
    createResponseForm(); // add response 0 to a blank/fresh scenario



    // ALL consequences / scenario dropdowns available at:
    // document.getElementsByName("consequence_dropdown") and
    // document.getElementsByName("scenarios_dropdown")

    // ALL fact dropdowns available at document.getElementsbyName("fact_dropdown");
    

};

/*
 * END of window.onload stuff. 
 */

var consequences = [{id: 0, 'descr':'A friend says to you, ...'},
                    {id: 1, 'descr': 'You spend all night worrying, ...'}];

var facts = [{id: 0, 'descr': "You know, 2 out of 3 facts are..."},
             {id: 1, 'descr': "8 out of 10 dentists agree, ..."}];


function newOption(value, text) {
    /* Create and return a new option element with value `value` and
     * text `text` */
    var new_option = document.createElement("option");
    new_option.value = value;
    new_option.innerHTML = text;
    return new_option;
}

function createNewConsequence() {
    /* Called by dropdown "onChange" handler, so we have to be a
     * little clever about identifying what we actually are. */

    // `this` is the select, obj is the selected option.
    var obj = this.options[this.selectedIndex];

    if (this.value != "new") 
        return;

    var responseid = this.id.replace("consequences_for_", "");
    console.log("responseid: " + this.id);

    var responseValue = document.getElementById(responseid).value;

    console.log("Creating generic new scenario as a 'consequence' for response #" + responseid +  ".");
    console.log("Default text: 'Response to " + responseValue + "'");
    console.log("Now, regenerate all consequence dialogs...");
    
}

function createNewFact() {
    /* Called by "fact" selector dropdown onChange. */

    if (this.value != "new")
        return;

    var response_id = this.id.replace("facts_for_", "");
    console.log("Creating new dropdown for " + document.getElementById(response_id).value);
    return;
}

function clearForms() {
    /* Clear the page input forms out: body_text and responseForms. */
    clearResponses();
    tinyMCE.get("body_text").setContent("")
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
    }
    if (obj.name == "scenarios_dropdown") {
        obj.add(newOption("null", "Choose a scenario to edit"));
        obj.add(newOption("new", "Create a new scenario"));
    }


    // add all imported consequences
    for (var i = 0; i < consequences.length; i++) {
        var c_text = consequences[i].id + " - " + consequences[i].descr;
        obj.add(newOption(consequences[i].id, c_text));
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
}


function createResponseForm(responseText, consequenceId) {
    /* create a new form-row to handle a new response. */

    var div = document.getElementById("responses");

    var new_label                = document.createElement("label");
    var new_response_textbox     = document.createElement("input");
    var new_consequence_dropdown = document.createElement("select");
    var new_fact_dropdown        = document.createElement("select");
    var new_delete_button        = document.createElement("input");
    var new_br                   = document.createElement("br");

    var new_responseid = "response" + numResponses;

    new_label.appendChild(document.createTextNode("Response " + numResponses + ": "));
    new_label.for = new_responseid;

    new_response_textbox.id          = new_responseid;
    new_response_textbox.name        = "response_textbox";
    new_response_textbox.value       = responseText ? responseText : "";
    new_response_textbox.placeholder = responseText || new_responseid + " text";
    new_response_textbox.required    = true;

    new_consequence_dropdown.id       = "consequences_for_" + new_responseid;
    new_consequence_dropdown.name     = "consequence_dropdown";
    new_consequence_dropdown.onchange = createNewConsequence;

    new_fact_dropdown.id              = "facts_for_" + new_responseid;
    new_fact_dropdown.name            = "fact_dropdown";
    new_fact_dropdown.onchange        = createNewFact;

    new_delete_button.type = "button";
    new_delete_button.value = "Delete this Response";
    new_delete_button.onclick = function() {
        div.removeChild(new_label);
        div.removeChild(new_response_textbox);
        div.removeChild(new_consequence_dropdown);
        div.removeChild(new_delete_button);
        div.removeChild(new_br);
        //TODO: add ajax delete call here.
        //TODO: Handle re-indexing responses here.
    }

    div.appendChild(new_label);
    div.appendChild(new_response_textbox);
    div.appendChild(new_consequence_dropdown);
    div.appendChild(new_fact_dropdown);
    div.appendChild(new_delete_button);
    div.appendChild(new_br);

    setConsequenceOptions(new_consequence_dropdown);
    setFactOptions(new_fact_dropdown);

    console.log("Creating response #" + numResponses);
    numResponses++;
}

function loadStory(obj) {
    /* This is the onChange handler for the stories dropdown.
       obj.value is one of "null", "new", or the story ID (int) */
    if (obj.value != "new") 
        return; // abort until we know how to load

    // TODO: add story loading code.

    var new_name = prompt("New story name:");

    // TODO: Sanitize name
    new_name = new_name.replace(" ", "");

    console.log("Creating STORY: '" + new_name + "'");
}

function loadScenario() {
    /* Called by onChange from consequences_for_scenarios. */
    var obj = document.getElementById("consequences_for_scenarios");

    if (obj.value == "null") 
        return;

    if (obj.value == "new") {
        console.log("Creating a new consequence!");
        clearForms();
        createResponseForm();
        return;
    }

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
                     return
                 }

                 /* Populate all needed response forms */
                 for (var i = 0; i < scenario.responses.length; i++) {
                     createResponseForm(scenario.responses[i].choice, scenario.responses[i].consequence);
                 }

                 tinyMCE.get("body_text").setContent(scenario.descr);
             });
}

function responseJson() {
    /* Generate the json string representing all responses. */
    //TODO: Error checking

    var responses = [];

    var response_textboxes = document.getElementsByName("response_textbox");
    for (var i = 0; i < response_textboxes.length; i++) {
        var response_id = response_textboxes[i].id;
        var response    = {};
        var consequence = document.getElementById("consequences_for_" + response_id).value;
        var fact        = document.getElementById("facts_for_" + response_id).value;

        response.text = document.getElementById(response_id).value;

        response.consequence = consequence;
        response.fact        = fact != "null" ? fact : null;

        responses.push(response);
    }

    return JSON.stringify(responses);
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
