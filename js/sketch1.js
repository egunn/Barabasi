//set some margins and record width and height of window
var margin = {t:25,r:40,b:25,l:40};

var width1 = document.getElementById('plot').clientWidth - margin.r - margin.l,  
    height1 = document.getElementById('plot').clientHeight - margin.t - margin.b;

//select the HTML plot element by class
var canvas = d3.select(".plot");

plot = canvas.append('svg')
    .attr('width',width1+margin.r+margin.l)
    .attr('height',height1 + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

for (i=0;i<3;i++){
    plot.append('rect')
        .attr('x', 50)
        .attr('y', i*55)
        .attr('width', 100)
        .attr('height',50)
        .attr('fill','Gainsboro')
}

for (i=0;i<3;i++){
    plot.append('rect')
        .attr('x', 155)
        .attr('y', 30)
        .attr('width', 50)
        .attr('height',100)
        .attr('fill','Gainsboro')
}

selectedCirc = null; 
lastSelectedCirc = null;

nodes = [];

nodes = [{node:'A', x:100, y:25, color:'gray', fixed:true},
         {node:'B', x:100, y:80, color:'gray', fixed:true},
         {node:'C', x:100, y:135, color:'gray', fixed:true},
         {node:'D', x:180, y:80, color:'gray', fixed:true}
        ];

links = [];

links = [{source: 'A', dest:'B', color:'gray', used:false},
         {source:'B', dest:'A', color:'gray', used:false},
         {source:'B', dest:'C', color:'gray', used:false},
         {source:'C', dest:'B', color:'gray', used:false},
         {source:'A', dest:'D', color:'gray', used:false},
         {source:'D', dest:'A', color:'gray', used:false},
         {source:'B', dest:'D', color:'gray', used:false},
         {source:'D', dest:'B', color:'gray', used:false},
         {source:'C', dest:'D', color:'gray', used:false},
         {source:'D', dest:'C', color:'gray', used:false}
        ];

//set link positions based on source and destination nodes
for (var j=0; j < links.length; j++){
    
    for(var i = 0; i<nodes.length; i++){ 
        if(nodes[i].node == links[j].source){
            links[j].x1 = nodes[i].x;
        }; 
        if(nodes[i].node == links[j].source){
            links[j].y1 = nodes[i].y;
        }; 
        if(nodes[i].node == links[j].dest){
            links[j].x2 = nodes[i].x;
        }; 
        if(nodes[i].node == links[j].dest){
            links[j].y2 = nodes[i].y;
        };
        
    }
}


//draw links as curved paths
paths = plot.selectAll('paths')
    .data(links)
    .enter()
    .append('svg:path');

paths.attr("d", function(d) {
        var dx = d.x1 - d.x2,
            dy = d.y1 - d.y2,
            dr = Math.sqrt(dx * dx + dy * dy)*1.5;
        return "M" + 
            d.x2 + "," + 
            d.y2 + "A" + 
            dr + "," + dr + " 0 0,1 " + 
            d.x1 + "," + 
            d.y1;
    })
    .attr('stroke','gray')
    .attr('fill','none')
    .attr('class',function(d){
        return 'link-' + d.source + d.dest + ' link'  
    });


//draw nodes
circles = plot.selectAll('.node')
    .data(nodes)
    .enter();

circles
    .append('circle')
    .attr('class', function(d){ return 'node-' + d.node + ' node'})
    .attr('cx', function(d){ return d.x})
    .attr('cy', function(d){ return d.y})
    .attr('r', 7)
    .attr('fill', function(d){ return d.color})
    .on('mouseover',function(d){
        d3.select(this).attr('fill','orange');
    })
    .on('mouseout',function(d){
        d3.select(this).attr('fill',function(d){return d.color});
    })
    .on('click', function(d){
        //change the color, size, and used status of the clicked node
        d.color = 'orange' 
        d3.select(this).attr('r',9);
        d.used = "true"
        
        //if there is already a selected node, highlight the link that connects the two nodes as well
        //check to see if there is already a selected circle, and whether it is the same as the node that was clicked. If not,
        if (selectedCirc && selectedCirc != d.node){
            
            //select the link between the two nodes
            var connectLink = d3.select('.' + 'link-' + selectedCirc + d.node); 
            
            //go through the links array and see whether the link has already been used. 
            var checkLink = links.forEach(function(e){
                if (e.source == selectedCirc && e.dest == d.node){
                    //if it has been used, log an error
                    if(e.used === true){
                        console.log('used');
                    }
                    //if it hasn't been used,
                    else {
                        //check whether it is a valid connection. If not, log error
                        if (connectLink[0][0] == null){
                            console.log('connection does not exist');
                        }
                        //if it is a valid link, change its color and set its used parameter
                        else {
                            connectLink.attr('stroke','orange');
                            e.used = true;
                        }
                        
                        //save the previously selected circle, and the clicked node as the current selection
                        lastSelectedCirc = selectedCirc;
                        selectedCirc = d.node;                               
                        
                    }
                }
            });
            

        }
    
        //if the node was clicked twice, 
        else if (selectedCirc == d.node) {
            //log an error
            console.log('same node!')
            
            //reset the link color to gray
            var lastLink = d3.select('.' + 'link-' + lastSelectedCirc + selectedCirc);
            lastLink.attr('stroke','gray');
            
            //reset node values
            d.color = 'gray' 
            d3.select(this).attr('r',7).attr('fill','gray');
            d.used = false;
            
            //reset the selected node
            selectedCirc = lastSelectedCirc;
            lastSelectedCirc = null;
        }   
    
        //if there is no previously selected node (first node since refresh), set the current selection
        else {
            selectedCirc = d.node; 
        }
        
            
    });


plot.append('rect')
    .attr('x',275)
    .attr('y',0)
    .attr('width',75)
    .attr('height',25)
    .attr('rx',4)
    .attr('fill','gainsboro')
    .on('click',function(){
        nodes.forEach(function(e){
            e.color = 'gray'
        });    
        
        links.forEach(function(e){
            e.color = 'gray';
            e.used = false;
        })
        
        d3.selectAll('.node').attr('fill','gray').attr('r',7);
        d3.selectAll('.link').attr('stroke','gray');
        
        selectedCirc = null;
    });

plot.append('text')
    .attr('x',296)
    .attr('y',16)
    .attr('fill','gray')
    .text('reset');