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
		return parseInt(el.find(settings.struct.carousel+'>*:last-child').attr('id').substr('slider_'.length));
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
						'selectedClass'	: 'selected'
					}
					if (options.struct) options.struct = $.extend( default_settings.struct, options.struct);
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
				var margin = -1*w*parseInt(index.substr(('#'+settings.struct.idPrefix).length));
				if (settings.animate){
					$this.find(settings.struct.carousel).clearQueue().animate({
						'margin-left':margin
					}, settings.animate*1000, settings.animateEasing);
				}
				else{
					$this.find(settings.struct.carousel).css('margin-left', margin)
				}
				$this.find(settings.struct.slide).removeClass(settings.selectedClass);
				$this.find(settings.struct.slide+'[href='+index+']').addClass(settings.selectedClass);
			});
		},
		selected: function (){
			var $this = $(this), settings = $this.data('slider');
			return $this.find(settings.struct.slide+'.'+settings.selectedClass).attr('href');
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
