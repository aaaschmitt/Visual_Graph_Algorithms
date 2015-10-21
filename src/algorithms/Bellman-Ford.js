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
	dist = {};
	prevEdge = new Set();
	prev = {};

	//initalize dist to infinity
	var initState = createState()
	var nodeDist;
	algo_nodes.forEach(function(node) {
		//set start node's dist to 0
		nodeDist = (node === START_NODE) ? 0 : MAX_NUM
		initState.addChild(new NodeState(node, UPDATING_COLOR, 
										 getDistanceText(node, nodeDist), 
										 null, initState.index));
		prev[node] = null;
	});

	//repeat for |V|-1 times or until no updates are made
	var updated = false,
		first = true;

	for (var i = 0; i < NUM_NODES-1; i++) {

		//display iteration number
		var msg = "Iteration: " + (i+1).toString();
		var s = createState();
		s.addChild(new InfoState(msg, "alert alert-danger", "alert alert-info"))


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

	var s = createState(),
		msg = "Checking for Negative Cycles and Constructing Shortest Paths Tree";
	s.addChild(new InfoState(msg, "alert alert-danger", "alert alert-info"));

	//check for negative cycles and build the shortest paths tree
	var edgeColor, s, nodeColor, edge_id;
	algo_edges.forEach(function(edge) {

			s = createState();
			//if an edge is updated there is a negative cycle
			updated = update(edge, first);
			if (updated) {
				s.addChild(new InfoState(msg, "alert alert-info", "alert alert-danger"));
				return;
			}

			//color shortest path tree
			edge_id = get_edge_id(edge[0], edge[1]);
			nodeColor = (dist[edge[0]] != MAX_NUM) ? SHORTEST_TREE_COLOR : UPDATING_COLOR;
			edgeColor = (prevEdge.has(edge_id)) ? SHORTEST_TREE_COLOR : UNUSED_COLOR;
			s.addChild(new EdgeState(edge_id, edgeColor, true, s.index));
			s.addChild(new NodeState(edge[1], nodeColor, null, true, s.index));
	});

	s = createState();
	s.addChild(new InfoState("Complete!", "alert alert-info", "alert alert-success"));
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
		var s = createState();
		s.addChild(new EdgeState(get_edge_id(u, v), UPDATING_COLOR, true, s.index));
	}

	if (dist[u] == MAX_NUM) {
		return false;
	}
	
	var newDist = dist[u] + get_weight(u, v);

	if (dist[v] > newDist) {
		var uState = createState();
		uState.addChild(new EdgeState(edge_id, UPDATE_MADE_COLOR, false, uState.index));
		uState.addChild(new NodeState(v, UPDATE_MADE_COLOR, getDistanceText(v, newDist), false, uState.index));
		if (prev[v] != null) {
			prevEdge.delete(prev[v]);
		}
		prev[v] = edge_id;
		prevEdge.add(edge_id);
		return true;
	} else {
		return false;
	}
}