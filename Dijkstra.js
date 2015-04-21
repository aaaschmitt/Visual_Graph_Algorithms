/* Dijkstra's Algorithm for Graphs with non-negative edge weights */

//global values
var dist = {},
	prev = {},
	shortest_path_tree = new Set(),
	INFINITY_TEXT = "&#8734"
	MAX_NUM = Number.MAX_VALUE;

//colors for visualization
var on_heap_color = "#FF0000",
	off_heap_color = "#33CC33",
	update_color = "#FB46FC",
	unused_color = "#E6E6E6";

function Dijkstra() {
	flash_time = 0;
	dist = {};
	prev = {};
	shortest_path_tree = new Set();

	//create a dict of nodes with dist
	//values initialized to infinity
	//and a dict of previous values initialized to NULL
	algo_nodes.forEach(function(node) {
		color(node, on_heap_color, false);
		setDistance(node, MAX_NUM);
		prev[node] = null;
	});
	flash_time += flash_int;

	//start at node A
	setDistance('A', 0);

	//Initialize heap
	var H = new Heap(dist);

	console.log("hello");

	while (H.size() > 0) {

		console.log(H.size());

		//find node with smallest dist and remove from Heap
		var node_id = H.deleteMin();

		//color edge from prev node green since it will be a part of the shortest paths tree
		var prev_node = prev[node_id];
		if (prev_node != null) {
			prev_edge_id = get_edge_id(prev_node, node_id);
			shortest_path_tree.add(prev_edge_id);
			color(prev_edge_id, off_heap_color, true);
		}

		//If the min node that we pop off has a dist 
		//of infinity then we are done 
		//(all remaining nodes have dists of infinity and must be unreachable from the starting node)
		if (dist[node_id] == MAX_NUM) {
			break;
		}

		//flash this node as being off the heap and color it as such
		flash_color(node_id, off_heap_color, false, true, true);
		cur_node = nodes[node_id];

		//iterate over outgoing edges and update dist values
		cur_node.adjacent.forEach(function(descend) {

			//get descendant id and edge_id
			descend_id = descend.node.name;

			//only update things that are in the heap
			if (H.contains(descend_id)) {

				//get edge weight
				edge_id = get_edge_id(node_id, descend_id)
				weight_id = get_weight_id(node_id, descend_id);
				weight = edge_weights[weight_id];

				//color the edge and the node being visited
				flash_color(descend_id, update_color, false, false, false);
				flash_color(edge_id, update_color, true, true, false);

				//color the node red since it is still on the heap
				color(descend_id, on_heap_color, false);

				//color edge as as near-white to distinguish from nodes 
				//later on that will form the shortest paths tree
				color(edge_id, unused_color, true);

				//get dist values
				cur_dist = dist[descend_id];
				new_dist = dist[node_id] + weight;

				//check node dist
				if (cur_dist > new_dist) {
					setDistance(descend_id, new_dist);
					prev[descend_id] = node_id;
					H.decreaseKey(descend_id);
				}
			}
		})
	}

	console.log("finished the loop");

	//ensure that all edges that are not in the 
	//shortest path tree are colored near-white
	for (id in edge_ids) {
		if (!shortest_path_tree.has(edge_ids[id])) {
			color(edge_ids[id], unused_color, true);
		}
	}
}

/** 
 * set the distance for a node
 * and change its text
 */
function setDistance(node_id, distance) {
	dist[node_id] = distance;
	if (distance === MAX_NUM) {
		distance = INFINITY_TEXT;
	}
	setDistanceText(node_id, distance);
}

/**
 * change a node's text to reflect its distance
 */
function setDistanceText(node_id, dist) {
	change_node_text(node_id, node_id + "=" + dist, false);
}