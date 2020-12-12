
const width = 800;
const height = 400;
const margin = 35;
const padding = 5;
const adj = 30;


//------------------DONNEES------------------//
const dataset = d3.csv("data.csv");
var selectedOption = "All";
dataset.then(function(data) {
    var col = data.columns.slice(1);
    col.push(selectedOption);
    col.sort(d3.ascending)
    d3.select("#selectButton")
    .selectAll('myOptions')
    .data(col)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })
    d3.select("#selectButton").on("change", function(d) {
        selectedOption = d3.select(this).property("value")
        d3.select("#innersvg").remove();
        update(selectedOption)
    })
    update(selectedOption);
    function update(option){
        var slices;
        if(option=="All"){
            slices = data.columns.slice(1).map(function(id) {
                return {
                    id: id,
                    values: data.map(function(d){
                        return {
                            Annee: d.Annee,
                            measurement: +d[id]
                        };
                    })
                };
            });
        }
        if(option!="All"){
            var newslices = [];
            var obj = {};
            obj.id = option;
            obj.values = data.map(function(d){
                return {
                    Annee: d.Annee,
                    measurement: +d[option]
                };
            })
            newslices.push(obj);
            slices = newslices;
        }

        //------------------SVG------------------//
        const svg = d3.select("div#container").append("svg").attr("id","innersvg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-"
        + adj + " -"
        + adj + " "
        + (width + adj *2) + " "
        + (height + adj*3))
        .style("padding", padding)
        .style("margin", margin)
        .style("overflow", "visible");

        //------------------ECHELLES------------------//
        const xScale = d3.scaleLinear().rangeRound([0,width+margin]);
        const yScale = d3.scaleLinear().rangeRound([height, 0]);
        var color = d3.scaleOrdinal().range(['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']);
        xScale.domain(d3.extent(data, function(d){
            return d.Annee;}));
            yScale.domain([(0), d3.max(slices, function(c) {
                return d3.max(c.values, function(d) {
                    return d.measurement; });
                })
            ]);
            color.domain(data.columns.slice(1));
            
            //------------------AXES------------------//
            const yaxis = d3.axisLeft()
            .ticks(10)
            .scale(yScale);
            
            const xaxis = d3.axisBottom()
            .ticks(15)
            .tickFormat(d3.format("d"))
            .scale(xScale);
            
            //------------------LIGNES------------------//
            const line = d3.line()
            .x(function(d) { return xScale(d.Annee); })
            .y(function(d) { return yScale(d.measurement); });
            

            //------------------VISUALISATION------------------//
            
            //------------------AXES------------------//
            svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xaxis)
            .append("text")
            .attr("x", width+35)
            .attr("y", 35)
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .style("font-size", 15)
            .text("Annees");
            
            svg.append("g")
            .attr("class", "axis")
            .call(yaxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy", ".75em")
            .attr("y", 6)
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .style("font-size", 15)
            .text("Nombre d'hotes");
            

            //------------------LIGNES------------------// 
            const lines = svg.selectAll("lines")
            .data(slices)
            .enter()
            .append("g");
            
            lines.append("path")
            .attr("class", function(d) { return d.id; })
            .style("fill", "none")
            .style("stroke", function(d) { return color(d.id); })
            .style("stroke-width", 2)
            .attr("d", function(d) { return line(d.values); });
            
            
            //------------------LEGENDES------------------//
            svg.selectAll("mydots")
            .data(slices)
            .enter()
            .append("rect")
            .attr("x", width+100)
            .attr("y", function(d,i){ return 40 + i*25}) 
            .attr("height", 11)
            .attr("width", 15)
            .style("fill", function(d){ return color(d.id)})
            
            svg.selectAll("mylabels")
            .data(slices)
            .enter()
            .append("text")
            .attr("x", width+120)
            .attr("y", function(d,i){ return 50 + i*25})
            .text(function(d){ return d.id;})
            .attr("text-anchor", "left")
            .style("font-size", 13)
            
        }
    });
    
    