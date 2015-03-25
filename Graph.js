// control variables
var cur_algorithm = 0,
    isDirected = false,
    isPositive = true
    algorithms = [
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
    console.log(cur_algorithm);
    cur_algorithm = name;
    console.log(name);
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

        var nodes = {};

        // Compute the distinct nodes from the links.
        links.forEach(function(link) {
          link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
          link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
        });

        var w = 960,
            h = 600;

        var force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(links)
            .size([w, h])
            .linkDistance(150)
            .charge(-1000)
            .linkStrength(.9)
            .on("tick", tick)
            .start();

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

        // Per-type markers, as they don't inherit styles.
        svg.append("svg:defs").selectAll("marker")
            .data(weights)
          .enter().append("svg:marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 30)
            .attr("refY", -4.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
          .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        var path = svg.append("svg:g").selectAll("path")
            .data(force.links())
          .enter().append("svg:path")
            .attr("class", function(d) { return "link " + d.type; })
            .attr("id",function(d,i) { return "linkId_" + i; })
            .attr("marker-end", function(d) { return "url(#" + "w=" + d.type + ")"; });

        var linktext = svg.append("svg:g").selectAll("g.linklabelholder").data(force.links());
        
            linktext.enter().append("g").attr("class", "linklabelholder")
             .append("text")
             .attr("class", "linklabel")
             .style("font-size", "13px")
             .attr("x", "50")
             .attr("y", "-20")
             .attr("text-anchor", "start")
             .style("fill","#000")
             .append("textPath")
             .attr("xlink:href",function(d,i) { return "#linkId_" + i;})
             .text(function(d) { 
             return d.type; 
             });
            
        var circle = svg.append("svg:g").selectAll("circle")
            .data(force.nodes())
          .enter().append("svg:circle")
            .attr("r", 20)
            .style("fill", "#FD8D3C")
            .call(force.drag);

        var text = svg.append("svg:g").selectAll("g")
            .data(force.nodes())
          .enter().append("svg:g");

        text.append("svg:text")
            .attr("x", "-1em")
            .attr("y", ".31em")
             .style("font-size", "13px")
            .text(function(d) { return d.name; });

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

function MST_error() {
    var x = document.getElementsByClassName("graph");
    x[0].innerHTML = algorithms[cur_algorithm] + "'s is only defined for un-directed graphs! As are all MST algorithms.";
    return "";
};
