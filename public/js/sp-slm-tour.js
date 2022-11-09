//---------------------------------------------------------------------------
// Intranet Tour
// Author: Roxanne Pearce, 11 May 2015
//---------------------------------------------------------------------------

$( document ).ready(function() {


var hideBtns = function(){
    $(".nextbtn").hide();
};

// Instance the tour
var tour = new Tour({
	template: "<div class='popover tour'><div class='arrow'></div><h3 class='popover-title'></h3> <div class='popover-content'></div><div class='popverLinks'><div class='btn-group'><button class='btn btn-sm btn-default prevbtn' data-role='prev'></button><button class='btn btn-sm btn-default nextbtn' data-role='next'></button></div><div><button class='endbtn' data-role='end'>End tour</button><button class='endbtn startTour' data-toggle='modal' data-target='#introVideo' data-role='end'>Watch Video</button></div></div></div></div>",
	autoScroll: true,
	backdropContainer: 'body',
	backdrop:true,
	backdropPadding: 0,
  	container: '#s4-workspace',
  	
  	
  onEnd: function(tour) {	$("#s4-workspace").removeClass("scrollBody"); },   	 
  steps: [
  {
    element: ".itemSearch",
    title: "Search",
    content: "Looking for something? Type your request here to get started",
    placement: "bottom"
  },
  {
    element: ".itemTools",
    title: "Toolbox",
    content: "This is your number one stop for your favourite sites and applications!  Add your favourite Links and edit your own Toolbox, click on the link and you're on your way!",
    placement: "bottom"

  },
  {
    element: ".itemHelp",
    title: "Help",
    content: "Find Frequently Asked Questions and Tips on how to use the intranet.",
    placement: "bottom"

  },
  {
    element: "#myCarousel",
    title: "Campaign Carousel",
    content: "What's happening, what's new, what's exciting, and more. . . click on the banners to explore",
    placement: "bottom"

  },
  {
    element: ".sharepricewrapper",
    title: "Share Price",
    content: "Stay up-to-date on our share price.",
    placement: "right"

  },
 
  {
    element: "#slmNotificationBoard",
    title: "Notication Board",
    content: "For a quick view of all the important broadcasts, be sure to keep an eye on this board.",
    placement: "top"

    
  },
  {
    element: "#slmPhonebook",
    title: "Find a Colleague",
    content: "Connectivity is key to all Wealthsmiths, search for a colleague to stay connected.",
    placement: "top"

  },
   {
    element: "#slmCommunityGroups",
    title: "My Groups",
    content: "Want to know more about Sanlam communities and what they do? You can join and follow communities too! Click here to broaden your workplace horizons",
    placement: "top"
  },
   {
    element: ".newsWrapper",
    title: "Inside Sanlam and SPF",
    content: "Stay dedicated and engaged with the latest company news.",
    placement: "top"

  },
   {
    element: ".canteen",
    title: "Canteen",
    content: "Fuel your body, mind and well-being with Fedics range of tasty menu options.",
    placement: "top"
  },
{
    element: ".classifiedwrapper",
    title: "Small Ads",
    content: "Your one-stop ad space, whether you're looking to buy, sell or simply browse what's on offer.",
    placement: "top",
    onShown: hideBtns
  }



  
]

});

// Initialize the tour
tour.init();

// Start the tour
$( ".startTour" ).click(function() {

tour.restart(true);
$( "#s4-workspace" ).addClass( "scrollBody" );
});




});