//DFS traversal of the d3 force directed graph

//Set of visited nodes
var visited = new Set(),
	visited_color = "#33CC33"
	next_color = "#FF0000"
	clock = 0
	pre_nums = {};

function DFS() {
	visisted = new Set();
	clock = 0;
	flash_time = 100;
	pre_nums = {};

	var node_array = [];
	algo_nodes.forEach(function(node) {
		node_array.push(node);
	});

	node_array.sort();

	node_array.forEach(function(node) {
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
			if (!visited.has(descend_id)) {
				if (isDirected) {
					edge_id = node_id + "->" + descend_id;
				} else {
					edge_id = undirected_edge_id(node_id, descend_id);
				}
				flash_color(edge_id, "n", true);
				color(edge_id, visited_color, true);
				flash_time += flash_int;
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
	pre_nums[id] = clock;
	flash_color(id, "v", false);
	color(id, visited_color, false);
	flash_time += flash_int;
	change_node_text(id, id+"["+clock)
	clock += 1;
};

function postvisit(id) {
	change_node_text(id, id + "[" + pre_nums[id] + "," + clock + "]");
	clock += 1;
};