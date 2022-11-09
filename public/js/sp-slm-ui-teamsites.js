//-------------------------------------------------
// Teamsite UI Functions
// Author: Roxanne Pearce
// Date: 2015-07-29
//-------------------------------------------------


//========================================================================
// Top Navigation in Tablet and Desktop View
// Author: Roxanne Pearce, 2015-05-14
//========================================================================  
var mymenu = window.matchMedia("screen and (min-width: 781px)")
if (mymenu.matches) {
    $(function () {
        $('li.mmenu  > a').click(function () {
            $(this).next('.megamenu').toggle(40).dimBackground();
        });

        $('.dropMenuClose').click(function () {
            $('.megamenu').hide(50).undim();
        });

        $(document).click(function (e) {
            var target = e.target;
            if (!$(target).is('.wsmenu-list > li > a') && !$(target).parents().is('.wsmenu-list')) {
                $('.megamenu').hide(50).undim();
            }
        }); 
    });
} else {
    // do something else
};

//========================================================================
// Sanlam Back To Top
// Author: Roxanne Pearce, 2015-05-14
//========================================================================
function slmBackToTop() {
    var offset = 120;
    var duration = 500;
    $('#s4-workspace').scroll(function() {
        if ($(this).scrollTop() > offset) {
            $('.back-to-top').fadeIn(duration);
        } else {
            $('.back-to-top').fadeOut(duration);
        }
    });
    
    $('.back-to-top').click(function(event) {
        event.preventDefault();
        $('#s4-workspace').animate({ scrollTop: 0 }, duration);

        return false;
    });
}

//========================================================================
// Sanlam Mobile View
// Author: Roxanne Pearce, 2015-05-14
//========================================================================
function slmMobileView() {
    if (window.matchMedia("(max-width:768px)").matches) {
         
        // Hide components on mobile
        $('.tour_wrapper').hide();
        $('.classifiedwrapper').hide();
        $('#slmCommunityGroups').hide();
    
        // Move components in mobile view
        //$("#SearchBox").prependTo("#slm-topnav .wsmenu-list");
        $('#slmSanlamSharePrice').insertAfter('#slmPhonebook');
        $('.canteen').insertAfter('#slmNotificationBoard'); 
        $('.newsWrapper').insertAfter('#slmSanlamSharePrice');  
    }
}

//========================================================================
// Sanlam Rearange SharePoint Components
// Author: Roxanne Pearce, 2015-05-14
//========================================================================
function slmRearangeSPComponents() {
    $('#suiteBar').hide();
    $('#fullscreenmodebox').hide();
    $('#welcomeMenuBox').prependTo('.profilename')
    $('#siteactiontd').insertAfter('.profilepic');

    // make the top navigation fixed to the page
    $('#header').insertAfter('#ms-designer-ribbon');
}

//========================================================================
// Sanlam Set the environment logo
// Author: Mark Goosen, 2015-08-26
//========================================================================
function slmSetEnviromentalLogo() {
    var url = window.location.href;
    if(url.indexOf('-dev.sanlam.co.zaa')>-1) {
        $('.sml-logo > a').addClass("slm-vm");
        $('.sml-logo > a > img').attr("src", "/_catalogs/masterpage/slmgroup/img/sanlam-vm.png");
    } else if(url.indexOf('-dev.sanlam.co.za')>-1) {
        $('.sml-logo > a').addClass("slm-dev");
        $('.sml-logo > a > img').attr("src", "/_catalogs/masterpage/slmgroup/img/sanlam-dev.png");
    } else if(url.indexOf('-qa.sanlam.co.za')>-1) {
        $('.sml-logo > a').addClass("slm-qa");
        $('.sml-logo > a > img').attr("src", "/_catalogs/masterpage/slmgroup/img/sanlam-qa.png");
    }
}

//========================================================================
// Initialize components
// Author: Mark Goosen, 2015-08-07
//========================================================================  
$(document).ready(function() {
    
    //Initiate components
    slmBackToTop();
    slmMobileView();   
    slmRearangeSPComponents();
    slmSetEnviromentalLogo();
        
});

    
    
