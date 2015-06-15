/* Utility for coloring nodes and edges and writing text to elements. */

//timing controls
var FLASH_TIME = 0,
	FLASH_INT = 200,
	TIMEOUT_IDS = [],
	NUM_FLASHES = 3;

//Shape transition sizes
var NEW_NODE_RADIUS = 25,
	NEW_EDGE_STROKE_WIDTH = "5px",
	NEW_MARKER_REFX = 30,
	NEW_TREE_NODE_HEIGHT = 50
	NEW_TREE_NODE_WIDTH = 65;



/****************
 * NODE EFFECTS *
 ****************/

/**
 * Flashes the size and color of a node.
 *
 * @params
 * id - id of node
 * color - color to flash to
 * incr - boolean indicating whether to increment the event clock (allows for synchronous events)
 * change - determines whether to change the node color
 */
function flashColorAndResizeNode(id, newColor, incr, change) {
	var startColor = d3.select("#" + id).attr("cur_color");

	var temp_FLASH_TIME = FLASH_TIME;

	//flash colors
	for (i=0; i<NUM_FLASHES; i++) {
		FLASH_TIME += FLASH_INT;
		colorAndResizeNode(id, newColor, START_NODE_RADIUS, NEW_MARKER_REFX);
		FLASH_TIME += FLASH_INT;
		colorAndResizeNode(id, startColor, NEW_NODE_RADIUS, START_MARKER_REFX);
	}

	//change color to new value if set
	if (change) {
		FLASH_TIME += FLASH_INT;
		colorNode(id, newColor);
	}
	//restore FLASH_TIME to starting value so we can have synchronous events
	if (!incr) {
		FLASH_TIME = temp_FLASH_TIME;
	}
}

/**
 * Colors a node using a smooth d3 transition.
 * Updates the node's cur_color attribute to reflect color change.
 */
function colorNode(id, color) {
	TIMEOUT_IDS.push(setTimeout(function () {
			d3.select("#" + id)
				.transition()
				 .style("fill", color)
				 .duration(FLASH_INT);
		}, FLASH_TIME));
	d3.select("#" + id).attr("cur_color", color);
}

/**
 * Colors a node and also changes its radius
 * using a smooth d3 transition.
 */
function colorAndResizeNode(id, color, newRadius) {
	TIMEOUT_IDS.push(setTimeout(function () {
			d3.select("#" + id)
				.transition()
				 .style("fill", color)
				 .attr("r", newRadius)
				 .duration(FLASH_INT);
		}, FLASH_TIME));
	d3.select("#" + id).attr("cur_color", color);
}

/**
 * Changes a node's text. 
 * Increment FLASH_TIME iff incr is true. 
 */
function changeNodeText(id, text, incr) {
	if (incr) {
		FLASH_TIME += 2 * FLASH_INT;
	}
	TIMEOUT_IDS.push( setTimeout(function() { d3.select("#node_text-" + id).html(text); }, FLASH_TIME) );
}

/****************
 * EDGE EFFECTS *
 ****************/

/**
 * Flashes the size and color of an edge.
 *
 * @params
 * id - id of edge
 * color - color to flash to
 * incr - boolean indicating whether to increment the event clock (allows for synchronous events)
 * change - determines whether to change the edge color at the end of flashing
 */
function flashColorAndResizeEdge(id, newColor, incr, change) {
	var startColor = d3.select("#" + id).attr("cur_color");

	var temp_FLASH_TIME = FLASH_TIME;

	//flash colors
	for (i=0; i<NUM_FLASHES; i++) {
		FLASH_TIME += FLASH_INT;
		colorAndResizeEdge(id, newColor, NEW_EDGE_STROKE_WIDTH);
		FLASH_TIME += FLASH_INT;
		colorAndResizeEdge(id, startColor, START_EDGE_STROKE_WIDTH);
	}

	//change color to new value if set
	if (change) {
		FLASH_TIME += FLASH_INT;
		colorEdge(id, newColor);
	}
	//restore FLASH_TIME to starting value so we can have synchronous events
	if (!incr) {
		FLASH_TIME = temp_FLASH_TIME;
	}
}

/**
 * Colors an edge in d3 force graph using a smooth d3 transition.
 * Updates the edge's cur_color attribute to reflect color change.
 */
function colorEdge(id, color) {
	TIMEOUT_IDS.push(setTimeout(function () {
		d3.select("#" + id)
			.transition()
			 .style("stroke", color)
			 .duration(FLASH_INT);
		d3.select("#" + id + "c")
			.transition("#" + id + "c")
			 .style("fill", color)
			 .duration(FLASH_INT);
	}, FLASH_TIME));
	d3.select("#" + id).attr("cur_color", color);
}

/**
 * Colors an edge and it's pointer. Also changes the stroke-width
 * of the edge and pointer (necesitating a shift in the refX for the pointer).
 */
function colorAndResizeEdge(id, color, strokeWidth, markerRefX) {
	TIMEOUT_IDS.push(setTimeout(function () {
		d3.select("#" + id)
			.transition()
			 .style("stroke", color)
			 .style("stroke-width", strokeWidth)
			 .duration(FLASH_INT);
		d3.select("#" + id + "c")
			.transition("#" + id + "c")
			 .style("stoke-widith", strokeWidth)
			 .style("fill", color)
			 .attr("refX", markerRefX)
			 .duration(FLASH_INT);
	}, FLASH_TIME));
	d3.select("#" + id).attr("cur_color", color);
}

/****************
 * TREE EFFECTS *
 ****************/

/**
 * Flashes the size and color of a treeNode.
 *
 * @params
 * id - id of node (this function prepends 'treeNode' to the front)
 * color - color to flash to
 * incr - boolean indicating whether to increment the event clock (allows for synchronous events)
 * change - determines whether to change the node color
 */
function flashColorAndResizeTreeNode (id, newColor, incr, change) {
	var treeId = "treeNode" + id,
		startColor = d3.select("#" + treeId).attr("cur_color");

	var temp_FLASH_TIME = FLASH_TIME;

	for (i=0; i<NUM_FLASHES; i++) {
		FLASH_TIME += FLASH_INT+1;
		colorAndResizeTreeNode (treeId, newColor, NEW_TREE_NODE_WIDTH, NEW_TREE_NODE_HEIGHT);
		FLASH_TIME += FLASH_INT+1;
		colorAndResizeTreeNode (treeId, startColor, START_TREE_NODE_WIDTH, START_TREE_NODE_HEIGHT);
	}

	//change color to new value if set
	if (change) {
		FLASH_TIME += FLASH_INT+1;
		colorNode(treeId, newColor);
	}
	//restore FLASH_TIME to starting value so we can have synchronous events
	if (!incr) {
		FLASH_TIME = temp_FLASH_TIME;
	}
}

/**
 * Colors a rectangular node and also changes its width and height
 * using a smooth d3 transition.
 */
function colorAndResizeTreeNode (treeId, color, width, height) {
	TIMEOUT_IDS.push(setTimeout( function () {
			d3.select("#" + treeId)
				.transition()
				 .style("fill", color)
				 .attr("width", width)
				 .attr("height", height)
				 .duration(FLASH_INT);
		}, FLASH_TIME));
	d3.select("#" + treeId).attr("cur_color", color);
}

/*****************
 * DISPLAY UTILS *
 *****************/

/**
 * Clears all currently running timeout events
 * and resets the TIMEOUT_IDS array
 */
function clearEvents() {
	for (i=0; i<TIMEOUT_IDS.length; i++) {
		clearTimeout(TIMEOUT_IDS[i]);
	}
	TIMEOUT_IDS	= [];
}

/**
 * Flash a message on the screen. 
 *
 * @params
 * s - message string
 * alertStart - bootstrap alert color to flash first
 * alertEnd - bootstrap alert color that flash will end on (final state)
 */
function flash_info(s, alertStart, alertEnd) {
	var x = d3.select("#error");
	for (var j = 0; j < 4; j++) {
			FLASH_TIME += FLASH_INT/1.5;
			TIMEOUT_IDS.push( setTimeout( function() {
					  						x.attr("class", "alert alert-" + alertStart); 
								 			x.html ("<h3>" + s + "<h3>");
								 		  }, 
										FLASH_TIME)
							);

			FLASH_TIME += FLASH_INT/1.5;
			TIMEOUT_IDS.push( setTimeout( function() {
					  						x.attr("class", "alert alert-" + alertEnd); 
								 			x.html("<h3>" + s + "<h3>");
								 		  }, 
										FLASH_TIME)
							);
		}
}