/* DFS traversal of the d3 force directed graph */

//Set of visited nodes also used by BFS
var visited = new Set(),
	POST_VISITED_COLOR = "#33CC33"
	NEXT_COLOR = "#FF0000"
	clock = 0
	preNums = {};

/** 
 * Runs until all nodes have been visited.
 * calls the explore function to do the actual
 * traversal
 */
function DFS() {
	visited = new Set();
	clock = 0;
	FLASH_TIME = 0;
	preNums = {};


	var nodeArray = [];
	algo_nodes.forEach(function(node) {
		nodeArray.push(node);
	});

	nodeArray.sort();

	//put START_NODE as first element
	var index = nodeArray.indexOf(START_NODE);
	nodeArray.splice(index, 1);
	nodeArray.unshift(START_NODE);

	nodeArray.forEach(function(node) {
		if (!visited.has(node)) {
			visited.add(node);
			flashColorAndResizeNode(node, POST_VISITED_COLOR, true, true);
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
	preNums[id] = clock;
	FLASH_TIME += FLASH_INT;
	colorNode(id, NEXT_COLOR);
	changeNodeText(id, id+"["+clock, true);
	clock += 1;
};

/**
 * visits a node via an edge. flashes the edge and node red
 * and then changes the edge to green
 */
function visit(node_id, descend_id) {
	var edge_id = get_edge_id(node_id, descend_id)
	flashColorAndResizeEdge(edge_id, NEXT_COLOR, false, false);
	flashColorAndResizeNode(descend_id, NEXT_COLOR, true, false);
	FLASH_TIME += FLASH_INT;
	colorEdge(edge_id, POST_VISITED_COLOR);
}

/**
 * postvisits a node by updating its node text to include the postvisit number
 * also colors the node green
 */
function postvisit(id) {
	changeNodeText(id, id + "[" + preNums[id] + "," + clock + "]", true);
	colorNode(id, POST_VISITED_COLOR);
	clock += 1;
};