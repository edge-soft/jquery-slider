/*!
 * slider v@VERSION - Yet another slider for jQuery
 *
 * Copyright 2012, Alexander (SASh) Alexiev @ Edge Soft Ltd.
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * or GPL Version 2 (http://www.opensource.org/licenses/gpl-2.0.php) licenses.
 *
 * Date: @DATE
 */

/**
 * HTML Structure:
 * .frame
 *	.carousel
 *		#slider_X (the element must be emidiate child of the .carousel - .carousel>#slider_X)
 * a.prev
 * a.slide[href=#slider_X] (a.slide.selected[href=#slider_X])
 * a.next
 * */
(function($){
	var maxSlide = function(el){
		var settings = el.data('slider');
		var all_sliders = el.find(settings.struct.carousel+'>*')
		return all_sliders.index(el.find(settings.struct.carousel+'>*:last-child'));
	}
	var methods = {
		init : function( options ) { 
			return this.each(function(){
				var $this = $(this);
				
				if (!$this.data('slider')){
					var default_settings = {
						'animate'				: 0.5,
						'animateEasing'	: 'swing',
						'auto'					: 5.5,
						'pauseOnHover'	: true,
						'struct': {
							'frame'				: '.frame',
							'carousel'		: '.carousel',
							'next'				: '.next',
							'prev'				: '.prev',
							'slide'				: 'a.slide',
							'idPrefix'		: 'slider_'
						},
						/**
						 *  On which element hover to show next previous buttons
						 *  for example (frame, carousel) if set to true work on
						 *  hover entire slider - default false dont do anything
						 *  on hover.
						 */
						'showNextPrevOnHover' : false,
						'selectedClass'	: 'selected',
						'continous' : false,
						'arrowsControl' : true,
						'fadeInFadeOut' : false, // add animation fadein target element fadeout all others elements
						'preventRotation': true, // Don't allow next and previous when there isn't (also hide next prev buttons). Don't work if continous is true
						'noSwipeSelector':'button, input, select, textarea, .noSwipe'
					}
					if (typeof options != 'undefined' && options.struct) options.struct = $.extend( default_settings.struct, options.struct);
					var settings = $.extend( default_settings, options);
					$this.data('slider', settings);
					
					if (settings.auto){
						$this.slider('resume');
					}
					if (settings.pauseOnHover){
						$this.on('mouseenter.slider', function(){
							$this.slider('pause');
						}).on('mouseleave.slider', function(){
							$this.slider('resume');
						});
					}
					if (settings.showNextPrevOnHover){
						var showNextPrevOnHoverElement = $this
						if(settings.struct[settings.showNextPrevOnHover]){
							showNextPrevOnHoverElement = 
									$this.find(settings.struct[settings.showNextPrevOnHover])
						}
						showNextPrevOnHoverElement.on('mouseenter.slider', function(){
							if($this.slider('hasNext')){
								$this.find(settings.struct.next).show()
							}
							if($this.slider('hasPrev')){
								$this.find(settings.struct.prev).show()
							}
							settings.hover = true;
							$this.data('slider', settings);
						}).on('mouseleave.slider', function(){
							$this.find(settings.struct.prev).hide()
							$this.find(settings.struct.next).hide()
							settings.hover = false;
							$this.data('slider', settings);
						});
					}
					
					$this.on('click.slider', settings.struct.next, function(e){e.preventDefault();
						$this.slider('showNext');
						return false;
					});
				
					$this.on('click.slider', settings.struct.prev, function(e){e.preventDefault();
						$this.slider('showPrev');
						return false;
					});
					
					if(settings.arrowsControl){
						$(window).on('keyup.slider', function(e){
							if($(e.target).closest(settings.noSwipeSelector).length){
								return
							}
							var keyboardKey = e.which?e.which:e.keyCode
							switch(keyboardKey){
								case 37: // left arrow is pressed
								case 39: // right arrow is pressed
									$this.slider('pause');
									$this.slider('resume');
									break
							}
							switch(keyboardKey){
								case 37: // left arrow is pressed
									$this.slider('showPrev');
									break
								case 39: // right arrow is pressed
									$this.slider('showNext');
									break
							}
							return false;
						});
					}
					
					$this.on('click.slider', settings.struct.slide, function(e){e.preventDefault();
						$this.slider('show', $(this).attr('href'));
						return false;
					});
					
					$(window).on('resize.slider', function(e){
						$this.slider('show', $this.slider('selected'), true);
						$this.find(settings.struct.carousel).css('width', $this.find(settings.struct.carousel+' '+'#'+settings.struct.idPrefix+'0').outerWidth(true) * (maxSlide($this)+1))
						return false;
					}).trigger('resize.slider')
					


					/* touchSwipe integration 
					 * 
					 * Get it from:
					 * https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
					 * http://labs.skinkers.com/touchSwipe/
					 * http://plugins.jquery.com/project/touchSwipe
					 * */
					if ($this.swipe && (!$.browser.msie || $.browser.version >= 8.0) ){
						var swipe = function (event, direction)
						{
							if (direction == 'left'){
								// if not last
								if ($this.slider('hasNext')){
									$this.slider('showNext');
								}
								else{
									$this.slider('show', $this.slider('selected'));
								}
							}
							else{
								// if not first
								if ($this.slider('hasPrev')){
									$this.slider('showPrev');
								}
								else{
									$this.slider('show', $this.slider('selected'));
								}
							}
							return false;
						}
						var swipeStatus = function (event, phase, direction, distance, duration)
						{
							if (phase == 'start'){
								$this.slider('pause');
							}
							if (phase == 'end' || phase == 'cancel'){
								$this.slider('resume');
							}
							if (phase == 'move'){
								$this.slider('offset', direction == 'left'?distance*-1:distance, duration);
							}

						}
						var swipeOptions=
						{
							swipeLeft:swipe,
							swipeRight:swipe,
							swipeStatus: swipeStatus,
							threshold:10,
							allowPageScroll: 'vertical',
							excludedElements: settings.noSwipeSelector
						}

						$this.find(settings.struct.frame).swipe(swipeOptions);
					}

				}
			});
		},
		offset: function (distance, duration){
			return this.each(function(){
				
				var $this = $(this), settings = $this.data('slider');
				var animate_el = $this.find(settings.struct.carousel); 
				
				var initial_margin = animate_el.data('slider.initialMargin');
				if (!initial_margin) {
					initial_margin = parseInt(animate_el.css('margin-left').substring(0, animate_el.css('margin-left').length-2));
					animate_el.data('slider.initialMargin', initial_margin);
				}
				animate_el.stop().css('margin-left', (initial_margin + distance)+'px');
				//console.log(Math.abs(distance/duration));
				animate_el.data('slider.offsetSpeed', Math.abs(distance/duration));
			});
		},
		show : function( index, no_animation ) {
			return this.each(function(){
				if (!index)return;
				var $this = $(this), settings = $this.data('slider');
				var w = $this.find(settings.struct.carousel+' '+index).outerWidth(true);
				var target_element = $this.find(settings.struct.carousel+' '+index)
				var sel_element = $this.find(settings.struct.carousel+' '+$this.slider('selected'))
				var parent = target_element.parent();
				var index_diff = 0
				var slider_elements = parent.find('>*')
				var sel_element_index = slider_elements.index(sel_element)
				var target_el_index = slider_elements.index(target_element)
				var margin = 0
				var animate_el = $this.find(settings.struct.carousel)
				animate_el.removeData('slider.initialMargin');
				var offsetSpeed = animate_el.data('slider.offsetSpeed');
				animate_el.removeData('slider.offsetSpeed');
				if(settings.continous && !settings.freeze_elements && slider_elements.length>2){
					if(!sel_element.next().length && !target_element.prev().length && settings.animate){
						index_diff = -1
						settings.freeze_elements = true
						parent.append(target_element)
					}
					else if(!sel_element.prev().length && !target_element.next().length && settings.animate){
						index_diff = 1
						settings.freeze_elements = true
						parent.prepend(target_element)
					}
					$this.data('slider', settings);
				}
				if(index_diff){
					margin = -1*w*(sel_element_index);
					animate_el.css('margin-left', -1*w*(sel_element_index+index_diff))
				}else{
					margin = -1*w*(target_el_index);
				}
				if (settings.animate && !no_animation){
					var speed = settings.animate*1000;
					if (typeof offsetSpeed!='undefined'){
						var distance = Math.abs(margin - parseInt(animate_el.css('margin-left').substring(0, animate_el.css('margin-left').length-2)));
						speed = distance/offsetSpeed;
					}
					if(settings.fadeInFadeOut){
						slider_elements.not(target_element).stop().clearQueue().animate({
							'opacity':'0'
							}, speed, settings.animateEasing, function(){
								slider_elements.not(target_element).css('opacity',1)
							})
						target_element.css('opacity',0).stop().clearQueue().animate({
							'opacity':'1'
							}, speed, settings.animateEasing)
					}
					animate_el.stop().clearQueue().animate({
						'margin-left':margin
					}, speed, settings.animateEasing,function(){
						switch (index_diff) {
							case -1:
								animate_el.css('margin-left', -1*w*0)
								parent.prepend(target_element)
								break;
							case 1:
								animate_el.css('margin-left', -1*w*(slider_elements.length-1))
								parent.append(target_element)
								break;
						}
						if(index_diff)
							settings.freeze_elements = false
						$this.data('slider', settings);

					});
				}
				else{
					animate_el.css('margin-left', margin)
				}
				$this.find(settings.struct.slide).removeClass(settings.selectedClass);
				$this.find(settings.struct.slide+'[href='+index+']').addClass(settings.selectedClass);
				if( !settings.continous && settings.preventRotation ){
					if( !$this.slider('hasNext') ){
						$this.find(settings.struct.next).hide()
					} else if(!settings.showNextPrevOnHover || settings.hover) {
						$this.find(settings.struct.next).show()
					}
					if( !$this.slider('hasPrev') ){
						$this.find(settings.struct.prev).hide()
					} else if(!settings.showNextPrevOnHover || settings.hover) {
						$this.find(settings.struct.prev).show()
					}
				}
			});
		},
		showNext: function (){
			var $this = $(this), settings = $this.data('slider');
			if( !settings.continous && settings.preventRotation && !$this.slider('hasNext') ){
				return
			}
			$this.slider('show', $this.slider('next'));
		},
		showPrev: function (){
			var $this = $(this), settings = $this.data('slider');
			if( !settings.continous && settings.preventRotation && !$this.slider('hasPrev') ){
				return
			}
			$this.slider('show', $this.slider('prev'));
		},
		selected: function (){
			var res = null;
			this.each(function(){
				var $this = $(this), settings = $this.data('slider');
				res = $this.find(settings.struct.slide+'.'+settings.selectedClass).attr('href');
			});
			return res;
		},
		hasNext: function(){
			var $this = $(this), settings = $this.data('slider');
			var selected = $this.slider('selected');
			if (!selected)return false;
			var res = selected.match(new RegExp('^\\#'+settings.struct.idPrefix+'([0-9]+)$'));
			
			if (!res || maxSlide($this) <= parseInt(res[1])) return false;
			else return true;
			
		},
		next: function(){
			var $this = $(this), settings = $this.data('slider');
			var selected = $this.slider('selected');
			if (!selected)return selected;
			return selected.replace(new RegExp('^\\#'+settings.struct.idPrefix+'([0-9]+)$'), function(s, id){
				if (maxSlide($this) <= parseInt(id))return ('#'+settings.struct.idPrefix)+'0';
				else return ('#'+settings.struct.idPrefix)+(parseInt(id)+1);
			})
		},
		hasPrev: function(){
			var $this = $(this), settings = $this.data('slider');
			var selected = $this.slider('selected');
			if (!selected)return false;
			var res = selected.match(new RegExp('^\\#'+settings.struct.idPrefix+'([0-9]+)$'));
			
			//if (maxSlide($this) > id+1)return '#slider_0';
			if (!res || parseInt(res[1])==0) return false;
			else return true;
		},
		prev: function(){
			var $this = $(this), settings = $this.data('slider');
			var selected = $this.slider('selected');
			if (!selected)return selected;
			return selected.replace(new RegExp('^\\#'+settings.struct.idPrefix+'([0-9]+)$'), function(s, id){
				//if (maxSlide($this) > id+1)return '#slider_0';
				if (parseInt(id)==0) return ('#'+settings.struct.idPrefix)+(maxSlide($this));
				else return ('#'+settings.struct.idPrefix)+(parseInt(id)-1);
			})
		},
		pause: function(){
			return this.each(function(){
				var $this = $(this), settings = $this.data('slider');
				if (settings.auto_interval){
					clearInterval(settings.auto_interval);
					settings.auto_interval=false;
					$this.data('slider', settings);
				}
			})
		},
		resume: function(){
			return this.each(function(){
				var $this = $(this), settings = $this.data('slider');
				if (!settings.auto_interval && !settings.stop && settings.auto){
					settings.auto_interval = setInterval(function(){
						settings = $this.data('slider')
						settings.backward = settings.backward ? settings.backward : false;
						if( settings.preventRotation && !settings.backward && !$this.slider('hasNext') ){
							settings.backward = true
						} else if ( settings.backward && !$this.slider('hasPrev') ){
							settings.backward = false
						}
						if( settings.backward ){
							$this.slider('showPrev');
						} else {
							$this.slider('showNext');
						}
						$this.data('slider', settings);
					}, settings.auto*1000);
					$this.data('slider', settings);
				}
			})
		},
		stop: function(){
			return this.each(function(){
				var $this = $(this), settings = $this.data('slider');
				settings.stop = true;
				$this.data('slider', settings);
				$this.slider('pause');
			})
		},
		start: function(){
			return this.each(function(){
				var $this = $(this), settings = $this.data('slider');
				settings.stop = false;
				$this.data('slider', settings);
				$this.slider('resume');
			})
		},
		destroy: function(){
			return this.each(function(){
				$(this).unbind('.slider').removeData('slider');
				$(window).unbind('.slider');
			})
		}
		
	};


	$.fn.slider =	function(method){
		
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.slider' );
		}    
  
	};
	
})(jQuery);