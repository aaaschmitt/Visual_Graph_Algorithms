// control variables
var cur_algorithm = "DFS",
    isDirected = false;

function setup(name, directed) {
    cur_algorithm = name;
    // choose which data to use
    csv = ""
    if (directed) {
        switch (name) {
            case "DFS":
                csv = "./DFS_direct.csv"
                break;
            case "BFS":
                csv = "./BFS_direct.csv"
                break;
            case "Dijkstra":
                csv = "./Dijkstra_direct.csv"
                break;
            case "Bellman":
                csv = "./Bellman_direct.csv"
                break;
            case "Kruskal":
                MST_error();
                return;
            case "Prim":
                MST_error();
                return;
            default:
                throw "incorrect directed algorithm name: " + name
        }
    } else {
        switch (name) {
            case "DFS":
                csv = "./DFS_undirect.csv"
                break;
            case "BFS":
                csv = "./BFS_undirect.csv"
                break;
            case "Dijkstra":
                csv = "./Dijkstra_undirect.csv"
                break;
            case "Bellman":
                csv = "./Bellman_undirect.csv"
                break;
            case "Kruskal":
                csv = "./Kruskal.csv"
                break;
            case "Prim":
                csv = "./Prim.csv"
                break;
            default:
                throw "incorrect un-directed algorithm name: " + name
        }
    }

    d3.csv(csv, function(error, links) {


    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] || 
            (nodes[link.source] = {name: link.source});
        link.target = nodes[link.target] || 
            (nodes[link.target] = {name: link.target});
        link.value = +link.value;
    });

    var width = 960,
        height = 500;

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(60)
        .charge(-300)
        .on("tick", tick)
        .start();

    var svg = d3.select("div.graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    // build the arrow.
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
      .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    // add the links and the arrows
    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
      .enter().append("svg:path")
    //    .attr("class", function(d) { return "link " + d.type; })
        .attr("class", "link")
        .attr("marker-end", "url(#end)");

    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
      .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    // add the nodes
    node.append("circle")
        .attr("r", 5);

    // add the text 
    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });

    // add the curvy lines
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + 
                d.source.x + "," + 
                d.source.y + "A" + 
                dr + "," + dr + " 0 0,1 " + 
                d.target.x + "," + 
                d.target.y;
        });

        node
            .attr("transform", function(d) { 
      	    return "translate(" + d.x + "," + d.y + ")"; });
    }

    });
};

function MST_error() {
    var x = document.getElementsByClassName("graph");
    x[0].innerHTML = cur_algorithm + "'s is only defined for un-directed graphs! As are all MST algorithms.";
}
