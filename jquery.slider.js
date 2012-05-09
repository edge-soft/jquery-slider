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
							'next'				: 'a.next',
							'prev'				: 'a.prev',
							'slide'				: 'a.slide',
							'idPrefix'		: 'slider_'
						},
						'selectedClass'	: 'selected',
						'continous' : true
					}
					if (typeof options != 'undefined' && options.struct) options.struct = $.extend( default_settings.struct, options.struct);
					var settings = $.extend( default_settings, options);
					$this.data('slider', settings);
					
					$this.find(settings.struct.carousel).css('width', $this.find(settings.struct.carousel+' '+'#'+settings.struct.idPrefix+'0').outerWidth() * (maxSlide($this)+1))
					
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
					
					$this.on('click.slider', settings.struct.next, function(){
						$this.slider('show', $this.slider('next'));
						return false;
					});
					$this.on('click.slider', settings.struct.prev, function(){
						$this.slider('show', $this.slider('prev'));
						return false;
					});
					$this.on('click.slider', settings.struct.slide, function(){
						$this.slider('show', $(this).attr('href'));
						return false;
					});
				}
			});
		},
		show : function( index ) {
			return this.each(function(){
				if (!index)return;
				var $this = $(this), settings = $this.data('slider');
				var w = $this.find(settings.struct.carousel+' '+index).outerWidth();
				var target_element = $this.find(settings.struct.carousel+' '+index)
				var sel_element = $this.find(settings.struct.carousel+' '+$this.slider('selected'))
				var parent = target_element.parent();
				var index_diff = 0
				var slider_elements = parent.find('>*')
				var sel_element_index = slider_elements.index(sel_element)
				var target_el_index = slider_elements.index(target_element)
				var margin = 0
				var animate_el = $this.find(settings.struct.carousel)
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
				if (settings.animate){
					animate_el.clearQueue().animate({
						'margin-left':margin
					}, settings.animate*1000, settings.animateEasing,function(){
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
			});
		},
		selected: function (){
			return this.each(function(){
				var $this = $(this), settings = $this.data('slider');
				return $this.find(settings.struct.slide+'.'+settings.selectedClass).attr('href');
			});
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
				if (!settings.auto_interval){
					settings.auto_interval = setInterval(function(){
						$this.slider('show', $this.slider('next'));
					}, settings.auto*1000);
					$this.data('slider', settings);
				}
			})
		},
		destroy: function(){
			return this.each(function(){
				$(this).unbind('.slider').removeData('slider');
				
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
