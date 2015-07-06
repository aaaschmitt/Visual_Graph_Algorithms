/**
The Bellman-Ford Shortest Path Algorithm for d3 force directed graph
*/

//keep track of a set of previous edge to compute shortest paths tree
var prevEdge = new Set(),
	prev = {};

//colors
var UPDATING_COLOR = "#FF0000",
	UPDATE_MADE_COLOR = "#FB46FC";

function Bellman() {
	FLASH_TIME = 0;
	dist = {};
	prevEdge = new Set();
	prev = {};

	//initalize dist to infinity
	algo_nodes.forEach(function(node) {
		colorNode(node, UPDATING_COLOR);
		setDistance(node, MAX_NUM);
		prev[node] = null;
	});
	FLASH_TIME += FLASH_INT;

	//set start node dist to 0
	setDistance(START_NODE, 0);
	FLASH_TIME += FLASH_INT;

	//repeat for |V|-1 times or until no updates are made
	var updated = false,
		first = true;

	for (var i = 0; i < NUM_NODES-1; i++) {

		//display iteration number
		var s = "Iteration: " + (i+1).toString();
		flash_info(s, "danger", "info");


		//relax each edge, they are far too stressed
		updated = false;
		algo_edges.forEach(function(edge) {
			updated = update(edge, first) || updated;
		});
		first = false;

		//if no updates made in an iteration we're done.
		if (!updated) {
			break;
		}
	}

	var colorChoice;

	flash_info("Checking for Negative Cycles and Constructing Shortest Paths Tree", "danger", "info");

	//check for negative cycles and build the shortest paths tree
	algo_edges.forEach(function(edge) {

			//if an edge is updated there is a negative cycle
			updated = update(edge, first);
			if (updated) {
				flash_info("Negative cycle detected the results below may be erroneous!", "info", "danger");
				return;
			}

			//color shortest path tree
			var edge_id = get_edge_id(edge[0], edge[1]);
			if (prevEdge.has(edge_id)) {
				colorChoice = SHORTEST_TREE_COLOR;
			} else {
				colorChoice = UNUSED_COLOR;
			}

			flashColorAndResizeEdge(edge_id, colorChoice, false, true);
			if (dist[edge[0]] != MAX_NUM) {
				flashColorAndResizeNode(edge[1], SHORTEST_TREE_COLOR, true, true);
			} else {
				flashColorAndResizeNode(edge[1], UPDATING_COLOR, true, true);
			}
	});

	flash_info("Complete!", "info", "success");
}

/**
 * Relaxs an edge (u,v) by updating its 
 * associtaed dist values if possible.
 * Return true iff an update was made.
 */
function update(edge, first) {
	var u = edge[0],
		v = edge[1],
		edge_id = get_edge_id(u, v);

	if (first) {
		colorEdge(get_edge_id(u, v), UPDATING_COLOR, true, true);
	}

	if (dist[u] == MAX_NUM) {
		return false;
	}
	
	var newDist = dist[u] + get_weight(u, v);

	if (dist[v] > newDist) {
		setDistance(v, newDist);
		if (prev[v] != null) {
			prevEdge.delete(prev[v]);
		}
		prev[v] = edge_id;
		prevEdge.add(edge_id);
		flashColorAndResizeEdge(edge_id, UPDATE_MADE_COLOR, false, false);
		flashColorAndResizeNode(v, UPDATE_MADE_COLOR, true, false);
		return true;
	} else {
		return false;
	}
}