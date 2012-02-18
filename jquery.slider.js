/* SLIDER PLUGIN 
 * 
 * HTML Structure:
 * .frame
 *	.carousel
 *		#slider_X
 * a.prev
 * a.slide#slider_x (a.slide.selected#slider_x)
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
					var settings = $.extend( {
						'animate'				: 0.5,
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
					}, options);
					$this.data('slider', settings);
					
					if (settings.auto){
						$this.slider('resume');
					}
					if (settings.pauseOnHover){
						$this.hover(function(){
							$this.slider('pause');
						}, function(){
							$this.slider('resume');
						});
					}
					
					$this.on('click', settings.struct.next, function(){
						$this.slider('show', $this.slider('next'));
						return false;
					});
					$this.on('click', settings.struct.prev, function(){
						$this.slider('show', $this.slider('prev'));
						return false;
					});
					$this.on('click', settings.struct.slide, function(){
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
					$this.find(settings.struct.carousel).clearQueue().animate({'margin-left':margin}, settings.animate*1000);
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