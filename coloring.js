//Utility for coloring nodes and edges.

//flashes a components color betweent the start color
// and a new color. leaves the componenet as its original color
var flash_time = 100;
var flash_int = 100;

function flash_color(id, string, isEdge) {
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
			break;
	}
	if (isEdge) {
		start_color = document.getElementById(id).style.stroke
	} else {
		start_color = document.getElementById(id).style.fill
	}
	console.log(isEdge);
	console.log(start_color);
	for (i=0; i<num_flashes; i++) {
		color(id, color_flash, isEdge);
		flash_time += flash_int;
		color(id, start_color, isEdge);
		flash_time += flash_int;
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
	setTimeout(function() { document.getElementById(id).setAttribute("style", attr + color); }, flash_time);
	flash_time += flash_int;
}

// grabs a node and changes its text value
function change_node_text(id, text) {
	setTimeout(function() { document.getElementById("node_text:" + id).innerHTML = text; }, flash_time);
	flash_time += flash_int;
}