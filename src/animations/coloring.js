/* Utility for coloring nodes and edges and writing text to elements. 
 *
 * NOTE:
 * Every animation that is defined here should return 
 * the time it took to complete the animation in ms.
 */

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
 * node_id - id of node
 * color - color to flash to
 * change - true iff the node color should change at the end of the animation
 */
function flashColorAndResizeNode(node_id, startColor, color, change) {

	var animationTime = 0;

	//flash colors
	for (i=0; i<NUM_FLASHES; i++) {
		animationTime += colorAndResizeNode(node_id, color, animationTime,  NEW_NODE_RADIUS);
		animationTime += colorAndResizeNode(node_id, startColor, animationTime, START_NODE_RADIUS);
	}

	//change color to new value if set
	if (change) {
		animationTime += colorNode(node_id, color, animationTime);
	}

	return animationTime;
}

/**
 * Colors a node using a smooth d3 transition.
 *
 * @params
 * node_id - id of node
 * color - color to transition to
 */
function colorNode(node_id, color, delay) {
	d3.select("#" + node_id)
			.transition()
			 .style("fill", color)
			 .duration(FLASH_INT)
			 .delay(delay);

	return FLASH_INT;
}

/**
 * Colors a node and also changes its radius
 * using a smooth d3 transition.
 *
 * @params
 * node_id - id of node
 * color - color to transition to
 * radius - radius to transition to
 */
function colorAndResizeNode(node_id, color, delay, radius) {
	d3.select("#" + node_id)
		.transition()
		 .style("fill", color)
		 .attr("r", radius)
		 .duration(FLASH_INT)
		 .delay(delay);

	return FLASH_INT;
}

/**
 * Changes a node's text.
 */
function changeNodeText(node_id, text) {
	d3.select("#node_text-" + node_id).html(text);
}

/****************
 * EDGE EFFECTS *
 ****************/

/**
 * Flashes the size and color of an edge.
 *
 * @params
 * edge_id - id of edge
 * color - color to flash to
 * change - true iff the edge color should change at the end of the animation
 */
function flashColorAndResizeEdge(edge_id, startColor, color, change) {

	var animationTime = 0;

	//flash colors
	for (i=0; i<NUM_FLASHES; i++) {
		animationTime += colorAndResizeEdge(edge_id, color, animationTime, NEW_EDGE_STROKE_WIDTH);
		animationTime += colorAndResizeEdge(edge_id, startColor, animationTime, START_EDGE_STROKE_WIDTH);
	}

	//change color to new value if set
	if (change) {
		animationTime += colorEdge(edge_id, color, animationTime);
	}

	return animationTime;
}

/**
 * Colors an edge in d3 force graph using a smooth d3 transition.
 */
function colorEdge(edge_id, color, delay) {
	//edge path
	d3.select("#" + edge_id)
		.transition()
		 .style("stroke", color)
		 .duration(FLASH_INT)
		 .delay(delay);

	//edge pointer
	d3.select("#" + edge_id + "c")
		.transition("#" + edge_id + "c")
		 .style("fill", color)
		 .duration(FLASH_INT)
		 .delay(delay);

	return FLASH_INT;
}

/**
 * Colors an edge and it's pointer. Also changes the stroke-width
 * of the edge and pointer (necesitating a shift in the refX for the pointer).
 */
function colorAndResizeEdge(edge_id, color, delay, strokeWidth, markerRefX) {
	//edge path
	d3.select("#" + edge_id)
		.transition()
		 .style("stroke", color)
		 .style("stroke-width", strokeWidth)
		 .duration(FLASH_INT)
		 .delay(delay);

	//edge pointer
	d3.select("#" + edge_id + "c")
		.transition("#" + edge_id + "c")
		 .style("stoke-widith", strokeWidth)
		 .style("fill", color)
		 .attr("refX", markerRefX)
		 .duration(FLASH_INT)
		 .delay(delay);

	return FLASH_INT;
}

/****************
 * TREE EFFECTS *
 ****************/

/**
 * Flashes the size and color of a treeNode.
 *
 * @params
 * tree_id - id of node of the tree node
 * color - color to flash to
 * change - true iff the edge color should change at the end of the animation
 */
function flashColorAndResizeTreeNode (tree_id, startColor, color, change) {

	var animationTime = 0;

	for (i=0; i<NUM_FLASHES; i++) {
		animationTime += colorAndResizeTreeNode (tree_id, color, animationTime, NEW_TREE_NODE_WIDTH, NEW_TREE_NODE_HEIGHT);
		animationTime += colorAndResizeTreeNode (tree_id, startColor, animationTime, START_TREE_NODE_WIDTH, START_TREE_NODE_HEIGHT);
	}

	//change color to new value if set
	if (change) {
		animationTime += colorNode(tree_id, color, animationTime);
	}

	return animationTime;
}

/**
 * Colors a rectangular node and also changes its width and height
 * using a smooth d3 transition.
 */
function colorAndResizeTreeNode (tree_id, color, delay, width, height) {
	d3.select("#" + tree_id)
		.transition()
		 .style("fill", color)
		 .attr("width", width)
		 .attr("height", height)
		 .duration(FLASH_INT)
		 .delay(delay);

	return FLASH_INT;
}

/**
 * Sets the text for a nodes data attribute to a new value.
 */
function setTreeNodeDataValue(tree_id, value) {
	var text = DATA_NAME + ": " + String(value);
	d3.select("#data_text_" + tree_id).html(text);
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