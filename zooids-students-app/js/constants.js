var PAGE_HOME = 0;
var PAGE_DIMENSIONS_MERIT = 1;
var PAGE_DIMENSIONS_NON_MERIT = 2;

const PROGRESSBAR_RATE = 5;

var DEBUG_DOD = false; //to show detail on demand when we load a dataset

const TOUCH_IS_UNIQUE = true;

const PROGRESSBAR_COLOR = "#FF8F2D"
function getHomeDatasetColor(d){return "#777"};
function getStudentDimensionColor(d){return d.isMerit ? "#777" : "#777"};

const DOD_PANEL_WIDTH = 170;
const DOD_PANEL_TEXT = "GET DETAILS ON DEMAND";
const DOD_GRADE_GRAPH_WIDTH = 250;
const DOD_COLOR_BACKGROUND_GRADE_BAR = "#DDDDDD";
const DOD_COLOR_BORDER_GRADE_BAR = "#BBBBBB";
const DOD_COLOR_LABEL_GRADE_BAR = "#222222";

const DOD_COLOR_BACKGROUND_SCORE_MARKS = "#DDDDDD";
const DOD_COLOR_BORDER_SCORE_MARKS = "#BBBBBB";

const datasets = [
  {name: "Students", color: PROGRESSBAR_COLOR, src: "student-dataset", 
  dimensions: [
    /*
	{name: "Name", alias: "name", color: "#333", isMerit: 0, getValue: function(obj){return obj.name}},
	*/
          {name: "Age", alias: "age", color: "#a65628", isMerit: 0, getValue: function(obj){return obj.age}},
          {name: "Gender", alias: "gender", color: "#1f78b4", isMerit: 0, getValue: function(obj){return obj.gender}},
          {name: "Nationality", alias: "nationality", color: "#b2df8a", isMerit: 0, getValue: function(obj){return obj.nationality}},
          {name: "City", alias: "city", color: "#33a02c", isMerit: 0, getValue: function(obj){return obj.city}},
          {name: "City Longitude", alias: "longitude", color: "#fb9a99", isMerit: 0, getValue: function(obj){return obj.city_coordinates[1]}},
          {name: "City Latitude", alias: "latitude", color: "#e31a1c", isMerit: 0, getValue: function(obj){return obj.city_coordinates[0]}},
        /*
         {name: "Student ID", alias: "id", color: "#333", isMerit: 0, getValue: function(obj){return obj.id}},
         */
        /*
         {name: "Grade: Language", alias: "language.grade", color: "#ff7f00", isMerit: 1, getValue: function(obj){return obj.age}},
         */
          {name: "Grade: English", alias: "english.grade", color: "#e41a1c", isMerit: 1, getValue: function(obj){return obj.age}},
          {name: "Grade: Science", alias: "sciences.grade", color: "#377eb8", isMerit: 1, getValue: function(obj){return obj.age}},
          {name: "Grade: Math", alias: "math.grade", color: "#4daf4a", isMerit: 1, getValue: function(obj){return obj.age}},
          {name: "Rating: Portfolio", alias: "portfolio.rating", color: "#984ea3", isMerit: 1, getValue: function(obj){return obj.age}},
          {name: "Rating: Cover Letter", alias: "coverletter.rating", color: "#ff7f00", isMerit: 1, getValue: function(obj){return obj.age}},
          {name: "Rating: Reference Letters", alias: "refletter.rating", color: "#ffff33", isMerit: 1, getValue: function(obj){return obj.age}}
  ]},
  {name: "Holidays", color: PROGRESSBAR_COLOR, src: "dummy-dataset"},
  {name: "Papers VIS 2o18", color: PROGRESSBAR_COLOR, src: "dummy-dataset"},
  {name: "Cameras", color: PROGRESSBAR_COLOR, src: "dummy-dataset"}];

const MARGIN_HOME = {top: 100, bottom: 50, left: 30, right: 30};
const MARGIN_DIMENSIONS = {top: 100, bottom: 50, left: 30, right: DOD_PANEL_WIDTH};
const clientBox = {width: $(window).width(), height: $(window).height()};

const BOX_MARGIN_PERCENT = 2;

var PARAMS_PAGE_HOME = {
  type: PAGE_HOME,
  padding: 0,
  gridSpace: 20,
  containerWidth: 2 * clientBox.width / 3,
  containerHeight: clientBox.height - MARGIN_HOME.top - MARGIN_HOME.bottom,
  data: datasets,
  nbBoxPerRow: 2,
  fontSize: 36,
  title: "Select a dataset",
  getColor: getHomeDatasetColor
}

var PARAMS_PAGE_DIMENSIONS = {
  padding: 0,
  gridSpace: 25,
  containerWidth: clientBox.width - MARGIN_DIMENSIONS.left - MARGIN_DIMENSIONS.right,
  containerHeight: clientBox.height - MARGIN_DIMENSIONS.top - MARGIN_DIMENSIONS.bottom,
  nbBoxPerRow: 3,
  fontSize: 24,
  title: "Dimensions",
  detailOnDemand: {
	  width: MARGIN_DIMENSIONS.right
  }
}

var PARAMS_PAGE_DIMENSIONS_MERIT = Utils.cloneObj(PARAMS_PAGE_DIMENSIONS);
PARAMS_PAGE_DIMENSIONS_MERIT.type = PAGE_DIMENSIONS_MERIT;
PARAMS_PAGE_DIMENSIONS_MERIT.nextPage = PAGE_DIMENSIONS_NON_MERIT;
PARAMS_PAGE_DIMENSIONS_MERIT.title = "Criteria (Merit)";


var PARAMS_PAGE_DIMENSIONS_NON_MERIT = Utils.cloneObj(PARAMS_PAGE_DIMENSIONS);
PARAMS_PAGE_DIMENSIONS_NON_MERIT.type = PAGE_DIMENSIONS_NON_MERIT;
PARAMS_PAGE_DIMENSIONS_NON_MERIT.nextPage = PAGE_DIMENSIONS_MERIT;
PARAMS_PAGE_DIMENSIONS_NON_MERIT.title = "Criteria (Non-Merit)"



