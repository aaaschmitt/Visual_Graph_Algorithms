/* Dijkstra's Algorithm for Graphs with non-negative edge weights */

//global values
var dist = {},
	MAX_NUM = Number.MAX_VALUE;

//colors for visualization
var ON_HEAP_COLOR = "#FF0000",
	SHORTEST_TREE_COLOR = "#33CC33",
	UPDATE_COLOR = "#FB46FC",
	UNUSED_COLOR = "#E6E6E6";

function Dijkstra() {
	dist = {};
	
	var prev = {},
		shortestPathTree = new Set();

	//all nodes have dist=∞ and prev=null
	var initialState = createState();
	algo_nodes.forEach(function(node) {
		initialState.addChild(new NodeState(node, ON_HEAP_COLOR, getDistanceText(node, MAX_NUM), null, initialState.index));
		prev[node] = null;
	});

	//color start node and set it's distance to 0;
	var startState = createState();
	startState.addChild(new NodeState(START_NODE, SHORTEST_TREE_COLOR, getDistanceText(START_NODE, 0), null, startState.index));

	//Initialize heap
	var H = new Heap(dist);

	//Initialize heap display
	DATA_NAME = "dist";
	setupTree(H.h, dist, "Binary Heap");

	while (H.size() > 0) {

		//find node with smallest dist and remove from Heap
		var node_id = H.deleteMin();

		//color edge from prev node green since it will be a part of the shortest paths tree
		var prev_node = prev[node_id];
		if (prev_node != null) {
			prev_edge_id = get_edge_id(prev_node, node_id);
			shortestPathTree.add(prev_edge_id);
			
			var edgeState = createState();
			edgeState.addChild(new EdgeState(prev_edge_id, SHORTEST_TREE_COLOR, null, edgeState.index)); 
		}

		//If the min node that we pop off has a dist of infinity then we are done
		if (dist[node_id] == MAX_NUM) {
			break;
		}

		//flash this node as being off the heap and update tree
		var removedState = createState();
		removedState.addChildren([
			new NodeState(node_id, SHORTEST_TREE_COLOR, null, true, removedState.index),
			new TreeNodeState(node_id, SHORTEST_TREE_COLOR, null, true, removedState.index),
		]);
		var treeTransitionState = createState();
		treeTransitionState.addChild(new TreeState(H.h, dist, node_id, treeTransitionState.index));

		cur_node = nodes[node_id];

		cur_node.adjacent.forEach(function(descend) {

			descend_id = descend.node.name;
			edge_id = get_edge_id(node_id, descend_id)
			weight = get_weight(node_id, descend_id);

			//only color things that are in the heap
			if (H.contains(descend_id)) {

				//show that this node is still on the heap
				flashColorAndResizeDescendantNodeAndEdge(descend_id, edge_id, ON_HEAP_COLOR, null, true);
			
				//get dist values
				curDist = dist[descend_id];
				newDist = dist[node_id] + weight;

				//check node dist
				if (curDist > newDist) {

					//show that the value of this node has been updated
					flashColorAndResizeDescendantNodeAndEdge(descend_id, edge_id, UPDATE_COLOR, newDist, false);

					prev[descend_id] = node_id;
					H.decreaseKey(descend_id);

					var treeState = createState();
					treeState.addChild(new TreeState(H.h, dist, null, treeState.index));
				}

				//color edge as as near-white to distinguish from nodes 
				//later on that will form the shortest paths tree
				var unusedState = createState();
				unusedState.addChild(new EdgeState(edge_id, UNUSED_COLOR, null, unusedState.index));
			}
		})
	}

	// ensure that all edges that are not in the 
	// shortest path tree are colored near-white
	var finalState = createState();
	for (id in edge_ids) {
		if (!shortestPathTree.has(edge_ids[id])) {
			finalState.addChild(new EdgeState(edge_ids[id], UNUSED_COLOR, null, finalState.index));
		}
	}
}

/**
 * Flash Colors/Resizes a descendant node and the edge leading to it. 
 * Also colors the corresponding node in the heap display tree.
 * All events are simultaneous.
 * @params
 * node_id - node to be colored
 * edge_id - edge to be coored
 * color - color to flash to
 * [newDist] - distance to be displayed
 * change - true iff the color of the node and tree node should change
 */
function flashColorAndResizeDescendantNodeAndEdge(node_id, edge_id, color, newDist, change) {
	if (newDist == null) {
		nodeText = null;
		treeText = null;
	} else {
		nodeText = getDistanceText(node_id, newDist);
		treeText = newDist;
	}

	var state = createState();
	state.addChildren([
		new NodeState(node_id, color, nodeText, change, state.index),
		new EdgeState(edge_id, color, false, state.index),
		new TreeNodeState(node_id, color, treeText, change, state.index)
	]);

	return state;
}

/** 
 * set the distance for a node
 * and change its text
 */
function getDistanceText(node_id, distance) {
	dist[node_id] = distance;
	if (distance === MAX_NUM) {
		distance = INFINITY_TEXT;
	}
	return node_id + "=" + distance;
}