//BFS traversal of the d3 force graph

//BFS traversal of the d3 force directed graph
var previsit_color = "#990099";

function BFS() {
	visited = new Set();
	clock = 0;
	flash_time = 0;
	pre_nums = {};
	Q = [];


	var node_array = [];
	algo_nodes.forEach(function(node) {
		node_array.push(node);
	});

	node_array.sort();

	node_array.forEach(function(node) {
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

//previsits a node coloring red for 
//previsited and also updates its previsit number
function BFS_previsit(id) {
	pre_nums[id] = clock;
	flash_time += flash_int;
	color(id, previsit_color, false);
	change_node_text(id, id+"["+clock);
	clock += 1;
};

//visits a node via an edge. flashes the edge and node red
//and then changes the edge to green
function BFS_visit(node_id, descend_id) {
	var edge_id;
	if (isDirected) {
		edge_id = node_id + "->" + descend_id;
	} else {
		edge_id = get_undirected_edge_id(node_id, descend_id);
	}
	flash_color(edge_id, "n", true, false, false);
	flash_color(descend_id, "n", false, true, true);
	flash_time += flash_int;
	color(edge_id, post_visited_color, true);
}

//postvisits a node by updating its node text to include the postvisit number
function BFS_postvisit(id) {
	change_node_text(id, id + "[" + pre_nums[id] + "," + clock + "]");
	color(id, post_visited_color, false);
	clock += 1;
};