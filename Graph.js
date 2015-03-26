// control variables
var cur_algorithm = 0,
    isDirected = false,
    isPositive = true,
    isSetup = false;
    nodes = {},
    force = "",
    algo_nodes = new Set(),
    start_node_color = "#0066FF",
    start_edge_color = "#666",
    undirect_ids = {};

// Files containing the graphs
var algorithms = [
    "DFS", "BFS", "Dijkstra", "Bellman", "Kruskal", "Prim"],
    direct_csv_files = {
        "DFS" : "./DFS_direct.csv",
        "BFS" : "./BFS_direct.csv",
        "Dijkstra" : "./Dijkstra_direct.csv",
        "Bellman" : "./Bellman_direct.csv",
        "Kruskal" : "",
        "Prim" : ""
    },
    undirect_csv_files = {
        "DFS" : "./DFS_undirect.csv",
        "BFS" : "./BFS_undirect.csv",
        "Dijkstra" : "./Dijkstra_undirect.csv",
        "Bellman" : "./Bellman_undirect.csv",
        "Kruskal" : "./Kruskal.csv",
        "Prim" : "Prim.csv"
    };

function setup(name, directed) {
    var x = document.getElementsByClassName("graph");
    x[0].innerHTML = "";
    cur_algorithm = name;
    // choose which data to use
    var csv = "";
    if (directed) {
        csv = direct_csv_files[algorithms[name]];
    } else {
        csv = undirect_csv_files[algorithms[name]];
    }

    if (csv == "") {
        MST_error();
        return;
    }

    console.log(csv);

    d3.csv(csv, function(error, links) {
        //sort links by target
        links.sort(function(a,b) {
            if (a.target > b.target) {return 1;}
            if (a.target < b.target) {return -1;}
            else {return 0;}
        });

        //any links with duplicate source and target get an incremented 'linknum'
        for (var i=0; i<links.length; i++) {
            if (i != 0 &&
                links[i].source == links[i-1].source &&
                links[i].target == links[i-1].target) {
                    links[i].linknum = links[i-1].linknum + 1;
                }
            else {links[i].linknum = 1;};
        };

        nodes = {};
        algo_nodes = new Set();
        undirect_ids = {};

        // Compute the distinct nodes from the links.
        links.forEach(function(link) {
            link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, adjacent: []});
            link.target = nodes[link.target] || (nodes[link.target] = {name: link.target, adjacent: []});


            // set up adjacency list
            nodes[link.source.name].adjacent.push( {node: nodes[link.target.name]} );
            if (!isDirected) {
                nodes[link.target.name].adjacent.push( {node: nodes[link.source.name]} );

                // if it's undirected need to figure out what edge ids to change the color of
                a = link.target.name;
                b = link.source.name;
                if (a < b) {
                    undirect_ids[a + b] = link.source.name + "->" + link.target.name;
                } else {
                    undirect_ids[b + a] = link.source.name + "->" + link.target.name;
                }
            }

            // keep a set all of the nodes that are in the graph
            algo_nodes.add(link.source.name);
            algo_nodes.add(link.target.name);

        });

        var w = 960,
            h = 600;

        force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(links)
            .size([w, h])
            .linkDistance(150)
            .charge(-1000)
            .linkStrength(.9)
            .on("tick", tick)
            .start();

        console.log(force.nodes());

        var svg = d3.select("div.graph").append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .style("background" ,"#FFF7DB");

        var max = 20;
        var weights = [];
        if (isPositive) {
            for (i=1; i < max; i++) {
                weights.push("w=" + i);
            };
        } else {
            for (i=-max; i < max; i++){
                weights.push("w=" + i);
            };
        };

        var marker_h = 10,
            marker_w = 10;

        if (!isDirected) {
            marker_h=0;
            marker_w=0;
        }

        // Per-type markers, as they don't inherit styles.
        svg.append("svg:defs").selectAll("marker")
            .data(weights)
          .enter().append("svg:marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 24)
            .attr("refY", 0)
            .attr("markerWidth", marker_w)
            .attr("markerHeight", marker_h)
            .attr("orient", "auto")
          .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        var path = svg.append("svg:g").selectAll("path")
            .data(force.links())
          .enter().append("svg:path")
            .attr("class", function(d) { return "link " + d.type; })
            .attr("id",function(d) { return d.source.name + "->" + d.target.name; })
            .attr("marker-end", function(d) { return "url(#" + "w=" + d.type + ")"; })
            .style("stroke", start_edge_color);

        var linktext = svg.append("svg:g").selectAll("g.linklabelholder")
            .data(force.links())
          .enter().append("g").attr("class", "linklabelholder")
             .append("text")
             .attr("class", "linklabel")
             .style("font-size", "13px")
             .attr("x", "50")
             .attr("y", "-20")
             .attr("text-anchor", "start")
             .style("fill","#000")
             .append("textPath")
             .attr("xlink:href",function(d) { return "#" + d.source.name + "->" + d.target.name; })
             .text(function(d) { 
             return d.type; 
             });
            
        var circle = svg.append("svg:g").selectAll("circle")
            .data(force.nodes())
           .enter().append("svg:circle")
            .attr("r", 20)
            .attr("id", function(d) {return d.name})
            .style("fill", start_node_color)
            .call(force.drag);


        var text = svg.append("svg:g").selectAll("g")
            .data(force.nodes())
          .enter().append("svg:g");

        text.append("svg:text")
            .attr("x", "-1em")
            .attr("y", ".31em")
             .style("font-size", "13px")
            .text(function(d) { return d.name; })
            .attr("id", function(d) {return "node_text:" + d.name});

        // A graph exists so we can run algorithms
        isSetup = true;

        // Use elliptical arc path segments to doubly-encode directionality.
        function tick() {
          path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = 75/d.linknum;  //linknum is defined above
            return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
          });

          circle.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          });

          text.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          });
           
         
        }

    });
};

function run() {

    //check if a graph has been built yet
    if (!isSetup) {
        setup(cur_algorithm, isDirected);
    }

    force.stop();

    switch(cur_algorithm) {
        case 0: DFS(); break;
        case 1: BFS(); break;
        case 2: Dijsktra(); break;
        case 3: Bellman(); break;
        case 4: Kruskal(); break;
        case 5: Prim(); break;
        default:
            break;
    }

    isSetup = false;

    // Grab a node and change its color after it is made
    // document.getElementById("A").setAttribute("style", "fill : #FF0000");
    // document.getElementById("A->B").setAttribute("style", "stroke: #FF0000");
    // document.getElementById("node_text:A").innerHTML = "A=inf"
    return;
}

function MST_error() {
    var x = document.getElementsByClassName("graph");
    x[0].innerHTML = algorithms[cur_algorithm] + "'s is only defined for un-directed graphs! As are all MST algorithms.";
    return "";
};
