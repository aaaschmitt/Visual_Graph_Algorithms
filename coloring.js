//Utility for coloring nodes and edges.

//flashes a components color betweent the start color
// and a new color. leaves the componenet as its original color
var flash_time = 0;
var flash_int = 200;
var timeout_ids = [];

//id - name of node
//string - signal for type of color
//isEdge - boolean dentoting whether the object is an edge
//incr - boolean indicating whether to increment the event clock (allows for synchronour events)
//change - determines whether to change the node color
//Flashes the color of a node or edge
function flash_color(id, string, isEdge, incr, change) {
	var color_flash = "",
		start_color = "",
		num_flashes = 3;
	switch(string) {
		case "v": color_flash = "#33CC33";
					break;
		case "n": color_flash = "#FF0000";
					break;
		default:
			console.log("incorrect color string passed to flash_color()");
			return;
	}
	if (isEdge) {
		console.log("this edge's id is:" + id);
		start_color = document.getElementById(id).style.stroke
	} else {
		start_color = document.getElementById(id).style.fill
	}

	var temp_flash_time = flash_time;

	for (i=0; i<num_flashes; i++) {
		flash_time += flash_int;
		color(id, color_flash, isEdge);
		flash_time += flash_int;
		color(id, start_color, isEdge);
	}
	//change color to new value if set
	if(change) {
		console.log("changing color of node:" + id + " to " + color_flash);
		flash_time += flash_int;
		color(id, color_flash, isEdge);
	}
	//restore flash_time to starting value so we can have synchronous events if set
	if (!incr) {
		flash_time = temp_flash_time;
	}
}


//Colors a node or edge in graph based on whether it is up next, 
//it has aleady been visited, or the value it starts as
//visited - green - #33CC33
//next - red - #FF0000
//start - whatever start color is set to
function color(id, color, isEdge) {
	var attr = "";
	if (isEdge) {
		attr = "stroke : "
	} else {
		attr = "fill : "
	}
	timeout_ids.push ( setTimeout(function() { document.getElementById(id).setAttribute("style", attr + color); }, flash_time) );
}

// grabs a node and changes its text value
function change_node_text(id, text) {
	flash_time += 3 * flash_int;
	timeout_ids.push( setTimeout(function() { document.getElementById("node_text:" + id).innerHTML = text; }, flash_time) );
}

//clears all currently running timeout events and restes the timeout_ids array
function clear_events() {
	for (i=0; i<timeout_ids.length; i++) {
		clearTimeout(timeout_ids[i]);
	}
	timeout_ids	= [];
}