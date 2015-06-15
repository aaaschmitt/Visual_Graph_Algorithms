//A tree display data structure using d3 cluster.

var tree = "",
	treeExists = false,
	isChanged = false,
	tree_nodes = {},
	DATA_NAME = "",
	tree_title="";

var BORDER_COLOR = "#000000",
	START_TREE_NODE_COLOR = "#0066FF",
	START_TREE_NODE_WIDTH = 50,
	START_TREE_NODE_HEIGHT = 35;

/**
 * Displays a new tree structure.
 * 
 * @params
 * data_vals - a dictionary mapping data names to their values
 * nodes_names - array of names of nodes. Is formated such that the children of a node
 * 		 		 are at locations left = (2*i+1) and right = (2*i+2)
 */
function setup_tree(node_names, data_vals, title) {

	tree_title = title;
	var num_nodes = node_names.length;

	//clear previous tree and write title
	d3.select("#data-struct-title")
		.html(title)
		.attr("class", "alert alert-info");
	d3.select(".data-struct")
    	.html("");

    if (num_nodes == 0) {
		return;
	}

	//Compute nodes and set up children arrays
	tree_nodes = {};

	var root_name = node_names[0];

	tree_nodes[root_name] = {name: root_name, parent: null, val: data_vals[root_name]};

	for (var i = 0; i < num_nodes; i++) {

		//get names of node and children
		var cur_node = tree_nodes[node_names[i]],
		left_child_name = (2*i+1 < num_nodes) ? node_names[2*i+1] : null,
		right_child_name = (2*i+2 < num_nodes) ? node_names[2*i+2] : null;

		//index is used to sort children
		cur_node.index = i;

		//make children array
		cur_node.children = [];
		if (left_child_name) {
			var left_child = {name: left_child_name, parent: cur_node, val: data_vals[left_child_name]};
			tree_nodes[left_child_name] = left_child;
			cur_node.children.push(left_child);
		}
		if (right_child_name) {
			var right_child = {name: right_child_name, parent: cur_node, val: data_vals[right_child_name]};
			tree_nodes[right_child_name] = right_child;
			cur_node.children.push(right_child);
		}
	}

	
	var width = 600,
		height = 600,
		Y_OFFSET = -15;
	
	//the root of the tree
	var root = tree_nodes[root_name];

	//initialize the cluster layout
	tree = d3.layout.tree()
			.size([height-80, width-180]);
	
	//initialize nodes, links and comparator function
	var nodes = tree.nodes(root);
	var links = tree.links(nodes);
	tree.sort(compByIndex);

	//append the svg element. this is where stuff gets drawn
	var svg = d3.select("div.data-struct").append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .style("background" , CUR_BACKGROUND_COLOR)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 600 600")
            .attr("id", "svg-data-struct");

    //A diagonal projection to draw links
    var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y-Y_OFFSET]; });

    //build paths (edges)
    var path = svg.append("svg:g").selectAll("path")
    			.data(links)
    		.enter().append("svg:path")
    			.attr("d", diagonal)
    			.attr("class", "treeLink")
    			.style("stroke", START_EDGE_COLOR)
    			.style("stroke-width", START_EDGE_STROKE_WIDTH)
    			.style("fill", "none")
    			.attr("cur_color", START_EDGE_COLOR)
    			.attr("id", function(d) { return "treeLink" + d.source.name + d.target.name; });

    var elms = svg.append("svg:g").selectAll("rect")
    				.data(nodes)
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
    				.attr("id", function(d) { return "treeNode" + d.name; });


    //initialzie and position text to be appended to the circles
    var text = svg.append("svg:g").selectAll("g")
        .data(nodes)
      .enter().append("svg:g")
      	.attr("transform", function(d) {
            				return "translate(" + d.x + "," + String(d.y - Y_OFFSET) + ")";
						   });

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
        .attr("class", "tree-node-text")
        .attr("id", function(d) {return "tree_node_data_text-" + d.name});

}

/**
 * Update the current tree data structure.
 *
 * @params
 * nodes_names - array of names of nodes. Is formated such that the children of a node
 * 		 		 are at locations left = (2*i+1) and right = (2*i+2)
 * data_vals - a dictionary mapping data entries to their values 
 * node - the node that changed in the tree
 * color - the color to flash the changed node to
 */
function update_tree(node_names, data_vals, node, color) {
	//need to make copies of the current state
	var cur_names = [],
		cur_vals = {},
		temp;
	for (var i = 0; i < node_names.length; i++) {
		temp = node_names[i];
		cur_names.push(temp);
		cur_vals[temp] = data_vals[temp];
	}
	TIMEOUT_IDS.push(setTimeout( function() { tree_transition(cur_names, cur_vals) }, FLASH_TIME ));
}

/**
 * Smoothly transition to a new tree structure.
 *
 * @params
 * nodes_names - array of names of nodes. Is formated such that the children of a node
 * 		 		 are at locations left = (2*i+1) and right = (2*i+2)
 * data_vals - a dictionary mapping data entries to their values
 */
function tree_transition(node_names, data_vals) {
	setup_tree(node_names, data_vals, tree_title);
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