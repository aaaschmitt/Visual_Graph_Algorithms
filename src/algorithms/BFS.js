/* BFS traversal of the d3 force directed graph */

function BFS() {
	visited = new Set();
	clock = 0;
	FLASH_TIME = 0;
	preNums = {};
	Q = [];


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
			Q.push(node);
			visited.add(node)
			while (Q.length > 0) {

				var cur_node = nodes[Q.shift()];
				var cur_node_id = cur_node.name;
				BFS_previsit(cur_node_id);

				cur_node.adjacent.forEach(function(descend_node) {
					var descend_node_id = descend_node.node.name;
					if (!visited.has(descend_node_id)) {
						visited.add(descend_node_id);
						BFS_visit(cur_node_id, descend_node_id);
						Q.push(descend_node_id);
					}
				})
				BFS_postvisit(cur_node_id);
			}
		}
	});
};

/** 
 * previsits a node coloring purple for 
 * previsited (i.e. out of the queue) and also 
 * updates its previsit number
 */
function BFS_previsit(id) {
	preNums[id] = clock;
	FLASH_TIME += FLASH_INT;
	colorNode(id, PREVISIT_COLOR);
	changeNodeText(id, id+"["+clock, true);
	clock += 1;
};

/**
 * visits a node via an edge. flashes the edge and node red
 * and then changes the edge to green
 */
function BFS_visit(node_id, descend_id) {
	var edge_id = get_edge_id(node_id, descend_id)
	flashColorAndResizeEdge(edge_id, NEXT_COLOR, false, false);
	flashColorAndResizeNode(descend_id, NEXT_COLOR, true, true);
	FLASH_TIME += FLASH_INT;
	colorEdge(edge_id, POST_VISITED_COLOR);
}

/**
 * postvisits a node by updating its node text to include the postvisit number
 * also changes the nodes color to green
 */
function BFS_postvisit(id) {
	changeNodeText(id, id + "[" + preNums[id] + "," + clock + "]", true);
	colorNode(id, POST_VISITED_COLOR);
	clock += 1;
};