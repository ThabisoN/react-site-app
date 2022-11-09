$(function() {
	var items = $('.overlapblackbg, .slideLeft');
	var wsmenucontent = $('.wsmenucontent');
	
	var open = function() {
	$(items).removeClass('close').addClass('open');
						}
	var close = function() { 
	$(items).removeClass('open').addClass('close');
	}

	$('#navToggle').click(function(){
		if (wsmenucontent.hasClass('open')) {$(close)}
		else {$(open)}
	});
	wsmenucontent.click(function(){
		if (wsmenucontent.hasClass('open')) {$(close)}
	});
	
	$('#navToggle,.overlapblackbg').on('click', function(){
	$('.wsmenucontainer').toggleClass( "mrginleft" );
	});

	$('.wsmenu-list li').has('ul').prepend('<span class="wsmenu-click" data-bind="click: $parent.mobileMenu"><i class="wsmenu-arrow"></i></span>');
	
	$('.wsmenu-list li').has('.halfdiv').prepend('<span class="wsmenu-click" data-bind="click: $parent.mobileMenu"><i class="wsmenu-arrow"></i></span>');
		
	$('.wsmenu-mobile').click(function(){
		$('.wsmenu-list').slideToggle('slow');
	});
	$('.wsmenu-click').click(function(){
	$(this).siblings('.wsmenu-submenu').slideToggle('slow');
	$(this).children('.wsmenu-arrow').toggleClass('wsmenu-rotate');
	$(this).siblings('.wsmenu-submenu-sub').slideToggle('slow');
	$(this).siblings('.wsmenu-submenu-sub-sub').slideToggle('slow');
	$(this).siblings('.megamenu').slideToggle('slow');
		
	});

});