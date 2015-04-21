/* DFS traversal of the d3 force directed graph */

//Set of visited nodes also used by BFS
var visited = new Set(),
	post_visited_color = "#33CC33"
	next_color = "#FF0000"
	clock = 0
	pre_nums = {};

/** 
 * Runs until all nodes have been visited.
 * calls the explore function to do the actual
 * traversal
 */
function DFS() {
	visited = new Set();
	clock = 0;
	flash_time = 0;
	pre_nums = {};


	var node_array = [];
	algo_nodes.forEach(function(node) {
		node_array.push(node);
	});

	node_array.sort();

	node_array.forEach(function(node) {
		if (!visited.has(node)) {
			visited.add(node);
			flash_color(node, post_visited_color, false, true, true);
			explore(nodes[node]);
		}
	});
};

/**
 * explores in a DFS fashion from the NODE
 */
function explore(node) {
	var node_id = node.name;
	visited.add(node_id);
	previsit(node_id);

	var neighbors = node.adjacent;
	neighbors.forEach(
		function(n) {
			var descend_id = n.node.name;
			if (!visited.has(descend_id)) {
				visit(node_id, descend_id);
				visited.add(descend_id);
				explore(n.node);
			}
		}
	);
	postvisit(node_id);
};

/**
 * previsits a node coloring it red for 
 * previsited and also updates its previsit number
 */
function previsit(id) {
	pre_nums[id] = clock;
	flash_time += flash_int;
	color(id, next_color, false);
	change_node_text(id, id+"["+clock, true);
	clock += 1;
};

/**
 * visits a node via an edge. flashes the edge and node red
 * and then changes the edge to green
 */
function visit(node_id, descend_id) {
	var edge_id = get_edge_id(node_id, descend_id)
	flash_color(edge_id, next_color, true, false, false);
	flash_color(descend_id, next_color, false, true, false);
	flash_time += flash_int;
	color(edge_id, post_visited_color, true);
}

/**
 * postvisits a node by updating its node text to include the postvisit number
 * also colors the node green
 */
function postvisit(id) {
	change_node_text(id, id + "[" + pre_nums[id] + "," + clock + "]", true);
	color(id, post_visited_color, false);
	clock += 1;
};