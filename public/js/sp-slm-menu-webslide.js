// Description: Smart menu js 
// Date: 22.03.2015
// Author: Roxanne Pearce


var mymenu = window.matchMedia("screen and (min-width: 781px)")
if (mymenu.matches){
$(function() {
$('li.mmenu  > a').click(function(){  
  $(this).next('.megamenu').toggle(40).dimBackground();
  $('.wsmenu-list li').removeClass("current").undim();

});

$('.dropMenuClose').click(function(){
	$('.megamenu').hide(50).undim();
  $('.wsmenu-list li').removeClass("current").undim();
	  
});

$(document).click(function(e) {
  var target = e.target;
  if (!$(target).is('.wsmenu-list > li > a') && !$(target).parents().is('.wsmenu-list')) {	
  $('.megamenu').hide(50).undim();
  $('.wsmenu-list li').removeClass("current").undim();
  
  }
});
});
}
else{
 // do something else
};

