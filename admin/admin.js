var numResponses = 0; // we start with one response initially. 
var consequence_dropdowns = []; // This is populated at the end of the pageload.

var consequences = [{id: 0, 'descr':'A friend says to you, ...'},
                    {id: 1, 'descr': 'You spend all night worrying, ...'}];




function newOption(value, text) {
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


function setConsequenceOptions(obj) {
/* Request (ajax / etc) the present consequences, prepend two generic
 * "null" and "new" options, and return an element set. */

    // get the current selection
    var current_value = obj.value;
    
    // clear the options
    obj.options.length = 0;

    // Insert std options
    obj.add(newOption("null", "Choose a consequence"));
    obj.add(newOption("new", "Create a new consequence"));

    // add all imported consequences
    for (var i = 0; i < consequences.length; i++) {
        var c_text = consequences[i].id + " - " + consequences[i].descr;
        obj.add(newOption(consequences[i].id, c_text));
    }


    
    
}

function createResponseForm(responseText, consequenceId) {
    /* create a new form-row to handle a new response. */

    /*TODO: Handle responseText and consequenceId to handle loading
     * saved responses. */

    var div = document.getElementById("responses");

    var new_label                = document.createElement("label");
    var new_response_textbox     = document.createElement("input");
    var new_consequence_dropdown = document.createElement("select");
    var new_delete_button        = document.createElement("input");
    var new_br                   = document.createElement("br");

    var new_responseid = "response" + numResponses;

    new_label.appendChild(document.createTextNode("Response " + numResponses + ": "));
    new_label.for = new_responseid;

    new_response_textbox.id    = new_responseid;
    new_response_textbox.name  = new_responseid;
    new_response_textbox.value = responseText || new_responseid;

    new_consequence_dropdown.id       = "consequences_for_" + new_responseid;
    new_consequence_dropdown.name     = "consequences_for_" + new_responseid;
    new_consequence_dropdown.onchange = createNewConsequence;

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
    div.appendChild(new_delete_button);
    div.appendChild(new_br);

    consequence_dropdowns.push(new_consequence_dropdown);
    setConsequenceOptions(new_consequence_dropdown);

    console.log("Creating response #" + numResponses);
    numResponses++;

}

function clearResponses() {
    /* Clear all response input forms and clear global counter. */

    var div = document.getElementById("responses");
    div.innerHTML = "";

    numResponses = 0;
}

function loadStory(obj) {
    if (obj.value != "new") 
        return; // until we know how to load

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
        clearResponses();
        createResponseForm();
        return;
    }

    console.log("Loading consequence " + obj.value);
    
}
