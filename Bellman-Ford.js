/**
The Bellman-Ford Shortest Path Algorithm for d3 force directed graph
*/

//keep track of a set of previous edge to compute shortest paths tree
var prev_edge = new Set();

//colors
var UPDATING_COLOR = "#FF0000",
	UPDATE_MADE_COLOR = "#FB46FC";

function Bellman() {
	flash_time = 0;
	dist = {};
	prev_edge = new Set();
	prev = {};

	//initalize dist to infinity
	algo_nodes.forEach(function(node) {
		color(node, UPDATING_COLOR, false);
		setDistance(node, MAX_NUM);
		prev[node] = null;
	});
	flash_time += flash_int;


	//set start node dist to 0
	setDistance(start_node, 0);
	flash_time += flash_int;

	//repeat for |V|-1 times or until no updates are made
	var updated = false;


	for (var i = 0; i < NUM_NODES-1; i++) {

		//relax each edge, they are far too stressed
		updated = false;
		algo_edges.forEach(function(edge) {
			updated = update(edge) || updated;
		});

		//if no updates made in an iteration we're done.
		if (!updated) {
			break;
		}
	}

	var color_choice;

	//check for negative cycles and build the shortest paths tree
	algo_edges.forEach(function(edge) {

			// if an edge is updated there is a negative cycle
			updated = update(edge);
			if (updated) {
				var x = document.getElementById("error");
			    x.innerHTML = "Negative cycle detected!!! The results below may be erroneous.";
			    x.className = "alert alert-danger"
				return;
			}

			//color shortest path tree
			if (prev_edge.has(edge)) {
				color_choice = SHORTEST_TREE_COLOR;
			} else {
				color_choice = UNUSED_COLOR;
			}

			flash_color(get_edge_id(edge[0], edge[1]), color_choice, true, true, true);
	});
}

/**
 * relaxs an edge (u,v) by updating its 
 * associtaed dist values if possible.
 * Return true iff no update was made.
 */
function update(edge) {
	u = edge[0];
	v = edge[1];

	flash_color(get_edge_id(u, v), UPDATING_COLOR, true, true, true);

	if (dist[u] == MAX_NUM) {
		return;
	}
	
	var new_dist = dist[u] + get_weight(u, v);

	if (dist[v] > new_dist) {
		setDistance(v, new_dist);
		if (prev[v] != null) {
			prev_edge.delete(prev[v]);
		}
		prev[v] = edge;
		prev_edge.add(edge);
		flash_color(get_edge_id(u, v), UPDATE_MADE_COLOR, true, true, false);
		return true;
	} else {
		return false;
	}

}

/**
 * Flashes two nodes and the edge between them
 * when performing an update
 *
 * @params
 * u - parent node
 * v - child node
 * color - color to flash to
 * change - true iff the color of nodes 
 *			and edge should change to color after flashing
 */
function flash_edge(u, v, color, change) {
	flash_color(u, color, false, false, change);
	flash_color(v, color, false, false, change);
	flash_color(get_edge_id(u, v), color, true, true, change);
}