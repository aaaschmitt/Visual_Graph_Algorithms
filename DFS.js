//DFS traversal of the d3 force directed graph
function DFS() {
	visited = new Set();

	algo_nodes.forEAch(function(node) {
		if !(visited.has(node)) {
			visited.add(node);
			explore(nodes[node]);
		}
	})

}

function explore() {

}

function previsit() {

}

function postvisit() {

}