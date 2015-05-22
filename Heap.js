/* A binary heap implementation */
function Heap(dict) {
	//use dict to get key values
	this.keys = dict;
	//store positions of elements at all times for constant time lookup
	this.pos = [];
	//the array for this Heap
	this.h = [];
	//also support constant time membership test for heap
	this.elms = new Set()
	//dynamicallly compute the number of elements in this heap
	this.size = function() {
		return this.h.length;
	}
	//build the heap upon initialization
	this.makeHeap();
}


/**
 * Builds a new heap
 */
Heap.prototype.makeHeap = function () {
	//initialize an empty array to the size of dict
	this.h = [];

	//add keys to the array
	var i = 0;
	for (var key in this.keys) {
		this.h.push(key);
		this.elms.add(key);
		this.pos[key] = i;
		i += 1;
	}

	//sift each element down to its correct position
	for(i=this.size()-1; i >= 0; i--) {
		this.siftDown(this.h[i], i);
	}
}

/**
 * Place ELM in position I of this heap
 * and let it siftdown
 */
Heap.prototype.siftDown = function(elm, i) {
	//find index of min child of elm
	c = this.minChild(i);

	//sift elm down until it is above its smallest child
	while(c != -1 && this.keys[this.h[c]] < this.keys[elm]) {

		//sift the element down by swapping it with its child
		this.h[i] = this.h[c];

		//update child's position
		this.pos[this.h[c]] = i

		//get index of next child and reassign elms index
		i = c;
		c = this.minChild(i);
	}

	//place elm into array and update its position
	this.h[i] = elm;
	this.pos[elm] = i;
}

/**
 * Return the index of the smallest child of H[I]
 */
Heap.prototype.minChild = function(i) {
	if ((2*i)+1 > this.size()) {
		return -1; //no children
	} else {
		min_val = null;
		min_index = null;

		//find smallest child from left (2*i)+ 1 and right (2*i)+2
		//note this indexing gets a little odd for 0 indexed arrays
		for (j = (2*i)+1; j <= Math.min(this.size(), (2*i)+2); j++) {

			key_val = this.keys[this.h[j]];
			if (min_val == null || min_val > key_val) {
				min_val = key_val;
				min_index = j;
			}
		}
		return min_index;
	}
}

/**
 * Place ELM at position I of H
 * and let it bubble up
 */
Heap.prototype.bubbleUp = function(elm, i) {
	p = Math.ceil(i/2)-1;
	while (i != 0 && this.keys[this.h[p]] > this.keys[elm]) {
		this.h[i] = this.h[p];
		this.pos[this.h[p]] = i;
		i = p;
		p = Math.ceil(i/2)-1;
	}
	this.h[i] = elm;
	this.pos[elm] = i;
}

/**
 * Insert ELM into this heap. 
 * I'm not sure if this works. Untested.
 */
Heap.prototype.insert = function(elm) {
	this.elms.add(elm);
	this.pos[elm] = this.size();
	this.h.push(elm);
	this.bubbleUp(elm, this.size()-1);
}

/**
 * Decrease the key value of ELM
 * in H and move ELM accordingly
 */
Heap.prototype.decreaseKey = function(elm) {
	this.bubbleUp(elm, this.pos[elm]);
}

/**
 * Delete and return the element with 
 * the minimum key value from H
 */
Heap.prototype.deleteMin = function() {
	if (this.size() == 0) {
		return null;
	} else {

		//pop off min element element
		x = this.h.shift();

		//delete the min element from elms and positions arrays
		this.elms.delete(x);
		delete this.pos[x];

		//if elements remain put last element on the front and let it sift down
		if (this.size() > 0) {
			elm = this.h.pop();
			this.h.unshift(elm);
			this.pos[elm] = 0;			
			this.siftDown(elm, 0);
		}

		return x;
	}

}

/**
 * True iff this heap contains ELM
 */
Heap.prototype.contains = function(elm) {
	return this.elms.has(elm);
}
