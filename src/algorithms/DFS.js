/* DFS traversal of the d3 force directed graph */

//Set of visited nodes also used by BFS
var visited = new Set(),
	PREVISIT_COLOR = "#FF0000",
	VISIT_COLOR = "#FB46FC",
	POSTVISIT_COLOR = "#33CC33",
	clock = 0,
	preNums = {};

/** 
 * Runs until all nodes have been visited.
 * calls the explore function to do the actual
 * traversal
 */
function DFS() {
	visited = new Set();
	clock = 0;
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
			previsit(node, null);
			explore(nodes[node]);
		}
	});
};

/**
 * explores in a DFS fashion from the NODE
 */
function explore(node) {
	var node_id = node.name;
	visit(node_id);

	var neighbors = node.adjacent;
	neighbors.forEach(
		function(n) {
			var descend_id = n.node.name;
			if (!visited.has(descend_id)) {
				previsit(descend_id, node_id);
				explore(n.node);
			}
		}
	);
	postvisit(node_id);
};

/**
 * previsits a node via a parent node. 
 * flashes the edge and the descendant node PREVISIT_COLOR
 * then colors the edge POSTVISIT_COLOR
 */
function previsit(node_id, parent_id) {
	preNums[node_id] = clock; 

	//flash node and edge
	var flashState = createState();
	flashState.addChild(new NodeState(node_id, PREVISIT_COLOR, node_id+"["+clock, true));
	
	if (parent_id != null) {
		var edge_id = get_edge_id(parent_id, node_id);
		flashState.addChild(new EdgeState(edge_id, PREVISIT_COLOR, false));

		//color edge permanently
		var colorEdgeState = createState();
		colorEdgeState.addChild(new EdgeState(edge_id, POSTVISIT_COLOR, null));
	}

	clock += 1;
};

/**
 * visits a node adding it to the visited set. 
 * flashes the node VISIT_COLOR
 */
function visit(node_id) {
	visited.add(node_id);

	var state = createState();
	state.addChild(new NodeState(node_id, VISIT_COLOR, null, true))
}

/**
 * postvisits a node by updating its node text to include the postvisit number
 * also color the node POSTVISIT_COLOR
 */
function postvisit(node_id) {
	var state = createState();	
	state.addChild(new NodeState(node_id, POSTVISIT_COLOR, node_id + "[" + preNums[node_id] + "," + clock + "]", true));
	clock += 1;
};