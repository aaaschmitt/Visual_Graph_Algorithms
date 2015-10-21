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
 * [{id: 123 color: "#fffff", text: "[1", animation: colorNode, change: null, isTree: false},...]
 * change property should take on the values: true, false, or null
 * 
 */
function runAnimation() {

	if (currentStateIndex > algorithmStates.length-1) {
		currentStateIndex = algorithmStates.length-1;
		return;
	} else if (currentStateIndex < 0) {
		currentStateIndex = 0;
	}

	FLASH_TIME = 0;
	var longestTime = runAnimationState(algorithmStates[currentStateIndex])
	currentStateIndex += 1;
	
	//schedule callback if not paused
	if (!isPaused && currentStateIndex < algorithmStates.length) {
		isRunning = true;
		TIMEOUT_IDS.push(setTimeout(function() {
			runAnimation()
		}, longestTime));
	} else if (currentStateIndex >= algorithmStates.length) {
		isRunning = false;
	}
}

function setCurrentState() {
	var state = algorithmStates[currentStateIndex];

	$.each(state.children, function(id, child) {

		if (child.isTree) {
			setupTree(child.nodeNames, child.dataVals, tree_title);
		}

		else if (child.isInfo) {
			child.animate(child)
		}

		else {
			child.colorAnimation(id, child.currentColor, 0);

			if (child.updateText) {
				child.textUpdater(id, child.currentText);
			}
		}
	})
}

function runAnimationState(state) {
	var stateTimes = [];


	$.each(state.children, function(id, child) {
		//tree transition animations
		if (child.isTree) {
			stateTimes.push(child.animation(child.nodeNames, child.dataVals, child.deletedNode));
		}

		else if (child.isInfo) {
			stateTimes.push(child.animate(child));
		}

		//Node and Edge animations
		else {

			//dynamic animations
			if (child.change !== null) {
				stateTimes.push(child.dynamicAnimation(id, child.currentColor, child.color, child.change));
			} 

			//regular color animations
			else {
				stateTimes.push(child.colorAnimation(id, child.color, 0));
			}

			//update text after animations if necessary
			if (child.updateText) {
				child.textUpdater(id, child.text);
			}
		}
	});

	return Math.max.apply(null, stateTimes);
}

/**
 * Returns a new state and pushes it onto the array of states
 */
function createState() {
	var state = new State(algorithmStates.length);
	algorithmStates.push(state);
	return state;
}

/**
 * A State - pretty much just an array
 */
function State(index) {
	this.children = {};
	this.index = index;
}

State.prototype.addChild = function(childObj) {
	this.children[childObj.id] = childObj;
}

State.prototype.addChildren = function(childrenObjects) {
	childrenObjects.forEach(function(childObj) {
		this.children[childObj.id] = childObj;
	}, this);
}

State.prototype.popChild = function(id) {
	return this.children[id];
}

/**
 * A ChildState object superType for things that are not a TreeState
 */
function ChildState(id, defaultColor, defaultText, text, color, shouldChange, index) {
	this.id = id;
	this.color = color;
	this.change = shouldChange;
	this.stateIndex = index;
	this.isTree = false;
	this.isInfo = false;
	this.text = text;

	if (index === 0 && text !== null) {
		this.currentText = text;
		this.currentColor = color;
		return;
	} 

	var previousObj = findPreviousObj(id, index);
	if (!previousObj) {
		this.currentColor = defaultColor;
		this.currentText = defaultText;
	} else {
		this.currentColor = previousObj.color;
		if (previousObj.text !== undefined && previousObj.text !== null) {
			this.currentText = previousObj.text;
		} else {
			this.currentText = previousObj.currentText;
		}
	}
}

function findPreviousObj(id, index) {
	if (index == 0) {
		return false;
	}
	for (var i = index-1; i > 0; --i) {
		var previousObj = algorithmStates[i].children[id];
		if ( previousObj !== undefined) {
			return previousObj;
		}
	}
	return false;
}

/**
 * A NodeState object inherits from chi
 */
NodeState.prototype.constructor = NodeState;
NodeState.prototype.parent = ChildState;
function NodeState(id, color, text, shouldChange, index) {
	var defaultColor = START_NODE_COLOR;
	var defaultText = id;
	this.parent.call(this, id, defaultColor, defaultText, text, color, shouldChange, index);

	this.updateText = (text === null) ? false : true;
	this.textUpdater = changeNodeText;

	this.dynamicAnimation = flashColorAndResizeNode;
	this.colorAnimation = colorNode;
}

/**
 * A TreeNodeState object
 */
TreeNodeState.prototype.constructor = TreeNodeState;
TreeNodeState.prototype.parent = ChildState;
function TreeNodeState(id, color, text, shouldChange, index) {
	var defaultColor = START_TREE_NODE_COLOR;
	var defaultText = TREE_DATA_START_VAL;
	this.parent.call(this, "tree_node" + id, defaultColor, defaultText, text, color, shouldChange, index);

	this.updateText = (text === null) ? false : true;
	this.textUpdater = setTreeNodeDataValue;
	this.dynamicAnimation = flashColorAndResizeTreeNode;
	this.colorAnimation = colorNode;
}

/**
 * An EdgeState object
 */
EdgeState.prototype.constructor = EdgeState;
EdgeState.prototype.parent = ChildState;
function EdgeState(id, color, shouldChange, index) {
	var defaultColor = START_EDGE_COLOR;
	var defaultText = null
	var text = null;
	this.parent.call(this, id, defaultColor, defaultText, text, color, shouldChange, index);

	this.updateText = false;
	this.dynamicAnimation = flashColorAndResizeEdge;
	this.colorAnimation = colorEdge;
}

/**
 * A TreeState object - has special properties
 * 
 * @params
 * nodes_names - array of names of nodes. Is formated such that the children of a node
 * 		 		 are at locations left = (2*i+1) and right = (2*i+2)
 * dataVals - a dictionary mapping data entries to their values 
 * deletedNode - the id of the node that was deleted from the heap
 */
function TreeState(nodeNames, dataVals, deletedNode) {
	//need to make copies of the current state
	var cur_names = [],
		cur_vals = {},
		temp;
	for (var i = 0; i < nodeNames.length; i++) {
		temp = nodeNames[i];
		cur_names.push(temp);
		cur_vals[temp] = dataVals[temp];
	}
	this.isInfo = false;
	this.isTree = true;
	this.nodeNames = cur_names;
	this.dataVals = cur_vals;
	this.deletedNode = deletedNode;
	this.animation = updateTree;
}

/**
 * An InfoState object - purpose is to display a message to the banner above the graph.
 * 
 * @params
 * msg - a string, the message to be displayed
 * startClass - the HTML class to be associated with the info element at it's start. 
 				Usually these are bootstrap classes i.e. "alert alert-[info, success, danger]"
 * endClass - same classes as startClass. This is the class that the info element will end at after flashing.
 */
function InfoState(msg, startClass, endClass) {
	this.isInfo = true;
	this.isTree = false;
	this.msg = msg;
	this.sc = startClass;
	this.ec = endClass;
	this.animate = flashInfo;
}
