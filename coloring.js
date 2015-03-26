//Utility for coloring nodes and edges.

//flashes a components color betweent the start color
// and a new color
function flash_color(id, isEdge) {
	var color_flash = "",
		start_color = "",
		num_flashes = 4;
	switch(string) {
		case "visited": color_flash = "#33CC33";
					break;
		case "next": color_flash = "#FF0000";
					break;
		default:
			console.log("incorrect color string passed to flash_color()");
			break;
	}
	if (isEdge) {
		start_color = document.getElementbyID(id).style.stroke
	} else {
		start_color = document.getElementsById(id).style.fill
	}
	for (i=0; i<num_flashes; i++) {
		color(id, flash_color, isEdge);
		setTimeout(color(id, start_color, isEdge), 500);
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
	document.getElementbyID(id).setAttribute("style", attr + color);
}