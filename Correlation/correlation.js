function linspace(lower, upper, nbr) {
	let res = [];
	let step = (upper-lower)/nbr;
	for (var i=0; i<nbr; i++) {
		res.push(lower + i*step);
	}

	return res;
}

function create_data(data, names, order) {
	let n = names.length;
	res = [];
	for (var i=0; i<n; i++) {
		idx_i = order[i];
		for (var j=0; j<n; j++) {
			idx_j = order[j];
			res.push({
				"class": names[i] + " " + names[j],
				"x": order.indexOf(i),
				"y": order.indexOf(j),
				"value": data[i][j]	
			});
		}
	}

	return res;
}

class Plot {
	constructor() {
		this.draw();
	}


	draw() {
		this.svg = d3.selectAll("#plot-svg");

		this.plot = this.svg
                    .selectAll("#plot")
		    .data([1])
		    .join("g")
		    .attr("id", "plot")
		    .attr("transform", "translate(10, 20)");

		this.n = names.length;

		this.data = create_data(corr, names, alpha_order);
		this.size = 17;

		this.color = d3.scaleSequential()
			      .domain([1, 0.0])
			      .interpolator(d3.interpolateBlues);
		
		this.draw_svg(this.data, this.size);


		let resolution_legend = alpha_order.length*this.size/5;
		let legend = this.plot.selectAll("#legend")
		                 .data([1])
		                 .join("g")
		                 .attr("id", "legend")
		                 .attr("transform", "translate(300, 240)");

		let height_square_legend = 2;
		legend.selectAll(".color-legend")
		   .data(d3.range(resolution_legend))
		   .join("rect")
		   .attr("x", 40*this.size)
		   .attr("y", (d,i)=>height_square_legend*i+height_square_legend*this.size)
		   .attr("height", height_square_legend)
		   .attr("width", this.size)
		   .style("fill", d=>{
			   return this.color(1-2*d/(resolution_legend-1));
		   })
		   .attr("class", "color-legend");

		legend.append("rect")
		   .attr("x", 40*this.size)
		   .attr("y", height_square_legend*this.size)
		   .attr("height", height_square_legend*resolution_legend)
		   .attr("width", this.size)
		   .style("fill", "none")
		   .attr("stroke", "black")
		   .attr("id", "border-legend");

		let color_scale = d3.scaleLinear().range([height_square_legend*resolution_legend, 0]).domain([0.0,1]);

		legend.append("g")
		   .call(d3.axisRight(color_scale))
		   .attr("transform", "translate(" + (41*this.size) + "," + (height_square_legend*this.size) + ")")
		   .attr("id", "colorscale");

		legend.append("text")
		      .text("Correlation")
		      .attr("transform", "translate(" + ((this.n-7)*this.size) + "," + (9*this.size) + "), rotate(90)");
		
		this.row_column(10);

		let plot = this.plot;
		let size = this.size;
		let n = this.n;
		
		this.plot.selectAll(".correlation")
		   .on("mouseover", function(d,i) {
			let classes = i.class.split(" ");

			plot.selectAll(".selection.top")
			  .data([1])
			  .join("rect")
			  .attr("class", "selection top")
			  .attr("x", (4+i.x)*size)
			  .attr("y", 4*size)
			  .attr("height", n*size)
			  .attr("width", size)
			  .style("fill", "none")
			  .style("stroke", "black")
			  .style("stroke-width", 4);

			plot.selectAll(".selection.left")
			  .data([1])
			  .join("rect")
			  .attr("class", "selection left")
			  .attr("x", 4*size)
			  .attr("y", (i.y+4)*size)
			  .attr("width", alpha_order.length*size)
			  .attr("height", size)
			  .style("fill", "none")
			  .style("stroke", "black")
			  .style("stroke-width", 4);

			plot.selectAll(".ticker.top")
			  .data([1])
			  .join("text")
			  .text(classes[0])
			  .attr("transform", "translate(" + ((i.x+4.7)*size) + "," + (3*size) + "), rotate(-90)")
			  .style("anchor", "middle")
			  .style("fill", "black")
			  .attr("class", "ticker top");

			plot.selectAll(".ticker.left")
			  .data([1])
			  .join("text")
			  .text(classes[1])
			  .attr("x", 3*size)
			  .attr("y", (i.y+5)*size-2)
			  .style("anchor", "right")
			  .attr("text-anchor", "end")
			  .attr("text-align", "right")
			  .style("fill", "black")
			  .attr("class", "ticker left");
			
			legend.selectAll("#pointer")
			      .data([1])
			      .join("rect")
			      .attr("y", 2*size+color_scale(i.value)-0.5)
			      .attr("x", 40*size)
			      .attr("height", 3)
			      .attr("width", size)
			      .style("fill", "red")
			      .attr("id", "pointer");

			console.log(i.class + ": " + i.value);
		   })
		   .on("mouseout", function(d,i) {
			//d3.selectAll(".correlation")
			//  .style("fill", d=>this.color(d.value));	   
			d3.selectAll(".ticker").style("fill", "none");
			d3.selectAll(".selection").style("fill", "none").style("stroke", "none");
			d3.selectAll("#pointer").style("fill", "none");
			//svg.selectAll(".correlation").attr("opacity", 1.0);
	   });



	}

	draw_svg(data, size) {
		this.plot.selectAll(".correlation")
  		    .data(data)
  		    .join("rect")
  		    .attr("height", size)
  		    .attr("width", size)
  		    .attr("x", (d)=>4*size + size*d.x)
  		    .attr("y", (d)=>4*size + size*d.y)
  		    .attr("stroke", "black")
		    .style("stroke-width", 0.1)
  		    .attr("class", d=>d.class + " correlation")
  		    .style("fill", "none")
  		    .transition().duration(10).delay(d=>(d.x+1)*(d.y+1)*1)
  		    .style("fill", d=>this.color(d.value));
	}

	draw_svg_transition(data, size) {
		this.plot.selectAll(".correlation")
		    .data(data)
		    .join("rect")
		    .attr("height", size)
		    .attr("width", size)
		    .transition().duration(1000)
		    .style("fill", d=>this.color(d.value))
		    .attr("x", (d)=>4*size + size*d.x)
		    .attr("y", (d)=>4*size + size*d.y)
		    //.attr("stroke", "black")
		    .attr("class", d=>d.class + " correlation");
	}

	row_column(duration_) {
		this.plot.selectAll(".column")
		  .data(names)
		  .join("text")
		  .text((d,i)=>names[i])
		  .transition().duration(duration_)
		  .attr("x", 3*this.size)
		  .attr("y", (d,i)=>(i+5)*this.size - 2)
		  .style("anchor", "right")
		  .attr("text-anchor", "end")
		  .attr("text-align", "right")
		  .attr("class", "column");

		this.plot.selectAll(".row")
		  .data(names)
		  .join("text")
		  .text((d,i)=>names[i])
		  .transition().duration(duration_)
		  .attr("transform", (d,i)=>"translate(" + ((i+4.7)*this.size) + "," + (3*this.size) + "), rotate(-90)")
		  .style("anchor", "middle")
		  .attr("class", "row");
	}

	row_column_transition(duration_) {
		let button = d3.selectAll("#update");
		let order;
		if (button.text() == "Sector") {
			console.log("Sector");
			order = alpha_order;
		}
		else {
			console.log("Alpha");
			order = sector_order;
		}

		this.plot.selectAll(".column")
		    .data(order)
		    .text((d,i)=>names[i])
		    .transition().duration(duration_)	
		    .attr("x", 3*this.size)
		    .attr("y", (d,i)=>(order.indexOf(i)+5)*this.size - 2)
		    .style("anchor", "right")
		    .attr("text-anchor", "end")
		    .attr("text-align", "right")
		    .attr("class", "column");

		this.plot.selectAll(".row")
		  .data(order)
		  .text((d,i)=>names[i])
		  .transition().duration(duration_)
		  .attr("transform", (d,i)=>"translate(" + ((order.indexOf(i)+4.7)*this.size) + "," + (3*this.size) + "), rotate(-90)")
		  .style("anchor", "middle")
		  .attr("class", "row");
	}
};



window.addEventListener('load', function(event){
	plot = new Plot();
});

var order_style = false;
document.getElementById("update").addEventListener("click", function(event) {
	let button = d3.selectAll("#update");
	if (order_style) {
		plot.data = create_data(corr, names, alpha_order)
		button.text("Sector");
	}
	else {
		plot.data = create_data(corr, names, sector_order)
		button.text("Alpha");
	}
	order_style = !order_style;
	plot.draw_svg_transition(plot.data, plot.size);
	plot.row_column_transition(1000);
});
/*
	let size = 14;
	let dim = 10;

	
	alpha_order = [ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16,
       17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
       34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

	shuffle_order = [ 4, 15, 44,  3, 24, 48,  5, 10, 49, 28,  6, 47,  8, 41, 13, 32,  2,
       39, 21, 42, 23, 12, 46, 11,  1, 16, 33,  7, 25, 35, 27, 26, 40, 34,
       36, 29,  0, 37, 22, 30, 17, 43, 20, 31, 19, 38,  9, 45, 18, 14, 50];
	
       let n = 50;

	function create_data(order) {
		let data = [];

		let names = ["AXP","O","OMC","INCY","TFX","IDXX","NVR","ODFL","ALXN","CVS","ROL","MO","COP","KIM","EL","WHR","CI","FLIR","COO","F","PKI","GIS","TMO","MCHP","MAR","ADP","CMS","RJF","CTAS","MOS"];
		for (var i=0; i<alpha_order.length; i++) {
			for (var j=0; j<alpha_order.length; j++) {
				data.push({"class": names[i] + " " + names[j],
					   "x": order[i],
					   "y": order[j],
					   "value": (i==j) ? 1 : Math.sin(Math.sin(i)+Math.cos(j))}//2*(i*j)/(n*n-1)-1}//Math.random()*2-1}
					   );
			}
		}

		return data;
	}

	let color = d3.scaleDiverging()
		      .domain([1, 0, -1])
		      .interpolator(d3.interpolateRdBu);

	//svg.selectAll("#holder")
	//   .data([1])
	//   .join("rect")
	//   .attr("height", 30*size)
	//   .attr("width", 30*size)
	//   .attr("x", 4*size)
	//   .attr("y", 4*size)
	//   .style("fill", "none")
	//   .attr("stroke", "black")
	//   .attr("stroke-width", 5)
	//   .attr("id", "holder");

	var data = create_data(alpha_order);

	function draw_svg(data) {
		svg.selectAll(".correlation")
		   .data(data)
		   .join("rect")
		   .attr("height", size)
		   .attr("width", size)
		   .attr("x", (d)=>4*size + size*d.x)
		   .attr("y", (d)=>4*size + size*d.y)
		   //.attr("stroke", "black")
		   .attr("class", d=>d.class + " correlation")
		   .style("fill", "none")
		   .transition().duration(10).delay(d=>(d.x+1)*(d.y+1)*1)
		   .style("fill", d=>color(d.value));
	}

	function draw_svg_transition(data) {
		svg.selectAll(".correlation")
		   .data(data)
		   .join("rect")
		   .attr("height", size)
		   .attr("width", size)
		   .transition().duration(10000)
		   .style("fill", d=>color(d.value))
		   .attr("x", (d)=>4*size + size*d.x)
		   .attr("y", (d)=>4*size + size*d.y)
		   //.attr("stroke", "black")
		   .attr("class", d=>d.class + " correlation");
	}

	draw_svg(data);

	let resolution_legend = alpha_order.length*size/5;
	let legend = svg.selectAll("#legend")
	   .data([1])
	   .join("g")
	   .attr("id", "legend")
	   .attr("transform", "translate(250, 10)");

	legend.selectAll(".color-legend")
	   .data(d3.range(resolution_legend))
	   .join("rect")
	   .attr("x", 40*size)
	   .attr("y", (d,i)=>5*i+5*size)
	   .attr("height", 5)
	   .attr("width", size)
	   .style("fill", d=>{
		   return color(1-2*d/(resolution_legend-1));
	   })
	   .attr("class", "color-legend");

	legend.append("rect")
	   .attr("x", 40*size)
	   .attr("y", 5*size)
	   .attr("height", 5*resolution_legend)
	   .attr("width", size)
	   .style("fill", "none")
	   .attr("stroke", "black")
	   .attr("id", "border-legend");

	let color_scale = d3.scaleLinear().range([5*resolution_legend, 0]).domain([-1,1]);

	legend.append("g")
	   .call(d3.axisRight(color_scale))
	   .attr("transform", "translate(" + (41*size) + "," + (5*size) + ")")
	   .attr("id", "colorscale");

	svg.selectAll(".correlation")
	   .on("mouseover", function(d,i) {
		let classes = i.class.split(" ");

		//d3.selectAll("." + classes[0])
		//  .filter(d=>d.class.split(" ")[0]==classes[0])
		//  .style("fill", "grey");
		//d3.selectAll("." + classes[1])
		//  .filter(d=>d.class.split(" ")[1]==classes[1])
		//  .style("fill", "grey");
		//svg.selectAll(".correlation")
		//   .filter(d=>{
		//	   return d.class.split(" ")[0]!=classes[0] &&
		//	          d.class.split(" ")[1]!=classes[1];
		//   })
		//   .attr("opacity", 0.3);

		svg.selectAll(".selection.top")
		  .data([1])
		  .join("rect")
		  .attr("class", "selection top")
		  .attr("x", (4+i.x)*size)
		  .attr("y", 4*size)
		  .attr("height", alpha_order.length*size)
		  .attr("width", size)
		  .style("fill", "none")
		  .style("stroke", "black")
		  .style("stroke-width", 4);

		svg.selectAll(".selection.left")
		  .data([1])
		  .join("rect")
		  .attr("class", "selection left")
		  .attr("x", 4*size)
		  .attr("y", (i.y+4)*size)
		  .attr("width", alpha_order.length*size)
		  .attr("height", size)
		  .style("fill", "none")
		  .style("stroke", "black")
		  .style("stroke-width", 4);

		svg.selectAll(".ticker.top")
		  .data([1])
		  .join("text")
		  .text(classes[0])
		  .attr("transform", "translate(" + ((i.x+4.6)*size) + "," + (3*size) + "), rotate(-90)")
		  .style("anchor", "middle")
		  .style("fill", "black")
		  .attr("class", "ticker top");

		svg.selectAll(".ticker.left")
		  .data([1])
		  .join("text")
		  .text(classes[1])
		  .attr("x", size)
		  .attr("y", (i.y+5)*size)
		  .style("anchor", "right")
		  .style("fill", "black")
		  .attr("class", "ticker left");
		
		legend.selectAll("#pointer")
		      .data([1])
		      .join("rect")
		      .attr("y", 10*size+color_scale(i.value)-0.5)
	   	      .attr("x", 40*size)
		      .attr("height", 3)
		      .attr("width", size)
		      .style("fill", "black")
		      .attr("id", "pointer");
	   })
	   .on("mouseout", function(d,i) {
		d3.selectAll(".correlation")
		  .style("fill", d=>color(d.value));	   
		d3.selectAll(".ticker").style("fill", "lightgrey");
		d3.selectAll(".selection").style("fill", "none").style("stroke", "none");
		d3.selectAll("#pointer").style("fill", "none");
		//svg.selectAll(".correlation").attr("opacity", 1.0);
	   });

var order_style = true;
document.getElementById("update").addEventListener("click", function(event) {
	if (order_style) {
		data = create_data(shuffle_order)
	}
	else {
		data = create_data(alpha_order)
	}
	order_style = !order_style;
	draw_svg_transition(data);
});
*/
//
//	console.log(files[1]);
//}).catch(function (err) {
//	console.log(err);
//})

