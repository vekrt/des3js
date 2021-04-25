const pi2 = 2 * Math.PI;

function generate_data(typ) {
	let data = []
	while (data.length < 10000) {
		let u1 = Math.random();
		let u2 = Math.random();

		let res;
		if (typ == 'normal') {
			res = box_muller(u1, u2);
		}
		else if (typ == "uniform") {
			res = [u1, u2];
		}
		else {
			res = [-Math.log(1-u1), -Math.log(1-u2)];
		}

		data.push(res[0]);
		data.push(res[1]);
	}

	return data;
}

function linspace(lower, upper, nbr) {
	let res = [];
	let step = (upper-lower)/nbr;
	for (var i=0; i<nbr; i++) {
		res.push(lower + i*step);
	}

	return res;
}

function histogram(value, array_bins, end_value) {
	let res = [];
	for (var i=0; i<array_bins.length-1; i++) {
		let filtered = d3.filter(value, (d) => {return d>array_bins[i] &&
		                                               d<array_bins[i+1]});
		res.push({"length": filtered.length, "x0": array_bins[i], "x1": array_bins[i+1]}); 
	}
	let filtered = d3.filter(value, (d) => {return d>array_bins[array_bins.length-1] &&
						       d<end_value});
	res.push({"length": filtered.length, "x0": array_bins[array_bins.length-1], "x1": end_value}); 

	return res;
}

function step_line(hist) {
	let res = [];
	for (d of hist) {
		res.push({"x": d.x0, "y": d.length});
		res.push({"x": d.x1, "y": d.length});
	}
	res.push({"x": hist[hist.length-1].x1, "y": hist[hist.length-1].length});

	return res;
}

class Plot {
	constructor() {
		this.draw();
	}

	draw() {
		console.log("Plot");

		this.distribution = d3.selectAll("#distribution").property("value");

		this.data = generate_data(this.distribution);
		this.body = d3.select("body");
		this.svg  = this.body.selectAll("#svg_plot");

		this.margin = {top: 10, right: 10, bottom: 50, left: 40};
		
		let dimension = this.get_dimension();

		let width  = dimension[0] - this.margin.left - this.margin.right;
		let height = dimension[1] - this.margin.top  - this.margin.bottom;

		this.set_svg(width + this.margin.left, height + this.margin.bottom);

		this.svg.append("defs")
		    .append("clipPath")
		    .attr("id", "clip")
		    .append("rect")
		    .attr("width", width)
		    .attr("height", height);
            

		this.svg
		    .selectAll("#plot")
		    .data([1])
		    .join("g")
		    .attr("id", "plot")
		    .attr("transform",
			  "translate(" + this.margin.left + "," + this.margin.top + ")");

		this.plot = this.svg.selectAll("#plot");

		this.range = {"normal": [-4,4], "uniform": [0,1], "exponential": [0.0001, 10]};
		let selected_range = this.range[this.distribution];
		this.upper_bounds = {"normal": 1.0/Math.sqrt(pi2), "uniform": 1.5, "exponential": 2}
		let selected_upper_bound = this.upper_bounds[this.distribution];

		this.nbr_bins = 40;
		this.array_bins = linspace(selected_range[0], selected_range[1], this.nbr_bins);
		this.bins = histogram(this.data, this.array_bins, selected_range[1]);
		this.normalising_const = constant(this.bins);

		this.xscale = d3.scaleLinear().range([this.margin.left, width - this.margin.right])
		                              .domain([selected_range[0], selected_range[1]]);
		
		this.linear_yscale = true;

		if (this.linear_yscale) {
			this.yscale = d3.scaleLinear()
				        .range([height, 0])
		                        .domain([0.0, d3.max([selected_upper_bound, d3.max(this.bins, d=>d.length/this.normalising_const)])]);
		}
		else {
			this.yscale = d3.scaleLog()
				        .range([height, 0])
		                        .domain([0.0001, d3.max([selected_upper_bound, d3.max(this.bins, d=>d.length/this.normalising_const)])]);
		}

		this.draw_svg(height, width, 1000);


		this.line = d3.line()
			      .x(d=>this.xscale(d));

		if (this.distribution == "normal") {
			this.line.y(d=>this.yscale(normal_pdf(d)));
		}
		else if (this.distribution == "uniform") {
			this.line.y(d=>this.yscale(1));
		}
		else {
			this.line.y(d=>this.yscale(Math.exp(-d)));
		}

		let flat_line = d3.line()
				  .x(d=>this.xscale(d))
				  .y(height);

		let flat_line_hist = d3.line()
				       .x(d=>this.xscale(d.x))
				       .y(height);

		this.step_line = d3.line()
		                   .x(d=>this.xscale(d.x))
				   .y(d=>this.yscale(d.y/this.normalising_const));
	
		this.plot
		    .append("path")
		    .datum(step_line(this.bins))
  		    .attr("d", flat_line_hist)
  		    .transition().duration(1000)
		    .attr("d", this.step_line)
		    .attr("id", "line-hist");
 
		this.plot
  		    .datum(d3.ticks(selected_range[0], selected_range[1], 100))
  		    .append("path")
  		    .attr("d", flat_line)
  		    .transition().duration(500)
  		    .attr("d", this.line)
  		    .attr("id", "line-pdf");

		this.plot
		    .append("g")
		    .attr("id", "x-axis")
		    .call(d3.axisBottom(this.xscale))
		    .attr("transform", "translate(0," + height + ")");

		this.plot
		    .append("g")
		    .attr("id", "y-axis")
		    .call(d3.axisLeft(this.yscale))
		    .attr("transform", "translate(" + this.margin.left + ",0)");

		this.plot
		    .append("text")
		    .raise()
		    .attr("id", "xlabel")
		    .text("x")
		    .attr("transform", "translate(" + (width/2.0+this.margin.left/2.6) + "," + (height+this.margin.bottom/1.5) + ")");

		this.plot
		    .append("text")
		    .raise()
		    .attr("id", "ylabel")
		    .attr("transform", "rotate(-90)")
		    .attr("y", 0 - this.margin.left/2.0)
		    .attr("x", 0 - (height/1.6))
		    .style("anchor", "middle")
		    .text("Probaility density");

		this.legend = this.plot
		    .append("g")
		    .attr("transform", "translate(" + width/1.1 + "," + " 50)")
		    .attr("id", "legend");

		this.legend.append("text").text("Sample").attr("transform", "translate(20, 10)");
		this.legend.append("rect").attr("class", "legend-hist").attr("height", 10).attr("x", -10).attr("y", 0).attr("width", 20);
		this.legend.append("text").text("Theory").attr("transform", "translate(20, 30)");
		this.legend.append("rect").attr("fill", "red").attr("height", 2).attr("x", -10).attr("y", 25).attr("width", 20);
	}

	redraw() {
		let dimension = this.get_dimension();
		let width  = dimension[0] - this.margin.left - this.margin.right;
		let height = dimension[1] - this.margin.top  - this.margin.bottom;

		this.distribution = d3.selectAll("#distribution").property("value");

		this.set_svg(width + this.margin.left, height + this.margin.bottom);

		d3.selectAll("#clip").select("rect")
		  .attr("width", width)
		  .attr("height", height);

		let selected_range = this.range[this.distribution];
		let selected_upper_bound = this.upper_bounds[this.distribution];

		this.array_bins = linspace(selected_range[0], selected_range[1], this.nbr_bins);
		this.bins = histogram(this.data, this.array_bins, selected_range[1]);
		this.normalising_const = constant(this.bins);

		if (this.linear_yscale) {
			this.yscale = d3.scaleLinear()
				        .range([height, 0])
		                        .domain([0.0, d3.max([selected_upper_bound, d3.max(this.bins, d=>d.length/this.normalising_const)])]);
		}
		else {
			this.yscale = d3.scaleLog()
				        .range([height, 0])
		                        .domain([0.0001, d3.max([selected_upper_bound, d3.max(this.bins, d=>d.length/this.normalising_const)])]);
		}

		this.xscale.range([this.margin.left, width - this.margin.right])
		           .domain([selected_range[0], selected_range[1]]);

		this.draw_svg(height, width, 0);

		this.line.x(d=>this.xscale(d))

		if (this.distribution == "normal") {
			this.line.y(d=>this.yscale(normal_pdf(d)));
		}
		else if (this.distribution == "uniform") {
			this.line.y(d=>this.yscale(1));
		}
		else {
			this.line.y(d=>this.yscale(Math.exp(-d)));
		}

		if (this.linear_scale) {
			this.step_line.x(d=>this.xscale((d.x0+d.x1)/2))
				      .y(d=>this.yscale(d.length/this.normalising_const))
				      .curve(d3.curveStep);
		}
		else {
			this.step_line.x(d=>this.xscale(d.x))
				      .y(d=>this.yscale(d.y/this.normalising_const+0.0000001));
		}

		this.plot
		    .selectAll("#line-hist")
		    .datum(step_line(this.bins))
		    .raise()
		    .attr("d", this.step_line)
		    .attr("clip-path", "url(#clip)")
		    .attr("id", "line-hist");

		this.plot
		    .selectAll("#line-pdf")
		    .datum(d3.ticks(selected_range[0], selected_range[1], 100))
		    .raise()
		    .attr("d", this.line)
		    .attr("clip-path", "url(#clip)")
		    .attr("id", "line-pdf");

		this.plot
		    .selectAll("#x-axis")
		    .call(d3.axisBottom(this.xscale))
		    .attr("transform", "translate(0," + height + ")");

		this.plot
		    .selectAll("#y-axis")
		    .call(d3.axisLeft(this.yscale))
		    .attr("transform", "translate(" + this.margin.left + ",0)");
		
		this.plot
		    .selectAll("#xlabel")
		    .attr("transform", "translate(" + (width/2.0+this.margin.left/2.6) + "," + (height+this.margin.bottom/1.5) + ")");

		this.plot
		    .selectAll("#ylabel")
		    .attr("y", 0 - this.margin.left/2.0)
		    .attr("x", 0 - (height/1.6));

		this.plot
		    .selectAll("#legend")
		    .raise()
		    .attr("transform", "translate(" + width/1.1 + "," + " 50)")

	}

	draw_svg (height, width, duration_) {
		this.plot
		    .selectAll(".bar")
		    .data(this.bins)
		    .join("rect")
		    .attr("class", "bar")
		    .attr("x", d=>this.xscale(bin_center(d)))
		    .attr("width", d=>this.xscale(d.x1)-this.xscale(d.x0)+1)
		    .attr("y", d=>this.yscale(0.0000001))
		    .attr("height", 0)
		    .transition()
		    .duration(duration_)
		    .attr("height", d=>{
			    	if (d.length == 0) {
					return 0;
				}
				else {
					return height-this.yscale(d.length/this.normalising_const);
				}
		    })
		    .attr("y", d=>{
			    	if (d.length == 0) {
					return height;
				}
				else {
					return this.yscale(d.length/this.normalising_const);
				}
				});
	}

	set_svg(width, height) {
		this.svg
		    .attr("width",  width)
		    .attr("height", height);
	}

	get_dimension() {
		let height = parseFloat(this.svg.style("height"));
		let width  = parseFloat(this.svg.style("width"));

		return [width, height];
	}

	get_bins(data, nbr_bins) {
		let bins = d3.bin().value(d=>d).thresholds(nbr_bins)(data);
		return bins;
	}
}

function box_muller(U1, U2) {
	let Z1 = Math.sqrt(-2*Math.log(U1)) * Math.cos(pi2*U2);
	let Z2 = Math.sqrt(-2*Math.log(U1)) * Math.sin(pi2*U2);

	return [Z1, Z2];
}

function bin_center(data) {
	return data.x0;
}

function constant(data) {
	var res = 0.0;
	for (var i=0; i<data.length; i++) {
		res += (data[i].x1-data[i].x0)*data[i].length;
	}

	return res;
}

function normal_pdf(x) {
	return (1.0/Math.sqrt(2*Math.PI))*Math.exp(-0.5*Math.pow(x,2));
}

document.getElementById('update').addEventListener("click", function() {
	plot.data = generate_data(d3.select("#distribution").property("value"));
	plot.redraw();
});

document.addEventListener("keydown", function(event) {
	if (event.code == "KeyL") {
		plot.linear_yscale = !plot.linear_yscale;
		plot.redraw();
	}
});

window.addEventListener('resize', function(event){
	plot.redraw();
});

window.addEventListener('load', function(event){
	plot = new Plot();
});

let slider = d3.select("#slider");
slider.property("value", 40);
d3.select("#slider-value").text(parseInt(slider.property("value")));
slider.on("input", function () {
       d3.select("#slider-value").text(parseInt(this.value));
       d3.select("#slider").property("value", +this.value);
       plot.nbr_bins = +this.value;
       plot.redraw();
});

d3.select("#distribution").on("change", function () {
	plot.data = generate_data(this.value);
	plot.redraw();
});
