


$(document).ready(function()
{
	var dropArea = document.getElementById("wrapper");

	var selectedImage = undefined;
	var recycleContainerVisibility = false;
	var mouseX = undefined;
	var mouseY = undefined;
	var imgWidth;
	var imgHeight;
	var binning = false;
	var previewsVisible = false;
	var inPreviewMode = false;
	
	
	// CREATING IAMGE ELEMENT FROM BINARY DATA AND ADDING IT
	// INTO THE IMAGE CANVAS (WORK AREA)
	function AppendImageToCanvas(binImageSource)
	{
		// CREATING NEW IMAGE
		var image = new Image();
		image.className = "photo";
		
		// RESIZING IMAGE WHEN LOADED
		image.onload = function()
		{
			var originalWidth = this.width;
			var originalHeight = this.height;
			var aspect = originalWidth / originalHeight;
			image.style.width = 150;
			image.style.height = image.style.width * aspect;
			

		}

		// LOADING BINARY IMAGE DATA INTO IMAGE CONTAINER
		var jImage = $(image);

		jImage.attr('src', binImageSource);
		jImage.appendTo('.photo-area');
		


		// ACTUALY POSITIONING IMAGE RIGHT UNDER THE CURSOR :-)
		// IMAGE LANDS WITH AN HALF OFFSET DO THAT THE CENTER OF THE IMAGE IS  WHERE THE POINTER IS
		var f = navigator.userAgent.search("Firefox");
		if(f)
		{	
			$(jImage).css({position:"fixed", 'left':200 ,'top':100});
		}
		
			$(jImage).css({position:"fixed", 'left':mouseX - 75 ,'top':mouseY - 75});

		

		
		// SETS UP SELECTING FUNCTIONALITY ON IMAGE
		$(jImage).on("dblclick", SelectImage);
		/*$(jImage).on("dblclick", handleImgWrapAngle );*/
		$(jImage).on("dragstop", DropImageToBin);

		
		$(jImage).on("dragstop", function(){
			CheckPhotoIsInCanvas($(jImage), $('.photo-area'));
		});
		
	}



	// ENABLES DYNAMIC RESIZING OF THE IMAGE BY USER
	function EnableResizing(element)
	{
		var hImage = $(element);
		var aspect = $(element).width() / $(element).height();
		var imgPos = $('.imgwrap').position();
		var left = imgPos.left;
		var top = imgPos.top;
		element.css({
			'position':'absolute',
			'top': top,
			'left':left
		})
		
		$(element).resizable({
			alsoResize: $(element).children(),
			animate:false,
			aspectRatio: aspect,
			handles:'n, e, s, w, se , ne, sw,nw'
		});

		
		return;
	}

	function UpdateCanvasSize(canvas)
	{
		var canvasWidth = $(canvas).width();
		var canvasHeight = $(canvas).height();
		var canvasOffset = $(canvas).offset();
		return [canvasWidth, canvasHeight, canvasOffset];
	}

	function PositionTitle(title)
	{
			var canvasProps = UpdateCanvasSize($('.photo-area'));
			var offset = canvasProps[2];
			var width = canvasProps[0];
			var height = canvasProps[1];

			$(title).css({
				'position': 'absolute',
				'left': 0,
				'top':0,
				'width': width
			})
	}

	function positionCloseButton(button, previewContainer)
	{
		var containerOffset = $(previewContainer).offset();
		
		var containerWidth = $(previewContainer).width();
		var containerHeight = $(previewContainer).height();
		var buttonWidth = $(button).width() / 2;
		

		$(button).css({
			'position':'fixed',
			'left': containerOffset.left + containerWidth - buttonWidth,
			'top': containerOffset.top
		})
	
	}

	function centerCanvas(dimensions)
	{
		var containerWidth = $('#wrapper').width();
		var containerHeight = $('#wrapper').height();
		var canvasWidth = dimensions[0];
		var canvasHeight = dimensions[1];
		$('.photo-area').css({
			'top': (containerHeight - canvasHeight) / 2,
			'left':  (containerWidth-canvasWidth)/2
		})
	}

	function ResizeCanvas(elem)
	{
		// think about changing the event handler to reverse the need to use this if statement as it's risky eg mouse up
		var dimensions  = UpdateCanvasSize(elem)
		
		
		
		$(elem).resizable({
			
			animate:false,
			handles:'n, e, s, w, se , ne, sw,nw',
			maxHeight: 800,
      		maxWidth: 1550,
      		minHeight: 600,
      		minWidth: 600
		});
		centerCanvas(dimensions);
		
		
		

	
		return dimensions;

	}
	

	$('#wrapper').on('mouseup', function(){
			var canvasElem = ResizeCanvas($('.photo-area'));
			HidePhotoIfOutOfBoundsAfterResize();
			PositionTitle($('.title'));
			if($('.photo').length > 1)
			{
				
				CheckPhotoIsInCanvas($(jImage), $('.photo-area'));
			}

			

	})
	

	// DISABLE DYNAMIC RESIZING OF THE IMAGE BY USER
	function DisableResizng(element)
	{
		$(element).resizable("destroy");

		return ;
	}

	

	//get angle of selected image
	function GetRotationOfElement(obj)
	{
		// vender prefix depending on browser
		var matrix = obj.css("-webkit-transform") ||
		obj.css("-moz-transform") ||
	   	obj.css("-ms-transform")  ||
	    obj.css("-o-transform")   ||
	    obj.css("transform");

	    if(matrix !== 'none')
	    {
	    	var values = matrix.split('(')[1].split(')')[0].split(',');
        	var a = values[0];
        	var b = values[1];
        	var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
        	
    	}  
    	else 
    	{ 
    		
    		var angle = 0;

    	}
    	return angle;
	}

	function HidePhotoIfOutOfBoundsAfterResize()
	{
	
		var container = $('.photo-area');
		var containerWidth = container.width();
		var containerOffset = container.offset();
		var recycleBinOffset = $('.recycle-bin').offset();
		
		var photos = $('.photo:not(#bin,.recycle-bin)'); 
				
				
				
					$('.recycle-bin img').animate({
					'opacity':1
					})
		for(var i = 0; i < photos.length; i++)
		{
			
			var position = $(photos[i]).offset();
			var width = $(photos[i]).width();
			

			if((position.left + width  < containerOffset.left) || (position.left  > containerOffset.left + containerWidth) || (position.top + width / 4 < containerOffset.top) )
			{
					$(photos[i]).animate({
					'opacity':0
					}, 800)
			}
			else
			{
				$(photos[i]).animate({
					'opacity':1
				}, 800)


			}




			
		}

		
	}
	

	function CheckPhotoIsInCanvas(jImage, container)
	{
		
		 //first get the cetner of the image
  	//then get distance between center and both horizontal edges of canvas
  	//also get distance between center and both vertical edges canvas
	// and make sure that none of them is smaller than the image (diagonal / 2)
		// image dimensions and offset
		var elementPos = jImage.offset();
		var elemWidth = jImage.outerWidth();
		var elemHeight = jImage.outerHeight();
		//angle of rotation
		var elemRot = GetRotationOfElement(jImage);
		//gets distance from top left to bottom right (diagonal); 
		var diagonalLength = Math.sqrt( (elemWidth * elemWidth) + (elemHeight * elemHeight) );
		//if floating point round result
		diagonalLength = Math.round(diagonalLength);
		//centre cords for both X and Y
		var centerX = elementPos.left + elemWidth / 2;
		var centerY = elementPos.top + elemHeight / 2;
		// parent container dimentions and position(canvas)
		var containerBounds = container.offset();	
		var containerBoundsWidth = container.width();
		var containerBoundsHeight = container.height();
		var containerRight = containerBounds.left + containerBoundsWidth - elemWidth;
		var containerBottom = containerBounds.top + containerBoundsHeight - elemHeight;

		// distence from image centre and all vertices of container
		var containerLeftFromCenterX = centerX - containerBounds.left ;
		var containerRightFromCenterX =  containerBounds.left + containerBoundsWidth  - centerX ;
		var containerTopFromCenterY = centerY - containerBounds.top;
		var containerBottomFromCenterY = containerBounds.top + containerBoundsHeight - centerY;
		

		
			

		
		if(binning  == false)
		{	
			//checks left side container
			if(containerLeftFromCenterX < diagonalLength / 2)
			{
				$(jImage).css({
					'position': 'fixed',
					'left': containerBounds.left
				})

			}
			//checks right
			if(containerRightFromCenterX  < diagonalLength / 2)
			{
				
				
				$(jImage).css({
					'position': 'fixed',
					'left':containerRight
				})
			}
			//checks top of container
			if(containerTopFromCenterY < diagonalLength / 2)
			{
				
				$(jImage).css({
					'position': 'fixed',
					'top': containerBounds.top
				})
			}
			// checks bottom
			if(containerBottomFromCenterY < diagonalLength / 2 )
			{
				$(jImage).css({
					'position': 'fixed',
					'top': containerBottom
				})
			}



			
		}

	}

	// CLEARS CURRENT IMAGE SELECTION
    function ClearSelection()
	{
		if(selectedImage != undefined)
		{
			
			var wrap = $('.imgwrap');
			
			var imgWrapPos = $(selectedImage).offset();
			var posLeft = imgWrapPos.left;
			var posTop = imgWrapPos.top;
			var width = $(selectedImage).width() / 2;
			var height = $(selectedImage).height() / 2;
			
			DisableResizng($(".imgwrap"));
			var imageAngle = GetRotationOfElement($('.imgwrap'));
			$('.imgwrap').css('-webkit-transform', 'rotate(' + 0 + 'deg)');
			var wrapPos = wrap.offset();
			var imgPos = $(selectedImage).offset();
			



			var offsetDistLeft = imgPos.left - wrapPos.left;
			var offsetDistTop = imgPos.top - wrapPos.top;
			
			$(selectedImage).css({
				'position': 'fixed',
				'top':wrapPos.top + offsetDistTop,
				'left':wrapPos.left + offsetDistLeft,
				'padding': 5
			})
			$(selectedImage).unwrap();
			

			$('.handle').remove();
			$(wrap).remove();

			$(selectedImage).removeClass('edit');
			$(selectedImage).css('-webkit-transform-origin', '50% 50%');
			$(selectedImage).css('-webkit-transform', 'rotate(' + imageAngle + 'deg)');
			$(selectedImage).css('-ms-transform', 'rotate(' + imageAngle + 'deg)');
			$(selectedImage).css('transform', 'rotate(' + imageAngle + 'deg)');
			$(selectedImage).css('-moz-transform', 'rotate(' + imageAngle + 'deg)');
			

			selectedImage = undefined;
			

		}


			return;
	}


	// DRAGS ACTIVE SELECTION HIGHLIGHT
	function DragSelection(event,ui)
	{
		if(selectedImage != undefined)
		{
			imgWidth = $(selectedImage).width() /2 ;
			 imgHeight = $(selectedImage).height() /2;
			// if image being dragged is not selected image then exit function 
			if(this !== selectedImage)
			{
				return
			}
			$('.imgwrap').css({
				'position': 'fixed',
				'left': mouseX - imgWidth,
				'top': mouseY - imgHeight
				
			})
			
			$(selectedImage).css({
				'position': 'static',
				'left': 0 ,
				'top':  0
				
			})
		}

		return ;
	}
	

	// SELECTS IMAGE
	function SelectImage()
	{
		// CLEAR THE SELECTION FIRST IF SOMETHING IS ALREADY SELECTED
		if(selectedImage != undefined) // and cursor position is now equal to that of selected image
		{
			$(selectedImage).on("click",ClearSelection );
			ClearSelection();

		}
		
		// THIS IS THE HANDLE TO THE IMAGE THATS CALLING THIS HANDLER
		selectedImage = this;

		$(this).addClass("edit");
		$(selectedImage).on("drag", DragSelection);
		
		// deselects selected image when another image is dragged
		$('.photo').on("drag", function(){
			
			if(this !== selectedImage)
			{
				
				ClearSelection();
			}
		});
		// ADD SELECTION HIGHLIGHT
		var imgWrap = $("<div class='imgwrap' id=\"a\"></div>");
		var imgPos = $(selectedImage).offset();
		var posLeft = imgPos.left;
		var posTop = imgPos.top;
		$(selectedImage).wrap(imgWrap);

		// checks if edge of imgwrap is outside of canvas
		$('.imgwrap').on("dragstop", function(){
			CheckPhotoIsInCanvas($('.imgwrap'), $('.photo-area'));
			$(selectedImage).css({
				'position': 'relative',
				'top': 0,
				'left': 0
			})
		});

		$(".imgwrap").css(
		{
			"width" : selectedImage.width,
			"height" : selectedImage.height,
			"position" : "absolute",
			"left" : posLeft,
			"top" : posTop, 
			'padding':5,
			'zIndex': 80
		});

		$(selectedImage).css({
			'position': 'relative',
			'top':0,
			'left': 0,
			'padding':0,
			'margin':0,
			'zIndex':80
		})

		var wrapOffsetH = $(selectedImage).offset().left - posLeft;
		var wrapOffsetV = $(selectedImage).offset().top - posTop;

		$(".imgwrap").css(
		{
			"position" : "absolute",
			"left" : posLeft - wrapOffsetH,
			"top" : posTop - wrapOffsetV 
		});



		
		// ENABLE DYNAMIC IMAGE RESIZING BY USER
		EnableResizing($(".imgwrap"));
		return ;
	}
	
	// TRACKS MOUSE POINTER POSITION RELATIVELY TO SCREEN
	function MouseHandler(event)
	{
		mouseX = event.clientX;
		mouseY = event.clientY;
	
		return;
	}

	
	// HANDLES FILE DROPING 
	function DropImageFile(event)
	{
		event.stopPropagation();
		event.preventDefault();
		var file = event.dataTransfer.files[0];

		if(!file.type.match("image.*"))
		{
			return
		}
		
		var fReader = new FileReader();
		fReader.onload = function(event)
		{
			var binImage = event.target.result;
			AppendImageToCanvas(binImage);

		}

		fReader.readAsDataURL(file);
		
		return ;
	} 
	
	// SOME OTHER DRAG EVENTS
	function dragOver(event)
	{
		event.stopPropagation();
		event.preventDefault();
		return ;
	}


	function dragLeave(event)
	{
		event.stopPropagation();
		event.preventDefault();
		

		return ;
	}



	// BINS THE IMAGE IF IT HAS BEEN DROPPED ONTO THE BIN
	// APPENDS THE BINNED IMAGE TO THE RECYCLE CONTAINER FOF FUTURE REVIVAL BOMM !
	function DropImageToBin(event, ui)
	{
		var jImage = $(this);
		var bin = $('#bin');
		var imgPos = jImage.offset();
		var imgWidth = jImage.width() / 2;
		var imgHeight = jImage.height() /2;
		
		// WE CALCULATE MIN AND MAX BOUNDS AND CHECK IF CENTER OF IMAGE IS WITHIN THOSE BOUNDS, IF SO BIN IT!!!!!!! 
		var binHeight = bin.height();
		var binWidth = bin.width();
		var minBounds = bin.offset();
		var maxBounds = bin.offset();
		maxBounds.left += binWidth;
		maxBounds.top += binHeight;



		

		if( (imgPos.top + imgHeight > minBounds.top) && (imgPos.left + imgWidth > minBounds.left) )
		{
			if( (imgPos.top + imgHeight < maxBounds.top) && (imgPos.left + imgWidth < maxBounds.left) )
			{
				binning = true;
				if(this === selectedImage)
				{
					ClearSelection();
				}
				
				AppendToRecycleContainer(jImage);
			}
		}
		else
		{
			binning = false;
			
		}

		return ;
	}

	function AppendToRecycleContainer(jImage)
	{
		// APPEND IMAGE TO THE RECYCLE CONTAINER
			jImage.className = "retreievedPhoto";
			jImage.removeClass('photo');

			var width = $(jImage).width() / 2;
			var height = $(jImage).height() / 2;
			if(($(jImage).width() > 190))
			{
				
				jImage.css
				({	
					"position" : "relative",
					"top" 	: 0,
					"left" 	: 0,
					"width": width,
					"height": height,
					'-webkit-transform':'rotate(' + 0 + 'deg)'
				});

			}
		

			jImage.css
				({	
					"position" : "relative",
					"top" 	: 0,
					"left" 	: 0,
					'-webkit-transform':'rotate(' + 0 + 'deg)',
					'-moz-transform':'rotate(' + 0 + 'deg)',
					'transform':'rotate(' + 0 + 'deg)'
				});

			var recycleContainer = $('.recycle-bin');
			$('.recycle-bin').append(jImage);


			 CheckForItemsInTrash();
			jImage.unbind("dragstop");
			jImage.on("dragstop", ReviveImageFromBin);
	}


	// BRINGS IMAGE BACK FROM THE RECYCLE CONTAINER INTO CANVAS
	function ReviveImageFromBin(event, ui)
	{
		var jImage = $(this);


		jImage.unbind("dragstop");
		var recycleContainer = $(".recycle-bin");
		var maxBounds = recycleContainer.offset();
		// get offset of right corner of image
		var jImageWidth =  jImage.width();
		var imgPos  = jImage.offset();
		imgPos.left += jImageWidth;
		jImage.addClass('photo');
		
		// check if right corner of jImage exceeds the left of the container
		if(imgPos.left < maxBounds.left)
		{
			
			jImage.className = "photo";
			$('.photo-area').append(jImage);
			HandleRecycleContainerVisibility();

			jImage.css({

				"position": "fixed",
				"top":imgPos.top ,
				"left":imgPos.left - jImageWidth
			})

			jImage.on("dragstop", DropImageToBin);
			$(jImage).on("dragstop", function(){
			CheckPhotoIsInCanvas($(jImage), $('.photo-area'));
		});
			CheckForItemsInTrash();
		}
		else
		{
			AppendToRecycleContainer(jImage)
		}


		return ;
	}

	// DISPLAYS AND HIDES THE RECYCLE CONTAINER DEPENDING ON ITS STATE
	function HandleRecycleContainerVisibility()
	{
		var recycleContainer = $('.recycle-bin');
		if(recycleContainerVisibility)
		{
			recycleContainer.animate({
				
				'right': -430
			});
			recycleContainerVisibility = false;
		}
		else
		{
			recycleContainer.animate({
				'right':0
			})
			recycleContainerVisibility = true;
		}
		

		return ;
	}



	
	
	function SwitchThemes()
	{	
		var themestyles = $('<link rel="stylesheet" class="themestyles" href="" type="text/css" />');
		$('head').append(themestyles);
		var dynamicStyles =  document.getElementsByClassName('themestyles')[0].disabled = true;

			$('.themes a').on('click', function(){
					var target =$(this).attr('class');
					
					
					switch(target)
					{
						case 'themeOne':
						var dynamicStyles =  document.getElementsByClassName('themestyles')[0].disabled = false;
						$(themestyles).attr('href', '../css/' + target + '.css');

						break;
						
						case 'themeTwo':
						var dynamicStyles =  document.getElementsByClassName('themestyles')[0].disabled = false;
						$(themestyles).attr('href', '../css/' + target + '.css');
						break;

						case 'themeThree':
						var dynamicStyles =  document.getElementsByClassName('themestyles')[0].disabled = false;
						$(themestyles).attr('href', '../css/' + target + '.css');
						break;

						case 'themeFour':
						var dynamicStyles =  document.getElementsByClassName('themestyles')[0].disabled = false;
						$(themestyles).attr('href', '../css/' + target + '.css');
						break;

					}
					return;


			})
		}

		$('section a').on('mousedown', SwitchThemes);

		
		
		function CheckForItemsInTrash()
		{
			
			$('.recycle-bin').each(function() {
    			var numberOfImages = $('.recycle-bin').children().length;
    			if(numberOfImages > 1)
    			{
    				$('#bin').attr('src', '../img/full-bin.png');
    				
    			}
    			else
    			{
    				$('#bin').attr('src', '../img/bin.png');
    			}
    			
			});
			
		}

		function deletePreview(itemToDelete)
		{
			$(itemToDelete).fadeOut(200);
			$(itemToDelete).next('#export-png').remove();
			$(itemToDelete).remove();
		}

		function CreateCameraEffect()
		{
			$('.flash').fadeIn("fast").delay(200).fadeOut("fast");
			var audio = new Audio('../sounds/flash.mp3');
			audio.play();
		}

			var isBusy = false;
		 	
		 	if(isBusy === true)
		 	{
		 		$('.screen-shot').attr('disabled', 'disabled');

		 	}
		 	else
		 	{
		 		$('.screen-shot').attr('disabled', false);
		 	
		 		$('.screen-shot').on('click',function(){
			
						isBusy = true;
			
		
							$('.meter').fadeIn();
							var inner = $('.inner');
							inner.addClass('animate');
							ClearSelection();
							
							
							 inner.on('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
				  				function(evt) {
				  					
				  					CreateCameraEffect();
				  					var imgdimensions = UpdateCanvasSize('.photo-area');
				   				
				    			html2canvas($('.photo-area'), 
								{
						  			
						  		
						  								  	

						  		onrendered: function(canvas) 
						  		{
									
									
									var img = canvas.toDataURL("image/png");
									
									document.getElementById('export-png');
									
									var previewSrc = StoreScreenShotSrc(img);



									var downloadLink = $('<a download=\"dropsome.png\" id=\"export-png\" class=\"link\">Download</a>');
									
									 $('.previews').append("<img title='click to preview' class=\"preview\" src='"+ previewSrc +"' />");
									 ;
										$(downloadLink).attr('href', previewSrc);
									 $(downloadLink).appendTo('.previews');
								
									 CheckNumberOfPreviews();

								$('.screen-shot').bind('click');
									
									  $(downloadLink).css({
									  	'opacity':0,
									  	'margin-top': '140'
									  })
									  
									  $('.preview').animate({
									  	'opacity':1
									  }, 1200)
									  $(downloadLink).animate({
									  	'opacity':1
									  }, 1200)
									
									$(".preview").draggable(
				   						{ cancel: ".preview" }
									);


										$('.preview').on('click',function(event){
												

									  		var lightBox = $('<div class="light-box"> <img class="image" src="" /> </div>');
											var closeButton = $('<img class="close" src="../img/close.png"/> ');
											var download = $('<a class="download" download="dropsome.png" href="">Download</a>');
											var deleteButton = $('<a class="delete" href="#">Delete</a>'); 
											var prevButton = $('<a class="prev" href="#"> &#10092; </a>');
											var nextButton = $('<a class="next" href="#"> &#10093; </a>');

											$(prevButton).appendTo(lightBox);
											$(nextButton).appendTo(lightBox);
											$(closeButton).appendTo(lightBox);
											$(download).appendTo(lightBox);
											$(deleteButton).appendTo(lightBox);
											$(lightBox).appendTo('#wrapper').fadeIn(500);
											inPreviewMode = true;
											var imgSrc = $(this).next('#export-png').attr("href");
											var elementClicked = $(this);
											$('.image').attr('src', imgSrc);
											$(download).attr('href', imgSrc);
											
											if(inPreviewMode == true)
											{
												positionCloseButton($('.close'), $('.image'));
											}
											

											$('nav').css({
												'z-index': 0
											})

											$('.next').on('click',function(){
													
													setTimeout(function () {
														
														var current = $('#export-png[href="' + imgSrc + '"]');
															
															var next = $(current).next().attr('src');
															$(download).attr('href',next);
															$('.image').attr('src', next);
															imgSrc = next;
														
														$('.image, .close').hide(10).fadeIn(1000);

															if($('.previews').last('.previews #export-png').attr('href') == imgSrc)
															{	
																var firstHref = $('.previews #export-png').first().attr('href');
																imgSrc = firstHref;
																$('.image').attr('src',imgSrc);
																$(download).attr('href',imgSrc);
															}

															

															
													}, 200)
											})

											$('.prev').on('click',function(){
													
													setTimeout(function () {
														var current = $('#export-png[href="' + imgSrc + '"]');
														var firstHref = $('.previews #export-png').first().attr('src');
														var prevElem = $(current).prevAll('a.link').eq(0);
														var src = $(prevElem).attr('href');
														$('.image').attr('src', src);
														$(download).attr('href',src);
														imgSrc = src;
														$('.image, .close').hide(10).fadeIn(1000);

														if($('.previews').last('.previews #export-png').attr('href') == imgSrc)
															{	
																var lastHref = $('.previews #export-png').last().attr('href');
																imgSrc = lastHref;
																$('.image').attr('src',imgSrc);
																$(download).attr('href',imgSrc);
															}
    												
													}, 200)
													

													
												

													


											})
											$('.close').on('click',function(){
									  			$('.light-box').fadeOut(500);
									  			setTimeout(function () {
    												$('.light-box').remove();
												}, 500)
									  			
									  			inPreviewMode = false;
									  			$('nav').css({
													'z-index': 99
												})
									  		});

									  		$('.image').on('click',function(){
									  			$(lightBox).remove();
									  		})

									  		$('.delete').on('click', function(event){
												
													deletePreview(elementClicked);
													$('.light-box').fadeOut(200);
													CheckNumberOfPreviews();

											});


										});

									  


									

									
								},

							});


				    				inner.removeClass('animate');
				    				$('.meter').fadeOut(200);
				    				isBusy = true;
				    				disableScreenshot(isBusy);
								});
						});	 
				}



		function StoreScreenShotSrc(src)
		{
				var srcValues = [];
					srcValues.push(src);

    				 for(var i = 0; i < srcValues.length; i++)
    				 {
    				 	var src = srcValues[i];
    				 	
    				 	return src;				 	
					
    				 }

		}

		

		function CheckNumberOfPreviews()
		{

			
    		previewsVisible = true;
    		positionPreviewsnextToCanvas();
    		
			var numberOfPreviews = $('.previews').children().not('a');
    		for(var i =1; i < numberOfPreviews.length; i++ )
    		{
    			
    					
    			if(i  > 3)
    			{
    				AppendSliderControls();
    			}
    			else
    			{
    				RemoveControls();
    			}
    		}
    	}

    	$('.previews').on('dblclick', CheckNumberOfPreviews);
    	
		function AppendSliderControls()
		{
			 
			 $('.down-arrow').fadeIn(200);
			  $('.up-arrow').fadeIn(200);
			  positionArrows();
		}
		
		function RemoveControls()
		{
			$('.down-arrow').fadeOut(200);
			  $('.up-arrow').fadeOut(200);
		}
		
		function scrollDown()
		{
			
			var scrollPos = $('.previews').scrollTop();
			var scrollAmount = $('.preview').height() * 4 + 50;
        	$(".previews").animate({
          		scrollTop:  scrollPos += scrollAmount
     		});

        }

        function scrollUp()
		{
			
			var scrollPos = $('.previews').scrollTop();
			var scrollAmount = $('.preview').height() * 4 + 50;
        	$(".previews").animate({
          		scrollTop:  scrollPos -= scrollAmount
     		});

        }
		$('.down-arrow').on('click', scrollDown);
		$('.up-arrow').on('click', scrollUp);


		function CheckScreenHeight()
		{
			var windowHeight = $(window).height();
			
			
		
			if(windowHeight <= 680)
			{
				$('#bin').css({
				'position': 'fixed',
				'left':95
				});	
			}
		
			
		}

		/**************************************************************
			position elements Eg bin screen shot button
		**************************************************************/

		function positionArrows()
		{
			var downArrowHeight = $('.down-arrow').height() / 2;
			var downArrowWidth = $('.down-arrow').width() /2;
			var upArrowHeight = $('.up-arrow').height() / 2;
			var upArrowWidth = $('.up-arrow').width() /2;
			var offset = $('.previews').offset();
			var height = $('.previews').height();
			var width = $('.previews').width() / 2;
			var bottom = offset.top + height - downArrowHeight;
			var left = offset.left + width - downArrowWidth; 

			$('.down-arrow').css({
				'position':'fixed',
				'top': bottom + 20,
				'left': left
			})
			
			$('.up-arrow').css({
				'position':'fixed',
				'top': offset.top - upArrowHeight - 20,
				'left': offset.left + width -  upArrowWidth
			})
			
		}
		function positionBinByCanvas()
		{
			var canvasPos = $('.photo-area').offset();
			var canvasH = $('.photo-area').height();
			var binHeight = $('#bin').height();
			var binWidth = $('#bin').width();
			var top = canvasPos.top + canvasH - binHeight;
			var left = canvasPos.left - binWidth;
		
		
				$('#bin').css({
				'position':'fixed',
				'top': top, 
				'left': left

				})
		}

		function positionButtonUnderCanvas()
		{
			var canvasOffset  = $('.photo-area').offset();
			var canvasWidth = $('.photo-area').width();
			var canvasHeight = $('.photo-area').height();
			var centerLeft = canvasOffset.left + canvasWidth / 2 - $('.screen-shot').outerWidth() / 2;
			var centerTop = canvasOffset.top + canvasHeight - $('.screen-shot').outerHeight() / 2;

			$('.screen-shot').css({
				'position': 'fixed',
				'top': centerTop,
				'left': centerLeft
			})
		}

		function positionPreviewsnextToCanvas()
		{
			var canvasOffset = $('.photo-area').offset();
			var previewsWidth = $('.previews').width(); 
			$('.previews').css({
				'left': canvasOffset.left - previewsWidth - 10
			})

		}
		// checks document height on load and on resize
		$(window).load(function(){
			CheckScreenHeight();
			positionArrows();



		});
		$(window).resize( function(){
			positionArrows();
			setTimeout(positionButtonUnderCanvas,200);
			
			if(previewsVisible == true)
			{
				setTimeout(positionPreviewsnextToCanvas,200);
			}

			if(inPreviewMode == true)
			{
				positionCloseButton($('.close'), $(' .image'));
			}
			
			setTimeout(positionBinByCanvas,200);
			CheckScreenHeight();
			PositionTitle($('.title'));	
			var dimensions = UpdateCanvasSize($('.photo-area'))
			centerCanvas(dimensions);
		});
		

		

		
		

		


	function InitializeApp()
	{
		// SOME JS GIBERRISH HERE
		$('body').on('load', function(event)
		{
			event.preventDefault();
		});

		//Make title editable
		function EditTitle()
		{
			var title = document.getElementsByClassName('title')[0];
			title.contentEditable = true;
		}

		function NavControl()
		{
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

		 	
		}

		$('.photo-area').on('click', function(){
		 		
		 			$('nav').animate({
				 		
				 		left: '-330px'
				 	
				 	}, 200);
				 	$('nav').removeClass('active');	
		 })

		$('.nav-tab').on('click', function(){
		 		
		 			var nav = $('nav');

 			nav.toggleClass('active');
 	

		 	if(!$(nav).hasClass('active'))
		 	{
		 			$('nav').animate({
				 		
				 		left: '-330px'
				 	
				 	}, 200);
		 	}
		 	else
		 	{
		 		$('nav').animate({
				 		
				 		left: '0px'
				 	
				 	}, 200);

		 	}

		 })

		$('.photo').on('mouseover', function(){
		 		
		 			
		 			$('nav').animate({
				 		
				 		left: '-330px'
				 	
				 	}, 200);
				 	$('nav').removeClass('active');	
		 })



		$('.title').on('click', function(){
			EditTitle();
		})


		// ENABLING JQUERY UI DRAGABLE BEHAVIOUR ON IMAGES IN CANVAS
	 	$('.photo').draggable(
	 	{
	        revert:false,
	        stack: '.photo-area .photo',
	        enable: true
	    });


	    $('#color-picker').spectrum({
    		color: "#f00",
    		showAlpha: true,
    		clickoutFiresChange: true,
    		allowEmpty:true,
    		showInput: true,
    		preferredFormat: "name",
    		chooseText: "choose",


    		change: function() {
    			var color = $('#color-picker');
    			var val =  $("#color-picker").spectrum("get", color.val());
    			var dynamicStyle =  document.getElementsByClassName('themestyles')[0];
    			$(".photo-area").attr('style', 'background: ' + val);
    			$('.themestyles').remove();
    			
    		}
		});

	    var dimensions = UpdateCanvasSize('.photo-area');
		centerCanvas(dimensions)

	    

	    

		// BINDING EVENTS
		dropArea.addEventListener("dragover", dragOver, false);  // add event listener to element with id drop zone. params include event type eg on click then function to be executed and then what function returns if nothing the set to false
		dropArea.addEventListener("dragleave", dragLeave, false);
		dropArea.addEventListener("drop", DropImageFile, false);
		/*dropArea.addEventListener("mousemove", MouseHandler, false);*/
		
		// BIND MOUSE TRACKING CALLBACK
		$('#wrapper').on('mousemove', function()
		{
			MouseHandler(event);
		})

		// SET UP THE BIN AND RECYCLE CONTAINER FUNCTIONALITY
		
		$('#bin').on('dblclick', HandleRecycleContainerVisibility);
		$('.bin-tab').on('click', HandleRecycleContainerVisibility);
		

		
		// positions elements
		positionBinByCanvas();
		positionButtonUnderCanvas();

		


	}


	InitializeApp();

});
							

						
							

		
  