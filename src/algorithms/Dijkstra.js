/* Dijkstra's Algorithm for Graphs with non-negative edge weights */

//global values
var dist = {},
	INFINITY_TEXT = "∞",
	MAX_NUM = Number.MAX_VALUE;

//colors for visualization
var ON_HEAP_COLOR = "#FF0000",
	SHORTEST_TREE_COLOR = "#33CC33",
	UPDATE_COLOR = "#FB46FC",
	UNUSED_COLOR = "#E6E6E6";

function Dijkstra() {
	FLASH_TIME = 0;
	dist = {};
	
	var prev = {},
		shortestPathTree = new Set();

	//all nodes have dist=∞ and prev=null
	algo_nodes.forEach(function(node) {
		colorNode(node, ON_HEAP_COLOR);
		setDistance(node, MAX_NUM);
		prev[node] = null;
	});
	FLASH_TIME += FLASH_INT;

	//set start node dist to 0
	setDistance(START_NODE, 0);
	FLASH_TIME += FLASH_INT;

	//Initialize heap
	var H = new Heap(dist);
	//color start node green
	colorNode(H.peek(), SHORTEST_TREE_COLOR);

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
			colorEdge(prev_edge_id, SHORTEST_TREE_COLOR);
		}

		//If the min node that we pop off has a dist of infinity then we are done
		if (dist[node_id] == MAX_NUM) {
			break;
		}

		//flash this node as being off the heap and update tree
		flashColorAndResizeNode(node_id, SHORTEST_TREE_COLOR, false, true);
		flashColorAndResizeTreeNode(node_id, SHORTEST_TREE_COLOR, true, false);
		updateTree(H.h, dist, node_id);

		cur_node = nodes[node_id];

		cur_node.adjacent.forEach(function(descend) {

			descend_id = descend.node.name;
			edge_id = get_edge_id(node_id, descend_id)
			weight = get_weight(node_id, descend_id);

			//only color things that are in the heap
			if (H.contains(descend_id)) {

				//show that this node is still on the heap
				flashColorAndResizeDescendantNodeAndEdge(descend_id, edge_id, ON_HEAP_COLOR, true);
			
				//get dist values
				curDist = dist[descend_id];
				newDist = dist[node_id] + weight;

				//check node dist
				if (curDist > newDist) {

					setDistance(descend_id, newDist);
					setTreeNodeDataValue(descend_id, newDist);

					prev[descend_id] = node_id;
					H.decreaseKey(descend_id);

					//show that the value of this node has been updated
					flashColorAndResizeDescendantNodeAndEdge(descend_id, edge_id, UPDATE_COLOR, true);
					updateTree(H.h, dist, null);
				}

				//color edge as as near-white to distinguish from nodes 
				//later on that will form the shortest paths tree
				colorEdge(edge_id, UNUSED_COLOR);
			}
		})
	}

	// ensure that all edges that are not in the 
	// shortest path tree are colored near-white
	for (id in edge_ids) {
		if (!shortestPathTree.has(edge_ids[id])) {
			colorEdge(edge_ids[id], UNUSED_COLOR);
		}
	}
}

/** 
 * Flash Colors/Resizes a descendant node and the edge leading to it. 
 * Also colors the corresponding node in the heap display tree.
 * All events are simultaneous.
 * @params
 * node - node to be colored
 * edge - edge to be coored
 * color - color to flash to
 * incr - true iff the clock should be incremented after ALL 3  events have occured
 */
function flashColorAndResizeDescendantNodeAndEdge(node, edge, color, incr) {
	flashColorAndResizeNode(node, color, false, false);
	flashColorAndResizeEdge(edge, color, false, false);
	flashColorAndResizeTreeNode(node, color, incr, false);
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
	changeNodeText(node_id, node_id + "=" + dist, false);
}