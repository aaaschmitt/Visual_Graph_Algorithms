//Control variables
var cur_algorithm = 0,
    isDirected = false,
    isPositive = true,
    isSetup = false,
    runNext = false,
    isPaused = false,
    isRunning = false;

//Nodes and Links
var nodes = {},
    algo_nodes = new Set(),
    algo_edges = new Set(),
    edge_ids = {},
    edge_weights = {},
    NUM_NODES = 0;

//Colors
var START_NODE_COLOR = "#0066FF",
    START_EDGE_COLOR = "#666",
    CUR_BACKGROUND_COLOR = "#FFFFFF",
    CUR_TEXT_COLOR = "#000000";

//Shape attributes
    START_NODE_RADIUS = 22,
    START_EDGE_STROKE_WIDTH = "3.75px",
    START_MARKER_REFX = 19;

//The force graph
var force;

//Starting node for algorithms
var START_NODE = 'A';

//Files containing the graphs
var algorithms = [
    "DFS", "BFS", "Dijkstra", "Bellman", "Kruskal", "Prim"],
    direct_csv_files = {
        "DFS" : "./DFS_direct.csv",
        "BFS" : "./BFS_direct.csv",
        "Dijkstra" : "./Dijkstra_direct.csv",
        "Bellman" : "./Bellman_direct.csv",
        "Kruskal" : 1,
        "Prim" : 1
    },
    undirect_csv_files = {
        "DFS" : "./DFS_undirect.csv",
        "BFS" : "./BFS_undirect.csv",
        "Dijkstra" : "./Dijkstra_undirect.csv",
        "Bellman" : "./Bellman_undirect.csv",
        "Kruskal" : "./Kruskal.csv",
        "Prim" : "Prim.csv"
    };

/**
 * This builds the graph based on the current selection
 */
function setup(index, directed) {

    cur_algorithm = index;
    FLASH_TIME = 0;

    // choose which data to use or error
    var csv = "";
    if (directed) {
        csv = direct_csv_files[algorithms[index]];
    } else {
        csv = undirect_csv_files[algorithms[index]];
    }

    if (csv == 1) {
        MST_error();
        return;
    }

    console.log(csv);

    //clear canvas and any currently running events
    d3.select(".graph").html("");
    clearEvents();
    clearTree();

    // reset error display to be empty
    d3.select("#error")
        .html("")
        .attr("class", "");

    d3.csv(csv, function(error, links) {
        
        //sort links by target
        links.sort(function(a,b) {
            if (a.target > b.target) {return 1;}
            if (a.target < b.target) {return -1;}
            else {return 0;}
        });

        //any links with duplicate source and target get an incremented 'linknum'
        // for (var i=0; i<links.length; i++) {
        //     if (i != 0 &&
        //         links[i].source == links[i-1].source &&
        //         links[i].target == links[i-1].target) {
        //             links[i].linknum = links[i-1].linknum + 1;
        //         }
        //     else {links[i].linknum = 1;};
        // };

        //the nodes of the graph containing their adjacent nodes
        nodes = {};
        //the ids corresponding to each edge
        edge_ids = {};
        //the list of edge weights accessed by edge_id
        edge_weights = {};
        //set of edges as strings
        algo_edges = new Set();
        //a set of nodes as strings
        algo_nodes = new Set();
        //initialize the number of nodes to 0
        NUM_NODES = 0;

        // Compute the distinct nodes from the links.
        links.forEach(function(link) {
            link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, adjacent: []});
            link.target = nodes[link.target] || (nodes[link.target] = {name: link.target, adjacent: []});


            // set up adjacency list
            nodes[link.source.name].adjacent.push( {node: nodes[link.target.name]} );

            a = link.source.name;
            b = link.target.name;

            if (!isDirected) {
                nodes[link.target.name].adjacent.push( {node: nodes[link.source.name]} );

                //add edges in both directions if directed
                algo_edges.add(a+b);
                algo_edges.add(b+a);

                // if it's undirected need to figure out what edge ids to change the color of
                if (a < b) {
                    edge_ids[a + b] = a + b;
                    edge_weights[a + b] = Number(link.type);
                } else {
                    edge_ids[b + a] = a + b;
                    edge_weights[b + a] = Number(link.type);
                }
            } else {
                algo_edges.add(a+b);
                edge_ids[a + b] = a + b;
                edge_weights[a + b] = Number(link.type);
            }

            //keep a set of all nodes in the graph and count the number of unique nodes
            if (!algo_nodes.has(a)) {
                algo_nodes.add(a);
                NUM_NODES += 1;
            }
            if (!algo_nodes.has(b)) {
                algo_nodes.add(b);
                NUM_NODES += 1;
            }
            

        });

        var w = 800,
            h = 600;

        //init the force layout
        force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(links)
            .size([w, h])
            .linkDistance(150)
            .charge(-1000)
            .linkStrength(.9)
            .gravity(.15)
            .on("tick", tick)
            .start();

        //append the svg element. this is where stuff gets drawn
        var svg = d3.select("div.graph").append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .style("background" , CUR_BACKGROUND_COLOR)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 600 600")
            .attr("id", "svg-algo");

        //arrow size for directed graphs
        var marker_h = 5,
            marker_w = 5;

        //just don't make arrows if graph isn't directed
        if (!isDirected) {
            marker_h=0;
            marker_w=0;
        }

        var X_OFFSET = 120,
            Y_OFFSET = 30;

        // Pre-type markers, as they don't inherit styles.
        svg.append("svg:defs").selectAll("marker")
            .data(force.links())
          .enter().append("svg:marker")
            .attr("id", function(d) { 
                            return d.source.name + d.target.name + "w";
                        })
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", START_MARKER_REFX)
            .attr("refY", 0)
            .attr("markerWidth", marker_w)
            .attr("markerHeight", marker_h)
            .attr("orient", "auto")
          .append("svg:path")
            .attr("id", function(d) {
                            return d.source.name + d.target.name + "c";
                        })
            .attr("d", "M0,-5L10,0L0,5")
            .style("fill", START_EDGE_COLOR)
            .attr("cur_color", START_EDGE_COLOR);

        //build paths (edges)
        var path = svg.append("svg:g").selectAll("path")
            .data(force.links())
          .enter().append("svg:path")
            .attr("class",  "link")
            .attr("id", function(d) { return d.source.name + d.target.name; })
            .attr("marker-end", function(d) { return "url(#" + d.source.name + d.target.name + "w" + ")"; })
            .style("stroke", START_EDGE_COLOR)
            .style("stroke-width", START_EDGE_STROKE_WIDTH)
            .style("fill", "none")
            .attr("cur_color", START_EDGE_COLOR);

        //append edge labels to paths
        var linktext = svg.append("svg:g").selectAll("g.linklabelholder")
            .data(force.links())
          .enter().append("g").attr("class", "linklabelholder")
             .append("text")
             .attr("class", "linklabel")
             .style("font-size", "18px")
             .style("fill", CUR_TEXT_COLOR)
             .attr("x", "60")
             .attr("y", "100")
             .attr("text-anchor", "start")
             .append("textPath")
             .attr("xlink:href",function(d) { return "#" + d.source.name + d.target.name; })
             .text( function(d) { 
                        return d.type; 
                    });
        
        //build svg circles for nodes
        var circle = svg.append("svg:g").selectAll("circle")
            .data(force.nodes())
           .enter().append("svg:circle")
            .attr("r", START_NODE_RADIUS)
            .attr("class", "node")
            .attr("id", function(d) {return d.name})
            .style("fill", START_NODE_COLOR)
            .attr("cur_color", START_NODE_COLOR)
            .call(force.drag);

        //initialzie text to be appended to the circles
        var text = svg.append("svg:g").selectAll("g")
            .data(force.nodes())
          .enter().append("svg:g");

        //append node names to svg circles
        text.append("svg:text")
            .attr("x", "-1em")
            .attr("y", ".31em")
            .style("font-size", "15px")
            .style("fill", CUR_TEXT_COLOR)
            .text(function(d) { return d.name; })
            .attr("class", "node-text")
            .attr("id", function(d) {return "node_text-" + d.name});

        //run specialized setup procedures if necessary
        switch(cur_algorithm) {
            case 2: setup_Dijkstra(); break;
        }

        // A graph exists so we can run algorithms
        isSetup = true;
        if (runNext) {
            runNext = false;
            run();
        }

        function tick() {

          path.attr("d", function(d) {
            // var dx = d.target.x - d.source.x,
            //     dy = d.target.y - d.source.y,
            //     dr = 75/d.linknum;  //linknum is defined above
            return "M" + String(d.source.x - X_OFFSET) + "," + String(d.source.y - Y_OFFSET) + "L" + String(d.target.x - X_OFFSET) + "," + String(d.target.y - Y_OFFSET);
          });

          circle.attr("transform", function(d) {
            return "translate(" + String(d.x - X_OFFSET) + "," + String(d.y - Y_OFFSET) + ")";
          });

          text.attr("transform", function(d) {
            return "translate(" + String(d.x - X_OFFSET) + "," + String(d.y - Y_OFFSET) + ")";
          });
           
         
        }

    });
};

/**
 * Sets up the binary heap and dist values for Dijkstra's algorithm.
 */
function setup_Dijkstra(algo_num, direction) {

    //Set up Heap display and color nodes to initial state
    dist = {};
    algo_nodes.forEach(function(node) {
        colorNode(node, ON_HEAP_COLOR);
        setDistance(node, MAX_NUM);
    });

    //set start node dist to 0
    setDistance(START_NODE, 0);

    //Initialize heap
    var H = new Heap(dist);
    //color start node green
    colorNode(H.peek(), SHORTEST_TREE_COLOR);

    //Initialize heap display
    DATA_NAME = "dist";
    setupTree(H.h, dist, "Binary Heap");
}

/**
 * Attmept to run the currently selected algorithm
 */
function run() {

    //clear any currently running events
    clearEvents();

    //check if a graph has been built yet
    if (!isSetup) {
        runNext = true;
        setup(cur_algorithm, isDirected);
    } else {

        //compute a static layout just before starting algorithm
        for (var i = 0; i < 500; ++i) force.tick();
        force.stop();

        isRunning = true;
        isSetup = false;

        switch(cur_algorithm) {
            case 0: DFS(); break;
            case 1: BFS(); break;
            case 2: Dijkstra(); break;
            case 3: Bellman(); break;
            case 4: Kruskal(); break;
            case 5: Prim(); break;
            default:
                break;
        }

        return;
    }
}

/**
 * Returns the edge id for an edge from
 * NODE_ID to DESCEND_ID
 */
function get_edge_id(node_id, descend_id) {
    if (node_id < descend_id || isDirected) {
        return edge_ids[node_id+descend_id];
    } else {
        return edge_ids[descend_id+node_id];
    }
};

function get_weight(node_id, descend_id) {
    if (isDirected) {
        return edge_weights[node_id + descend_id];
    }
    if (node_id < descend_id) {
        return edge_weights[node_id+descend_id];
    } else {
        return edge_weights[descend_id+node_id];
    }
}

/**
 * Error message if user attempts to 
 * run MST on a directed graph
 */
function MST_error() {
    var error_msg = algorithms[cur_algorithm] + "'s is only defined for Un-Directed graphs! As are all MST algorithms.";
    d3.select("#error")
        .html(error_msg)
        .attr("class", "alert alert-danger");
    return "";
};
