var elmTypes = ["algo", "direction", "speed", "run", "pause", "step",  "changeBackground", "download", "dropdown-toggle"],
    collapseTargetIds = ["algo-btns", "direction-btns", "speed-btns", "util-btns"],
    dropdownMenuIds = ["algo-dropdown-menu", "direction-dropdown-menu", "speed-dropdown-menu", "util-dropdown-menu"];
/**
 * Controls collapsing and uncollapsing buttons after their associated dropdown has shown
 */
$(".btn-group").on('shown.bs.dropdown', function() {
  var targetIndex = collapseTargetIds.indexOf($(this).attr("data-val"));
  $(".fluff").html("<br><br>");
  for (var i = 0; i < collapseTargetIds.length; i++) {
    if (i !== targetIndex) {
      $("#" + collapseTargetIds[i]).collapse('hide');
    } else {
      $("#" + collapseTargetIds[i]).collapse('show');
    }
  }
});

$(".btn-group").on('hide.bs.dropdown', function() {
    $(".fluff").html("");
  $("#" + $(this).attr("data-val")).collapse('hide');
})

//don't want the utils to close when the buttons are clicked
$('.util-item').click(function(e) {
        e.stopPropagation();
});

/**
 * This is some unfortunatley ugly javascript for handling all of the button events.
 * I tried to make this as neat as possible...
 */

$(".btn").on("click", function(event) {
  var elmType = $(this).attr("type"),
      dataVal = $(this).attr("data-val");

  var typeIndex = elmTypes.indexOf(elmType);

  switch(typeIndex) {
    case 0: $(".btn[type='algo']").removeClass("active")
            $(this).addClass("active");
            $("#algo-badge").html($(this).html());
            $("#algo-btns").collapse('hide');
            setUnPause();
            setup(+dataVal, isDirected);
    break;

    case 1: $(".btn[type='direction']").removeClass("active")
            $(this).addClass("active");
            $("#direction-badge").html($(this).html());
            $("#direction-btns").collapse('hide');
            var bool = (dataVal.toLowerCase() === 'true');
            if (isDirected !== bool) {
              isDirected = bool;
              setUnPause();
              setup(cur_algorithm, isDirected);
            }
    break;

    case 2: $(".btn[type='speed']").removeClass("active")
            $(this).addClass("active");
            $("#speed-badge").html($(this).html());
            $("#speed-btns").collapse('hide');
            FLASH_INT = +dataVal;
    break;

    case 3: setPause();
            run();
    break;

    case 4: if (graphExists) {
                if(isPaused) {
                    setPause();
                    isSetup = false;
                    runAnimation();
                } else {
                  setUnPause();
                }
            } else {
                setPause();
                run();
            }
    break;

    case 5: setUnPause();
            if (dataVal === "backward") {
                currentStateIndex = Math.max(0, currentStateIndex-=1);
                setCurrentState();
            } else {
                currentStateIndex = Math.min(algorithmStates.length-1, currentStateIndex);
                runAnimation();
            }
    break;

    case 6: toggleBackground();
    break;

    case 7: download(algorithms[cur_algorithm]);
    break;

    //when we click a collapse controller button it should 
    //hide all other collapsible targets besides its own
    case 8:     
    break;

    default:
      console.log("Error elmtype not found: " + elmType);
      return;
  }

  $(this).blur();   //don't want buttons to focus after selection
})

function setPause() {
    isPaused = false;
    var pauseBtn = $(".btn[type=pause]");
    pauseBtn.html("<span class='glyphicon glyphicon-pause'></span>");
}

function setUnPause() {
    isPaused = true;
    var pauseBtn = $(".btn[type=pause]");
    pauseBtn.html("<span class='glyphicon glyphicon-play'></span>");
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

/**
 * Toggles the background color.
 */
function toggleBackground() {
    var dur = 400,
        black = "#000000",
        white = "#FFFFFF",
        blue = "#0066FF",
        new_color = (CUR_BACKGROUND_COLOR == black) ? white : black, //Switch between black and white background
        title_color = (new_color == white) ? black : blue;

    //color title
    d3.select("#page-title").transition()
    .style("color", title_color)
    .duration(dur);
    //color svg background
    d3.selectAll("svg").transition()
    .style("background", new_color)
    .duration(dur);
    //color body background
    d3.select("body").transition()
    .style("background-color", new_color)
    .duration(dur);
    //color all text
    var temp = CUR_BACKGROUND_COLOR;
    d3.selectAll("text").transition()
    .style("fill", temp) //text is opposite color of background
    .duration(dur);

    //change button text and color
    var btn = $(".btn[type='changeBackground']");
    if (new_color == white) {
        btn.html("Darker");
        btn.addClass("btn-inverse");
        btn.removeClass("btn-default");
    } else {
        btn.html("Lighter");
        btn.addClass("btn-default");
        btn.removeClass("btn-inverse");
    }

    CUR_TEXT_COLOR = CUR_BACKGROUND_COLOR;
    CUR_BACKGROUND_COLOR = new_color;
}

/**
 * Downloads the current graph as a PNG file.
 */
function download(fileName) {
  if(graphExists) {
    var svg = d3.select("#svg-algo"),
        html = svg
          .attr("version", 1.1)
          .attr("xmlns", "http://www.w3.org/2000/svg")
          .node().parentNode.innerHTML;

    downloadData(html, fileName);

    //also download the data struct if it exists
    var structSvg = d3.select("#svg-data-struct");
    if (!structSvg.empty()) {
        html = structSvg
          .attr("version", 1.1)
          .attr("xmlns", "http://www.w3.org/2000/svg")
          .node().parentNode.innerHTML;
        downloadData(html, $("#data-struct-title").text());
    }
  }
}

function downloadData(html, fileName) {
    var canvasId = "sBqSmOcj-1932418",
        imgsrc = 'data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(html)));

    var canvas;
    if (!document.getElementById(canvasId)) {

      canvas = document.createElement("canvas");
      canvas.id = canvasId;
      canvas.height = 800;
      canvas.width = 960;
      canvas.style.display = "none";
      document.body.appendChild(canvas);

    }

    canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");

    var image = new Image;
    image.src = imgsrc;
    image.onload = function() {

        context.drawImage(image, 0, 0);

        var a = document.createElement("a");
        a.download = fileName + ".png";
        a.href = canvas.toDataURL("image/png");
        a.click();
    };
}
