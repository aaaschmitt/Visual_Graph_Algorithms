//A tree display data structure using d3 cluster.

var tree = "",
	treeExists = false,
	isChanged = false,
	DATA_NAME = "",
	tree_title="",
	treeSvg;

var BORDER_COLOR = "#000000",
	START_TREE_NODE_COLOR = "#0066FF",
	START_TREE_NODE_WIDTH = 50,
	START_TREE_NODE_HEIGHT = 35;

var WIDTH = 600,
	HEIGHT = 600,
	Y_OFFSET = -15;

//A diagonal projection to draw links
var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.x, d.y-Y_OFFSET]; });


/**
 * Displays a new tree structure.
 * 
 * @params
 * dataVals - a dictionary mapping data names to their values
 * nodes_names - array of names of nodes. Is formated such that the children of a node
 * 		 		 are at locations left = (2*i+1) and right = (2*i+2)
 */
function setupTree(nodeNames, dataVals, title) {

	tree_title = title;
	
	if (nodeNames.length == 0) {
		return;
	}

	//clear previous tree and write title
	d3.select("#data-struct-title")
		.html(title)
		.attr("class", "alert alert-info");
	d3.select(".data-struct")
    	.html("");

	var rootName = nodeNames[0];

	//Compute nodes and set up children arrays
	var treeNodes = computeNodes(rootName, nodeNames, dataVals);
		
	//the root of the tree
	var root = treeNodes[rootName];

	//initialize the tree layout
	tree = d3.layout.tree()
			.size([HEIGHT-80, WIDTH-180]);
	
	//initialize nodes, links and comparator function
	var nodes = tree.nodes(root);
	var links = tree.links(nodes);
	tree.sort(compByIndex);
	nodes.sort(function(a,b) { return d3.ascending(a.name, b.name); });
	links.sort(function(a,b) { return d3.ascending(a.source.name, b.source.name); });

	//append the svg element. this is where stuff gets drawn
	treeSvg = d3.select("div.data-struct").append("svg:svg")
            .attr("WIDTH", WIDTH)
            .attr("HEIGHT", HEIGHT)
            .style("background" , CUR_BACKGROUND_COLOR)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 600 600")
            .attr("id", "svg-data-struct");

    //build paths (edges)
    var path = treeSvg.append("svg:g").attr("class", "treeLinkContainer").selectAll("path")
    			.data(links, function(d) { return d.source.name + "-" + d.target.name; })
    		.enter().append("svg:path")
    			.attr("d", diagonal)
    			.attr("class", "treeLink")
    			.style("stroke", START_EDGE_COLOR)
    			.style("stroke-WIDTH", START_EDGE_STROKE_WIDTH)
    			.style("fill", "none")
    			.attr("cur_color", START_EDGE_COLOR)
    			.attr("id", function(d) { return "treeLink" + d.source.name + d.target.name; });

    //draw rectangular nodes
    var elms = treeSvg.append("svg:g").attr("class", "treeNodeContainer").selectAll("rect")
    				.data(nodes, function(d) { return d.name; })
    			.enter().append("svg:rect")
    				.attr("class", "tree_node")
       				.attr("transform", function(d) { 
						return "translate(" + d.x + "," + String(d.y - Y_OFFSET) + ")"; 
					})
    				.attr("width", START_TREE_NODE_WIDTH)
    				.attr("height", START_TREE_NODE_HEIGHT)
    				.attr("x", -16)
    				.attr("y", -19)
    				.style("fill", START_TREE_NODE_COLOR)
    				.attr("cur_color", START_TREE_NODE_COLOR)
    				.attr("id", function(d) { return "tree_node" + d.name; });


    //initialzie and position text to be appended to the circles
    var text = treeSvg.append("svg:g").selectAll("g")
        .data(nodes, function(d) { return d.name; })
      .enter().append("svg:g")
      	.attr("class", "treeNodeTextContainer")
      	.attr("transform", function(d) {
			return "translate(" + d.x + "," + String(d.y - Y_OFFSET) + ")";
		})
      	.attr("id", function(d) { return "treeNodeTextContainer-" + d.name; });

    //append node names to svg circles
    text.append("svg:text")
    	.attr("x", "-.3em")
    	.attr("y", "-.1em")
    	.style("font-size", "15px")
    	.style("fill", CUR_TEXT_COLOR)
    	.text(function(d) {return d.name; })
    	.attr("class", "tree-node-text")
    	.attr("id", function(d) { return "tree_node_text-" + d.name; })

    //append the data value to the node on a new line
    text.append("svg:text")
        .attr("x", "-.9em")
        .attr("y", ".7em")
        .style("font-size", "15px")
        .style("fill", CUR_TEXT_COLOR)
        .text(function(d) { 
	    	var display_val = d.val;
	    	if (d.val === MAX_NUM) {
	    		display_val = INFINITY_TEXT;
	    	}
	    	return DATA_NAME + ": " + String(display_val); 
		 })
        .attr("class", "tree-node-data-text")
        .attr("id", function(d) {return "tree_node_data_text-" + d.name});

}

/**
 * Return the nodes (setting up parents and children) for the tree.
 *
 * @params
 * rootName - the name of the root node
 * nodeNames - an array of the names of the nodes in heap order
 * dataVals - an array of the data for each node indexed by each nodes name
 */
function computeNodes(rootName, nodeNames, dataVals) {

	var treeNodes = {},
		numNodes = nodeNames.length;

	treeNodes[rootName] = {name: rootName, parent: null, val: dataVals[rootName]};

	for (var i = 0; i < nodeNames.length; i++) {

		//get names of node and children
		var cur_node = treeNodes[nodeNames[i]],
		left_child_name = (2*i+1 < numNodes) ? nodeNames[2*i+1] : null,
		right_child_name = (2*i+2 < numNodes) ? nodeNames[2*i+2] : null;

		//index is used to sort children
		cur_node.index = i;

		//make children array
		cur_node.children = [];
		if (left_child_name) {
			var left_child = {name: left_child_name, parent: cur_node, val: dataVals[left_child_name]};
			treeNodes[left_child_name] = left_child;
			cur_node.children.push(left_child);
		}
		if (right_child_name) {
			var right_child = {name: right_child_name, parent: cur_node, val: dataVals[right_child_name]};
			treeNodes[right_child_name] = right_child;
			cur_node.children.push(right_child);
		}
	}

	return treeNodes;
}

/**
 * Update the current tree data structure.
 *
 * @params
 * nodes_names - array of names of nodes. Is formated such that the children of a node
 * 		 		 are at locations left = (2*i+s1) and right = (2*i+2)
 * dataVals - a dictionary mapping data entries to their values 
 * node - the node that changed in the tree
 * color - the color to flash the changed node to
 * deletedNode - the id of the node that was deleted from the heap
 */
function updateTree(nodeNames, dataVals, deletedNode) {
	console.log("tree update");
	//need to make copies of the current state
	var cur_names = [],
		cur_vals = {},
		temp;
	for (var i = 0; i < nodeNames.length; i++) {
		temp = nodeNames[i];
		cur_names.push(temp);
		cur_vals[temp] = dataVals[temp];
	}
	FLASH_TIME += FLASH_INT;
	TIMEOUT_IDS.push(setTimeout( function() { treeTransition(cur_names, cur_vals, deletedNode) }, FLASH_TIME ));
}

/**
 * Smoothly transition to a new tree structure.
 *
 * @params
 * nodes_names - array of names of nodes. Is formated such that the children of a node
 * 		 		 are at locations left = (2*i+1) and right = (2*i+2)
 * dataVals - a dictionary mapping data entries to their values
 */
function treeTransition(nodeNames, dataVals, deletedNode) {

	var rootName = nodeNames[0];

	newTreeNodes = computeNodes(rootName, nodeNames, dataVals);
	
	//the root of the tree
	var root = newTreeNodes[rootName];

	//initialize the new tree layout
	tree = d3.layout.tree()
			.size([HEIGHT-80, WIDTH-180]);
	
	//initialize nodes, links and comparator function
	var nodes = tree.nodes(root);
	var links = tree.links(nodes);
	tree.sort(compByIndex);
	nodes.sort(function(a,b) { return d3.ascending(a.name, b.name); });
	links.sort(function(a,b) { return d3.ascending(a.source.name, b.source.name); });

	//delete node and its text
	if (deletedNode) {
		var deletedNodeId = "tree_node" + deletedNode;

		treeSvg.select("#" + deletedNodeId)
			.transition()
				.duration(FLASH_INT)
				.attr("transform", "translate(" + 0 + ", " + WIDTH+40 + ")")
				.remove();

		treeSvg.select("#" + "treeNodeTextContainer-" + deletedNode)
			.transition()
				.duration(FLASH_INT)
				.attr("transform", "translate(" + 0 + ", " + WIDTH+40 + ")")
				.remove();
	}

	//move nodes to new positions
	treeSvg.selectAll(".tree_node").filter(function() { 
		return d3.select(this).attr("id") != deletedNodeId;
	})
		.data(nodes)
		.transition()
			.duration(FLASH_INT)
			.attr("transform", function(d) { 
				return "translate(" + d.x + "," + String(d.y - Y_OFFSET) + ")"; 
			   })

	var text = treeSvg.selectAll(".treeNodeTextContainer").filter(function() {
		return d3.select(this).attr("id") != "treeNodeTextContainer-" + deletedNode;
	})
		.data(nodes)
		.transition()
			.duration(FLASH_INT)
	      	.attr("transform", function(d) {
				return "translate(" + d.x + "," + String(d.y - Y_OFFSET) + ")";
			   });

	//remove old paths and then add the new ones
    var paths = treeSvg.selectAll(".treeLink")
    		.remove();

    var newPaths = treeSvg.select(".treeLinkContainer").selectAll("path")
	    		.data(links)
			.enter().append("svg:path")
				.attr("d", diagonal)
				.attr("class", "treeLink")
				.style("stroke", START_EDGE_COLOR)
				.style("stroke-WIDTH", START_EDGE_STROKE_WIDTH)
				.style("fill", "none")
				.attr("cur_color", START_EDGE_COLOR)
				.attr("id", function(d) { return "treeLink" + d.source.name + d.target.name; });
}

/**
 * Clears the current tree title and data structure.
 */
function clearTree() {
	d3.select("#data-struct-title")
		.html("")
		.attr("class", "");
	d3.select(".data-struct")
    	.html("");
}

/**
 * A custom comparator that sorts nodes by their index attribute
 */
function compByIndex(childA, childB) {
	return d3.ascending(childA.index, childB.index);
}