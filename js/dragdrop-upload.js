"use strict"

 function drag()
 {
 	$('.photo-area img').draggable({
        stack: '.photo-area img',
        revert:false,
        disabled:false
        

    	});
 }



$(document).on('mousemove',function(){
               
        
		drag();
    	

	});

 		
 



 $('.nav-icon').on('click', function(){
 	var nav = $('nav');

 	nav.toggleClass('active');
 	

 	if(!$(nav).hasClass('active'))
 	{
 			$('nav').animate({
		 		
		 		left: '-302px'
		 	
		 	}, 200);
 	}
 	else
 	{
 		$('nav').animate({
		 		
		 		left: '0px'
		 	
		 	}, 200);
 	}
 	
 });






 	
              
          
   


        





