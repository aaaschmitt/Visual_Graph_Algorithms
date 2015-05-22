/* Utility for coloring nodes and edges. */

var flash_time = 0;
var flash_int = 200;
var timeout_ids = [];

/**
 * Flashes the color of a node or edge:
 *
 * @params
 * id - name of node
 * color - color to flash to
 * isEdge - boolean dentoting whether the object is an edge
 * incr - boolean indicating whether to increment the event clock (allows for synchronous events)
 * change - determines whether to change the node color
 */
function flash_color(id, new_color, isEdge, incr, change) {
	var color_flash = new_color,
		start_color = "",
		num_flashes = 3;
		element = document.getElementById(id);
	if (isEdge) {
		start_color = window.getComputedStyle(element, null).getPropertyValue("stroke");
	} else {
		start_color = window.getComputedStyle(element, null).getPropertyValue("fill");
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
		flash_time += flash_int;
		color(id, color_flash, isEdge);
	}
	//restore flash_time to starting value so we can have synchronous events if set
	if (!incr) {
		flash_time = temp_flash_time;
	}
}


/**
 * Colors a node or edge in graph based on whether it is up next, 
 * it has aleady been visited, or the value it starts as
 * visited - green - #33CC33
 * next - red - #FF0000
 * start - whatever start color is set to
 */
function color(id, color, isEdge) {
	var attr = "";
	if (isEdge) {
		timeout_ids.push ( setTimeout(function() { document.getElementById(id).setAttribute("style", "stroke: " + color); }, flash_time) );
		timeout_ids.push ( setTimeout(function() { document.getElementById(id + "c").setAttribute("style", "fill: " + color); }, flash_time) );
	} else {
		attr = "fill : ";
		timeout_ids.push ( setTimeout(function() { document.getElementById(id).setAttribute("style", "fill: " + color); }, flash_time) );
	}
}

/**
 * Changes a node's text. 
 * If INCR is false do not change the clock
 */
function change_node_text(id, text, incr) {
	if (incr) {
		flash_time += 3 * flash_int;
	}
	timeout_ids.push( setTimeout(function() { document.getElementById("node_text:" + id).innerHTML = text; }, flash_time) );
}

/**
 * Clears all currently running timeout events
 * and restes the timeout_ids array
 */
function clear_events() {
	for (i=0; i<timeout_ids.length; i++) {
		clearTimeout(timeout_ids[i]);
	}
	timeout_ids	= [];
}