/**
 * This Generates the animation
 */

//Track All states for an algorithm
var algorithmStates = [],
	currentStateIndex = 0;

 /**
 * Once an algorithm has generated all necessary state information 
 * this runs the animation.
 *
 * A state is an array of child objects to be colored at a timestep: 
 * [{id: 123 color: "#fffff", text: "[1" animation: colorNode, change: null, isTree: false},...]
 * change property should take on the values: true, false, or null
 * 
 * @param states - an array of states.
 */
function runAnimation(states) {
	if (!isPaused) {

		if (currentStateIndex > states.length-1) {
			currentStateIndex = states.length-1;
			return;
		} else if (currentStateIndex < 0) {
			currentStteIndex = 0;
		}

		FLASH_TIME = 0;
		console.log(states);
		var longestTime = runAnimationState(states[currentStateIndex])
		currentStateIndex += 1;
		
		TIMEOUT_IDS.push(setTimeout(function() {
			runAnimation(states)
		}, longestTime));
	}
}

function runAnimationState(state) {
	var	objects = state.children,
		stateTimes = [],
		child;

	for (var i = 0; i < objects.length; i++) {
		child = objects[i];

		//tree transition animations
		if (child.isTree) {
			stateTimes.push(updateTree(child.nodeNames, child.dataVals, child.deletedNode));
		}

		//Node and Edge animations
		else {

			//flashAndResize animations
			if (child.change !== null) {
				stateTimes.push(child.animation(child.id, child.color, child.change));
			} 

			//regular color animations
			else {
				stateTimes.push(child.animation(child.id, child.color, 0));
			}

			//update text after animations if necessary
			if (child.updateText ) {
				child.textUpdater(child.id, child.text);
			}
		}
	}

	return Math.max.apply(null, stateTimes);	//use spread operator to find max of an array
}

/**
 * Returns a new state and pushes it onto the array of states
 */
function createState() {
	var state = new State();
	algorithmStates.push(state);
	return state;
}

/**
 * A State - pretty much just an array
 */
function State() {
	this.children = [];
}

State.prototype.addChild = function(childObject) {
	this.children.push(childObject);
}

State.prototype.popChild = function(id) {
	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i].id === id) {
			return this.children.splice(i, 1)[0];
		}
	}
}

/**
 * A NodeState object
 */
function NodeState(id, color, text, shouldChange) {
	this.id = id;
	this.color = color;
	this.isTree = false;

	this.text = text;
	this.updateText = (text === null) ? false : true;
	this.textUpdater = changeNodeText;

	this.change = shouldChange;
	if (shouldChange !== null) {
		this.animation = flashColorAndResizeNode;
	} else {
		this.animation = colorNode;
	}
}

/**
 * A TreeNodeState object
 */
function TreeNodeState(id, color, text, shouldChange) {
	this.id = "tree_node" + id;
	this.color = color;
	this.isTree = false;

	this.text = text;
	this.updateText = (text === null) ? false : true;
	this.textUpdater = setTreeNodeDataValue;

	this.change = shouldChange;
	this.animation = flashColorAndResizeTreeNode;
}

/**
 * An EdgeState object
 */
function EdgeState(id, color, shouldChange) {
	this.id = id;
	this.color = color;
	this.isTree = false;

	this.updateText = false;

	this.change = shouldChange;
	if (shouldChange !== null) {
		this.animation = flashColorAndResizeEdge;
	} else {
		this.animation = colorEdge;
	}
}

/**
 * A TreeState object - has special properties
 * 
 * @params
 * nodes_names - array of names of nodes. Is formated such that the children of a node
 * 		 		 are at locations left = (2*i+s1) and right = (2*i+2)
 * dataVals - a dictionary mapping data entries to their values 
 * deletedNode - the id of the node that was deleted from the heap
 */
function TreeState(nodeNames, dataVals, deletedNode) {
	this.isTree = true;
	this.nodeNames = nodeNames;
	this.dataVals = dataVals;
	this.deletedNode = deletedNode;
}
