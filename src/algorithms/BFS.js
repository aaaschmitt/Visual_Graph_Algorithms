/* BFS traversal of the d3 force directed graph */

function BFS() {
	visited = new Set();
	clock = 0;
	preNums = {};
	Q = [];
	var postvisited = new Set();


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
			previsit(node, null);

			while (Q.length > 0) {

				var cur_node = nodes[Q.shift()];
				var cur_node_id = cur_node.name;

				visit(cur_node_id);

				cur_node.adjacent.forEach(function(descend_node) {
					var descend_node_id = descend_node.node.name;
					if (!visited.has(descend_node_id)) {
						visited.add(descend_node_id);
						previsit(descend_node_id, cur_node_id);
						Q.push(descend_node_id);
					}
				})

				postvisit(cur_node_id);
			}
		}
	});
};