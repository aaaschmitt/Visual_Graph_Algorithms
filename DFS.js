//DFS traversal of the d3 force directed graph

//Set of visited nodes
var visited = new Set(),
	visited_color = "#33CC33"
	next_color = "#FF0000"
	clock = 0;

function DFS() {
	visisted = new Set();
	clock = 0;
	console.log(undirect_ids);

	algo_nodes.forEach(function(node) {
		if (!visited.has(node)) {
			visited.add(node);
			flash_color(node, "v", false);
			color(node, visited_color, false);
			explore(nodes[node]);
		}
	});
};

function explore(node) {
	var node_id = node.name;
	visited.add(node_id);
	previsit(node_id);

	var neighbors = node.adjacent;
	console.log(neighbors);
	neighbors.forEach(
		function(n) {
			var edge_id;
			var descend_id = n.node.name;
			if (isDirected) {
				edge_id = node_id + "->" + descend_id;
			} else {
				edge_id = undirected_edge_id(node_id, descend_id);
			}
			console.log(edge_id);
			flash_color(edge_id, "n", true);
			if (!visited.has(descend_id)) {
				color(edge_id, visited_color, true);
				visited.add(descend_id);
				explore(n.node);
			}
		}
	);
	postvisit(node_id);
};

function undirected_edge_id(id1, id2) {
	console.log(id1+id2);
	if (id1 < id2) {
		return undirect_ids[id1+id2];
	} else {
		return undirect_ids[id2+id1];
	}
};

function previsit(id) {
	flash_color(id, "v", false);
	color(id, visited_color, false);
	change_node_text(id, id+"["+clock)
	clock += 1;
};

function postvisit(id) {
	var previous_text = document.getElementById("node_text:"+id).innerHTML
	change_node_text(id, previous_text + "," + clock + "]")
	clock += 1;
};