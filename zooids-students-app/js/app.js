


function App(params){
  var app = this;
  this.connector = zooids_connector;

  this.page = null;
  this.data = null;

  var interval = null;

  this.setDimensions = function(_columns){
    //app.dimensions = _columns.map(function(d){return {name: d}});
    app.dimensions = _columns;
  }
  
  this.prepareDimensionPages = function(){
	PARAMS_PAGE_DIMENSIONS_MERIT.data = app.dimensions.filter(function(d){return d.isMerit});
	PARAMS_PAGE_DIMENSIONS_MERIT.getColor = getStudentDimensionColor;
	PARAMS_PAGE_DIMENSIONS_NON_MERIT.data = app.dimensions.filter(function(d){return !d.isMerit});
	PARAMS_PAGE_DIMENSIONS_NON_MERIT.getColor = getStudentDimensionColor;
  }
  
  this.selectedObject = undefined;
  
  	this.objectSelected = function(object_id){
	app.selectedObject = app.data.filter(function(d){return  app.datasetIDAccessor(d) === object_id})[0];
  }
  
  this.objectUnSelected = function(object_id){
	app.selectedObject = undefined;
  }
  
  this.prepareDoDPage = function(){
	d3.select("body").append("div").attr("id","dod-page")
		.style("width", (PARAMS_PAGE_DIMENSIONS.containerWidth - 15)+"px")
		.style("height", (PARAMS_PAGE_DIMENSIONS.containerHeight + MARGIN_DIMENSIONS.top- 15)+"px")
		.style("left", 15+"px")
		.style("bottom", -(PARAMS_PAGE_DIMENSIONS.containerHeight + MARGIN_DIMENSIONS.top- 15)+"px");
	
	if(DEBUG_DOD){
		this.showDoDPage();
	}
  }
  
  
  
  this.showDoDPage = function(){
	    
	  if(DEBUG_DOD){
		  app.selectedObject = {
				age:22,
				city:"Shenyang",
				city_coordinates: [41.790000915527344, 123.43000030517578],
				gender:"M",
				grades: ["language.grade", 2, "english.grade", 3.5, "portfolio.rating", 5, "math.grade", 3.9000000953674316, "coverletter.rating", 4, "sciences.grade", 3.5999999046325684, "refletter.rating", 3],
				id:6,
				name:"Joey Abreu",
				nationality: "China"
		  }
	  }
	  
	  if(app.selectedObject == undefined) return;
	  
	  d3.select("#dod-page").selectAll("*").remove();
	  
	  //only works for the students dataset
	  
	  var container = d3.select("#dod-page").append("div").attr("class", "container");
	  
	  var header = container.append("div").attr("class","header");
	  
	  //name + age
	  header.append("h2").html(app.selectedObject.name + " (" + app.selectedObject.age+ ")");
	  
	  //Gender
	  header.append("h3").html(function(){
		switch(app.selectedObject.gender){
			case "M": return "Male";
			case "F": return "Female";
			default: return app.selectedObject.gender;
		}
	  });
	  
	  //City + nationality
	  header.append("h3").html(app.selectedObject.city + ", " + app.selectedObject.nationality);
	  
	  //flag
	  header.append("img").attr("class","flag").attr("src", getFlag(app.selectedObject.nationality));
	  
	  
	  var gpas_data = [
		{name: "English", dim_id: "english.grade"},
		{name: "Math", dim_id: "math.grade"},
		{name: "Sciences", dim_id: "sciences.grade"},
	  ].filter(function(d){
		  d.val = getValue(d.dim_id);
		  return true;
	  });
	  
	  var scores_data = [
		{name: "Cover Letter", dim_id: "coverletter.rating"},
		{name: "Portfolio", dim_id: "portfolio.rating"},
		{name: "Reference Letters", dim_id: "refletter.rating"},
	  ].filter(function(d){
		  d.val = getValue(d.dim_id);
		  return true;
	  });
	  
	  //gpas
	  var gpaScale = d3.scaleLinear().domain([0,4]).range([0,DOD_GRADE_GRAPH_WIDTH]);
	  var gpas = container.append("div").attr("class","dimension-column");
	  gpas.append("h3").html("GPA Grades");
	  var gpa_g = gpas.selectAll(".gpa").data(gpas_data).enter().append("div").attr("class","gpa");
	  gpa_g.append("h4").html(function(d){return d.name});
	  var graph = gpa_g.append("div").attr("class","graph-container gpa")
		.style("width", DOD_GRADE_GRAPH_WIDTH+"px")
		.style("border-color", DOD_COLOR_BORDER_GRADE_BAR);
	  var filled = graph.append("div").attr("class", "graph-grade-filled")
		.style("background-color", DOD_COLOR_BACKGROUND_GRADE_BAR)
		.style("width", function(d){return gpaScale(d.val)+"px"});
	  filled.append("label").html(function(d){return (Math.round(d.val*100)/100) + " / 4.0"}).style("color", DOD_COLOR_LABEL_GRADE_BAR);
	  
	  
	  //scores
	  var scores = container.append("div").attr("class","dimension-column");
	  scores.append("h3").html("Other Ratings");
	  var scores_g = scores.selectAll(".score").data(scores_data).enter().append("div").attr("class","score");
	  scores_g.append("h4").html(function(d){return d.name});
	  var graphScores = scores_g.append("div").attr("class","graph-container score");
	  graphScores.each(function(dimension){
		  var score_values = [0,1,2,3,4,5];
		  var scoreGlyph = d3.select(this).selectAll(".scoreGlyph").data(score_values).enter().append("div").attr("class", "scoreGlyph").style("background-color", function(d){
			  if(d <= dimension.val) return DOD_COLOR_BACKGROUND_SCORE_MARKS;
			  return "none";
		  }).style("border-color", DOD_COLOR_BORDER_SCORE_MARKS);
	  
	  });
	  
	  
	  console.log("objectSelected",app.selectedObject)
	  
	  d3.select("#dod-page").transition().duration(750).style("bottom", "0px");
	  
	  function getValue(dim_id){
		 return app.selectedObject.grades[app.selectedObject.grades.indexOf(dim_id) + 1];
	  }
	  
	  function getFlag(nationality){//here some flag name exceptions
		  var name = undefined;
		switch(nationality){
			case "United States of America":
			name = "USA";
			break;
			default:
			name = nationality;
		}  
		return "./img/flag/"+name+".png";
	  }
	  
  }
  
  this.hideDoDPage = function(){
	  //if(app.selectedObject != undefined) return;
	  
	  d3.select("#dod-page").transition().duration(750).style("bottom", -(PARAMS_PAGE_DIMENSIONS.containerHeight + MARGIN_DIMENSIONS.top- 15)+"px");
  }

  this.loadDataset = function(dataset){

    if(dataset.dataset == "students"){
      app.data = dataset.students;
	  app.datasetIDAccessor = function(d){return d.id};
      app.setDimensions(datasets.filter(function(d){return d.name === "Students"})[0].dimensions.sort(function(a,b){
        if(a.isMerit && !b.isMerit) return -1;
        if(!a.isMerit && b.isMerit) return 1;
        return d3.ascending(a.name,b.name);
      }));
    }
    else throw "Unknown dataset: " + dataset.dataset;
	
	app.prepareDimensionPages();
	app.prepareDoDPage();
	
    app.setPage(PAGE_DIMENSIONS_MERIT);
  }
  


  this.setPage = function(pageName){
    var pageParams;
    switch(pageName){
      case PAGE_HOME:
        app.page = createPage(PARAMS_PAGE_HOME);
        app.page.hasSelected = function(d){
          //console.log("selected box",d);

          zooids_connector.sendMessageToServer({
            message_id: 16,
            dataset: d.src
          });


        }
      break;
      case PAGE_DIMENSIONS_MERIT:
	  case PAGE_DIMENSIONS_NON_MERIT:
        if(app.data == null) throw("need to load dataset before going to dimensions page");
		
		var params = undefined;
		if(pageName === PAGE_DIMENSIONS_MERIT) params = PARAMS_PAGE_DIMENSIONS_MERIT;
		else if(pageName === PAGE_DIMENSIONS_NON_MERIT) params = PARAMS_PAGE_DIMENSIONS_NON_MERIT;
		else console.error("invalid pageName: "+pageName);

        //exit home page, then go to dimensions page
        app.page.fadeOut(function(){
          app.page = createPage(params);
          app.page.hasSelected = function(d){
            zooids_connector.sendMessageToServer({
              message_id: 17,
              dimension: d.alias,
              action: "show"
            });
          }
		  app.page.hasReleased = function(d){
            zooids_connector.sendMessageToServer({
              message_id: 17,
              dimension: d.alias,
              action: "hide"
            });
          }

          app.page.fadeIn();
        });

      break;
      default: console.error("invalid pageName: "+pageName);
    }
    console.log("page",app.page)
  }
  
  var current_touch = undefined;

  var touchStart = function(d, page){
	
	if(TOUCH_IS_UNIQUE && current_touch != undefined) return;
	
	current_touch = d;
	d.isTouched = true;
	d.paused = false;
    page.updateBoxes();

    //console.log("startTouch",d);
	
	if(d.interval != undefined) return;

    d.interval = setInterval(function(){
		if(d.touchAmount == undefined) d.touchAmount = 0;
      
	  d.touchAmount += (d.isTouched ? 1 : -1) * PROGRESSBAR_RATE/10;
      page.updateBoxes();
      //console.log("still touching",d)

      if(d.touchAmount >= 100){
        d.touchAmount = 100;
		
        //clearInterval(d.interval);
		//d.interval = undefined;
		if(!d.paused){
			d.paused = true;
			page.hasSelected(d);
		}
        
      }else if(d.touchAmount <= 0){
		d.touchAmount = 0;
        clearInterval(d.interval);
		d.interval = undefined;
		current_touch = undefined;
		page.hasReleased(d);
	  }
    }, 2);
  }

  var touchEnd = function(d, page){
    //console.log("endTouch",d)
	d.isTouched = false;
	d.paused = false;
  }


  /*
  The home page from where we can select a dataset
  */
  function createPage(p){
    var page = this;
    this.type = p.type;
    this.padding = p.padding || 0;
    this.gridSpace = p.gridSpace || 0;
    this.containerWidth = p.containerWidth || clientBox.width;
    this.containerHeight = p.containerHeight || clientBox.height;
    this.data = p.data || null;
    this.nbBoxPerRow = p.nbBoxPerRow || 2;
	this.getColor = p.getColor;
    this.title = p.title || "Page Title";
	this.detailOnDemand = p.detailOnDemand;
	this.nextPage = p.nextPage;
	this.fontSize = p.fontSize || 12;

    console.log("page.data", page.data)
	console.log("app.data", app.data)

    var nbRows = Math.ceil(page.data.length / page.nbBoxPerRow);
	
    var boxWidth = 100/page.nbBoxPerRow - BOX_MARGIN_PERCENT * (page.nbBoxPerRow);
    var boxHeight = (page.containerHeight - page.gridSpace * (nbRows - 1)) / nbRows;
	
    var boxesContainer = d3.select("#content").append("div")
		.attr("id", "boxesContainer")
		.attr("class", "noselect")
		.classed("pushleft", this.type != PAGE_HOME)
		.style("display", this.type == PAGE_HOME ? "block" : "inline-block")
		.style("width", page.containerWidth+"px")
		.style("height", page.containerHeight+"px");
	
	boxesContainer.append("h1").html(page.title);
	
	for(var i=0; i<page.data.length; i+=page.nbBoxPerRow){
		var boxes = boxesContainer.append("div").attr("class","row")
			.selectAll(".box")
			.data(page.data.filter(function(d,bi){return bi >= i && bi < i + page.nbBoxPerRow}))
			.enter().append("div").attr("class", "box noselect")
			.style("width", boxWidth+"%")
			.style("margin", (BOX_MARGIN_PERCENT)+"%")
			.style("height", boxHeight+"px")
			.style("background-color", function(d){
				return page.getColor(d);
			})
			.on("touchstart", function(d){touchStart(d,page)})
			.on("mousedown", function(d){touchStart(d,page)})
			.on("touchend", function(d){touchEnd(d,page)})
			.on("mouseup", function(d){touchEnd(d,page)});
		
		if(page.type != PAGE_HOME){
			boxes.append("div")
			.attr("class", "ribbon noselect")
			.style("background-color", function(d){return d.color})
			.style("width", 100+"%")
			.style("height", 20 + "%");
		}
		
		boxes.append("div")
			.attr("class", "progressBar noselect")
			.style("background-color", function(d){return d.color})
			.style("width", 100+"%")
			.style("height", 0 + "px");

		boxes.append("p").attr("class","noselect")
			.style("padding-bottom", this.type == PAGE_HOME ? "0em" : "2em")
			.style("font-size", page.fontSize+"px")
			.html(function(d){
				return d.name.replace(":",":<br/>");
			});
	}
	
    page.hasSelected = function(d){
      //to override
    }
	
	page.hasReleased = function(d){
      //to override
    }

    page.updateBoxes = function(){
      boxes.classed('highlight', function(d){
		  return d.interval != undefined
		 });
      boxesContainer.selectAll(".progressBar").style("height", function(d){
          if(!d.interval) return "0%";
          return d.touchAmount+"%";
        });
    }

    page.fadeIn = function(callback){
      d3.select("#content").transition().duration(500).style("opacity",1).on("end", callback);
    }

    page.fadeOut = function(callback){
      d3.select("#content").transition().duration(500).style("opacity",0).on("end", function(){
        d3.select("#content").selectAll("*").remove();
        callback.call();
      });
    }
	
	
	//create swap button
	if(page.type != PAGE_HOME){
		d3.select("#content").append("button").attr("id","swap").on("click", function(){
			app.setPage(page.nextPage);
		});	
	}
	
	if(page.detailOnDemand){
		var dodPanel = d3.select("#content").append("div")
			.attr("id","dod-panel")
			.attr("class", "noselect")
			.style("top", MARGIN_DIMENSIONS.top+"px")
			.style("width", page.detailOnDemand.width+"px")
			.style("height", page.containerHeight+"px")
			.on("touchstart", app.showDoDPage)
			.on("mousedown", app.showDoDPage)
			.on("touchend", app.hideDoDPage)
			.on("mouseup", app.hideDoDPage);
		dodPanel.append("p").html(DOD_PANEL_TEXT);
	}
	
	

    return this;
  }




  app.setPage(PAGE_HOME);


}
