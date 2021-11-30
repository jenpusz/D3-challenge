
// initial settings

var svgWidth = 1000;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 140,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create svg element

var svg = d3.select("#scatter") 
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


// add chart  

var chart = svg.append("g") 
  .attr("height", height)
  .attr("width", width)
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// set initial active attributes

var xattr = "poverty";
var yattr = "healthcare";

// update x-scale 

 function xscale(data, xattr) {
    var xline = d3.scaleLinear()
      .domain([d3.min(data, d => d[xattr]) * 0.8,
      d3.max(data, d => d[xattr]) * 1.2 ])
      .range([0, width]);
  
    return xline;
  }

// update y-scale

function yscale(data, yattr) {
    var yline = d3.scaleLinear()
      .domain([d3.min(data, d => d[yattr]) * 0.8,
      d3.max(data, d => d[yattr]) * 1.1 ])
      .range([height, 0]);
  
    return yline;
  }

// update x axis on label click

function setx(xscale, xaxis) {
    var bottom = d3.axisBottom(xscale);
  
    xaxis.transition()
      .duration(1000)
      .call(bottom);
  
    return xaxis;
  }


// update y axis on label click

  function sety(yscale, yAxis) {
    var left = d3.axisLeft(yscale); 
    yaxis.transition()
      .duration(500)
      .call(left);
  
    return yaxis;
  }

// update circles

function setcircles(circles, xscale, xattr, yscale, yattr) {
    circles.transition()
      .duration(1000)
      .attr("cx", d => xscale(d[xattr]))
      .attr("cy", d => yscale(d[yattr]));
    return circles;
  }


// circle text function

function settext(circletext, xscale, xattr, yscale, yattr) {
    circletext.transition()
        .duration(1000)
        .attr("x", d => xscale(d[xattr]))
        .attr("y", d => yscale(d[yattr]));
      return circletext;
    }

// function to update circle tooltip

function updatetooltip(xattr,yattr, circles) {
    console.log("update tool tip", xattr);
    var label;
   
    // set x and y axis label on tooltip based on selection
    if (xattr === "poverty") {
      label = "Poverty:";
    }
    else if (xattr === "age") {
      label = "Age:";
    }
    else {
      label = "Household Income:";
    }
   
    if (yattr === "obesity") {
      ylabel = "Obesity:";
    }
    else if (yattr === "smokes") {
      ylabel = "Smokes:";
    }
    else {
      ylabel = "Lacks Healthcare:";
    }
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (d) {
            if (xattr === "poverty") {
              return (`${d.state}<br>${label} ${d[xattr]}%<br>${ylabel} ${d[yattr]}%`); 
            }
            else
            return (`${d.state}<br>${label} ${d[xattr]}<br>${ylabel} ${d[yattr]}%`);
      });
     
    //function chosen x and y tooltip
    circles.call(toolTip);
    circles.on("mouseover", function (data) {
      toolTip.show(data,this);
    })
      // on mouseout event
      .on("mouseout", function (data, index) {
        toolTip.hide(data,this);
      });
  
    return circles;
  }


// read data

d3.csv("assets/data/data.csv").then(function (data) {
  // cast values appropriately
  data.forEach(d => {
      d.poverty    = +d.poverty;
      d.healthcare = +d.healthcare;
      d.age        = +d.age;
      d.income     = +d.income;
      d.obesity    = +d.obesity;
      d.smokes     = +d.smokes;
});


// axis scale function 

var xline = xscale(data, xattr);
var yline = yscale(data, yattr);


// axis create functions

var bottom = d3.axisBottom(xline);
var left = d3.axisLeft(yline);


// append axes to chart

var xaxis = chart.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottom);
  
    chart.append("g")
    .call(left); 


// create Circles

var circles = chart.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xline(d[xattr])) 
    .attr("cy", d => yline(d[yattr])) 
    .attr("r", "15") 
    .attr("class", "stateCircle") 
    .attr("opacity", ".7");


// create axis labels

var labels = chart.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

var povertylabel = labels.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty %");

var incomelabel = labels.append("text")
    .attr("x", 0)
    .attr("y", 30)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

var agelabel = labels.append("text")
    .attr("x", 0)
    .attr("y", 45)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("Age (Median)");  
 
var obesitylabel = labels.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height -60))
    .attr("value", "obesity") 
    .classed("active", true)
    .text("Obesity (%)");

var smokeslabel = labels.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height -40))
    .attr("value", "smokes") 
    .classed("inactive", true)
    .text("Smokes (%)");

var healthcarelabel = labels.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height -20))
    .attr("value", "healthcare") 
    .classed("inactive", true)
    .text("Lacks Healthcare (%)"); 


//  add text to circles

  var circletext = chart.selectAll()
    .data(data)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("x", d => xline(d[xattr])) 
    .attr("y", d => yline(d[yattr])) 
    .attr("class", "stateText") 
    .attr("font-size", "9");

// update ToolTip function 

var circles = updatetooltip(xattr, yattr,circles);

// axis label event listener

labels.selectAll("text")
  .on("click", function () { 
    // get selection
    var value = d3.select(this).attr("value");

   if(true){   
    if (value == "poverty" || value=="income" || value=="age") { 
      console.log(value)
      
      xattr = value;
    
      xline = xscale(data, xattr);

      
      xaxis = setx(xline, xaxis);

      
      if (xattr === "income") {
        incomelabel
          .classed("active", true)
          .classed("inactive", false);
        povertylabel
          .classed("active", false)
          .classed("inactive", true);
        agelabel
          .classed("active", false)
          .classed("inactive", true); 
      }
      else if(xattr == "age"){
        agelabel
        .classed("active", true)
        .classed("inactive", false);  
        povertylabel
        .classed("active", false)
        .classed("inactive", true);
        incomelabel
        .classed("active", false)
        .classed("inactive", true);
      }
      else {
        povertylabel
          .classed("active", true)
          .classed("inactive", false);
        incomelabel
          .classed("active", false)
          .classed("inactive", true);
        agelabel
          .classed("active", false)
          .classed("inactive", true); 
     }
    } 
    else
      
      yattr = value;
      yline = yscale(data, yattr);
     

      if (yattr === "obesity") {
        obesitylabel
          .classed("active", true)
          .classed("inactive", false);
        healthcarelabel
          .classed("active", false)
          .classed("inactive", true);
        smokeslabel
          .classed("active", false)
          .classed("inactive", true); 
      }
      else if(yattr == "healthcare"){
        healthcarelabel
        .classed("active", true)
        .classed("inactive", false);  
        obesitylabel
        .classed("active", false)
        .classed("inactive", true);
        smokeslabel
        .classed("active", false)
        .classed("inactive", true);

      }
      else {
        smokeslabel
          .classed("active", true)
          .classed("inactive", false);
        healthcarelabel
          .classed("active", false)
          .classed("inactive", true);
        obesitylabel
          .classed("active", false)
          .classed("inactive", true); 
     }
  
     // update circles
     circles = setcircles(circles, xline, xattr, yline, yattr);
     circletext = settext(circletext, xline, xattr, yline, yattr); 
     circles = updatetooltip(xattr, yattr, circles);
  } 
}); 


}).catch(function (error) {
    console.log(error);
  });
