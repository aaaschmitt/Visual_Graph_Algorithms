/* Dijkstra's Algorithm for Graphs with non-negative edge weights */

//global values
var dist = {},
	prev = {},
	shortest_path_tree = new Set(),
	INFINITY_TEXT = "&#8734"
	MAX_NUM = Number.MAX_VALUE,
	start_node = 'A';

//colors for visualization
var ON_HEAP_COLOR = "#FF0000",
	SHORTEST_TREE_COLOR = "#33CC33",
	UPDATE_COLOR = "#FB46FC",
	UNUSED_COLOR = "#E6E6E6";

function Dijkstra() {
	flash_time = 0;
	dist = {};
	prev = {};
	shortest_path_tree = new Set();

	//create a dict of nodes with dist
	//values initialized to infinity
	//and a dict of previous values initialized to NULL
	algo_nodes.forEach(function(node) {
		color(node, ON_HEAP_COLOR, false);
		setDistance(node, MAX_NUM);
		prev[node] = null;
	});
	flash_time += flash_int;

	//set start node dist to 0
	setDistance(start_node, 0);
	flash_time += flash_int;

	//Initialize heap
	var H = new Heap(dist);

	while (H.size() > 0) {

		//find node with smallest dist and remove from Heap
		var node_id = H.deleteMin();

		//color edge from prev node green since it will be a part of the shortest paths tree
		var prev_node = prev[node_id];
		if (prev_node != null) {
			prev_edge_id = get_edge_id(prev_node, node_id);
			shortest_path_tree.add(prev_edge_id);
			color(prev_edge_id, SHORTEST_TREE_COLOR, true);
		}

		//If the min node that we pop off has a dist 
		//of infinity then we are done 
		//(all remaining nodes have dists of infinity and must be unreachable from the starting node)
		if (dist[node_id] == MAX_NUM) {
			break;
		}

		//flash this node as being off the heap and color it as such
		flash_color(node_id, SHORTEST_TREE_COLOR, false, true, true);
		cur_node = nodes[node_id];

		//iterate over outgoing edges and update dist values
		cur_node.adjacent.forEach(function(descend) {

			//get descendant id and edge_id
			descend_id = descend.node.name;

			//only update things that are in the heap
			if (H.contains(descend_id)) {

				//get edge weight
				edge_id = get_edge_id(node_id, descend_id)
				weight = get_weight(node_id, descend_id);

				//color the edge and the node being visited
				flash_color(descend_id, UPDATE_COLOR, false, false, false);
				flash_color(edge_id, UPDATE_COLOR, true, true, false);

				//color the node red since it is still on the heap
				color(descend_id, ON_HEAP_COLOR, false);

				//color edge as as near-white to distinguish from nodes 
				//later on that will form the shortest paths tree
				color(edge_id, UNUSED_COLOR, true);

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

	//ensure that all edges that are not in the 
	//shortest path tree are colored near-white
	for (id in edge_ids) {
		if (!shortest_path_tree.has(edge_ids[id])) {
			color(edge_ids[id], UNUSED_COLOR, true);
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