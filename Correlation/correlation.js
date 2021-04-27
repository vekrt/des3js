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
		   })
		   .on("mouseout", function(d,i) {
			d3.selectAll(".ticker").style("fill", "none");
			d3.selectAll(".selection").style("fill", "none").style("stroke", "none");
			d3.selectAll("#pointer").style("fill", "none");
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
			order = alpha_order;
		}
		else {
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
