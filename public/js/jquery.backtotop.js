//-------------------------------------------------
// Back to Top Function
// Author: Roxanne Pearce
// Date: 2015-05-14
//-------------------------------------------------
jQuery(document).ready(function() {
    var offset = 120;
    var duration = 500;
    jQuery('#s4-workspace').scroll(function() {
        if (jQuery(this).scrollTop() > offset) {
            jQuery('.back-to-top').fadeIn(duration);
        } else {
            jQuery('.back-to-top').fadeOut(duration);
        }
    });
    
    jQuery('.back-to-top').click(function(event) {
        event.preventDefault();
        jQuery('#s4-workspace').animate({ scrollTop: 0 }, duration);

        return false;
    });
    
	// for  search box in mobile
	if (window.matchMedia("(max-width:768px)").matches) {
		$("#SearchBox").prependTo("#slm-topnav .wsmenu-list");
		 
		$('.tour_wrapper').hide();
		$('.classifiedwrapper').hide();
		$('#slmCommunityGroups').hide();
	
		$('#slmSanlamSharePrice').insertAfter('#slmPhonebook');
		$('.canteen').insertAfter('#slmNotificationBoard');	
		$('.newsWrapper').insertAfter('#slmSanlamSharePrice');	
	}
	
	$('#suiteBar').hide();
	$('#fullscreenmodebox').hide();
	$('#welcomeMenuBox').prependTo('.profilename')
	$('#siteactiontd').insertAfter('.profilepic');

	// make the top navigation fixed to the page
	$('#header').insertAfter('#ms-designer-ribbon');



	
	//$('.ms-siteactions-imgspan').click(function() {
	//		$(this).undim();
	//		$(this).dimBackground();
	//});
		
});


