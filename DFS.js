//DFS traversal of the d3 force directed graph

//Set of visited nodes
var visited = new Set(),
	post_visited_color = "#33CC33"
	next_color = "#FF0000"
	clock = 0
	pre_nums = {};

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
			flash_color(node, "v", false, true, true);
			explore(nodes[node]);
		}
	});
};

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

function get_undirected_edge_id(id1, id2) {
	if (id1 < id2) {
		return undirect_ids[id1+id2];
	} else {
		return undirect_ids[id2+id1];
	}
};

//previsits a node making it flash greeen for 
//visited and also updates its previsit number
function previsit(id) {
	pre_nums[id] = clock;
	flash_time += flash_int;
	color(id, next_color, false);
	change_node_text(id, id+"["+clock);
	clock += 1;
};

//visits a node via an edge. flashes the edge and node red
//and then changes the edge to green
function visit(node_id, descend_id) {
	var edge_id;
	if (isDirected) {
		edge_id = node_id + "->" + descend_id;
	} else {
		edge_id = get_undirected_edge_id(node_id, descend_id);
	}
	flash_color(edge_id, "n", true, false, false);
	console.log("edge time:"+flash_time);
	flash_color(descend_id, "n", false, true, false);
	console.log("node time:"+flash_time);
	flash_time += flash_int;
	color(edge_id, post_visited_color, true);
}

//postvisits a node by updating its node text to include the postvisit number
function postvisit(id) {
	change_node_text(id, id + "[" + pre_nums[id] + "," + clock + "]");
	color(id, post_visited_color, false);
	clock += 1;
};