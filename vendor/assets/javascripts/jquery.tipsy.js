// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// releated under the MIT license

(function($) {

    function maybeCall(thing, ctx) {
        return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    }
    
    function isElementInDOM(ele) {
      ele = ele.parentNode;
      while (ele) {
        if (ele == document) return true;
        else ele = ele.parentNode;
       }
      return false;
    }

    function fixTitle($ele) {
        if ($ele.attr('title') || typeof($ele.attr('original-title')) != 'string') {
            var $title = $e.attr('title');
            $ele.removeAttr('title').attr('title','').attr('original-title', $title || '');
        }
    }

    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        fixTitle(this.$element);
    }

    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                var $link = this;

                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).appendTo(document.body);

                var pos;
                try {
                  pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].getBBox().width,
                    height: this.$element[0].getBBox().height
                  });
                }
                catch (TypeError) {
                  pos = $.extend({}, this.$element.offset(), {
                      width: this.$element[0].offsetWidth,
                      height: this.$element[0].offsetHeight
                  });
                }

                var actualWidth = $tip[0].offsetWidth, actualHeight = $tip[0].offsetHeight;
                var gravity = (typeof this.options.gravity == 'function')
                                ? this.options.gravity.call(this.$element[0])
                                : this.options.gravity;

                var tp;
                switch (gravity.charAt(0)) {
                    case 'n':
                        tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 's':
                        tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 'e':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
                        break;
                    case 'w':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
                        break;
                }

                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }

                $tip.css(tp).addClass('tipsy-' + gravity);

                if (this.options.fade) {
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    $tip.css({visibility: 'visible', opacity: this.options.opacity});
                }

                if (this.options.hoverStay) {               
                    $tip.find('.tipsy-inner').bind('mouseover',function(){$link.enter($link)});
                    $tip.find('.tipsy-inner').bind('mouseout',function(){$link.leave($link)});  
                }
            }
        },

        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() { $(this).remove(); });
            } else {
                this.tip().remove();
            }
        },

        enter: function() {
            $tip = this;
            this.hoverState = 'in';
            if(!$tip.tip().is(":visible")){         
                if ($tip.options.delayIn == 0) {
                    $tip.show();
                } else {
                    setTimeout(function() { if ($tip.hoverState == 'in') $tip.show(); }, $tip.options.delayIn);
                }
            }
        },
        
        leave: function() {
            $tip = this;
            this.hoverState = 'out';
            if($tip.tip().is(":visible")){
                if (this.options.delayOut == 0) {
                    $tip.hide();
                } else {
                    setTimeout(function() {if ($tip.hoverState == 'out') $tip.hide(); }, $tip.options.delayOut);
                }
            }
        },

        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            fixTitle($e);
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },

        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"/></div>');
            }
            return this.$tip;
        },

        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },

        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };

    $.fn.tipsy = function(options) {

        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            return this.data('tipsy')[options]();
        }

        options = $.extend({}, $.fn.tipsy.defaults, options);

        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }

        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn === 0) {
                tipsy.show();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
            }
        }

                function move(event) {
                        var tipsy = get(this);
                        tipsy.hoverState = 'in';
                        if (options.follow == 'x') {
                            var arrow = $(tipsy.$tip).children('.tipsy-arrow');
                            if (/^[^w]w$/.test(options.gravity) && arrow.position() != null) {
                                var x = event.pageX - ($(arrow).position().left($(arrow).outerWidth()/2));
                            } else if (/^[^e]e$/.test(options.gravity) && arrow.position() != null) {
                                var x = event.pageX - ($(arrow).position().left($(arrow).outerWidth()/2));
                            } else {
                                var x = event.pageX - ($(tipsy.$tip).outerWidth()/2);
                            }
                            $(tipsy.$tip).css('left', x);
                        } else if (options.follow == 'y') {
                            if (/^w|^e/.test(options.gravity) ) {
                                $(tipsy.$tip).css('top', event.pageY - ($(tipsy.$tip[0]).offsetHeight));
                            }
                        }

                }

        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsy.hide();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'out') tipsy.hide(); }, options.delayOut);
            }
        };

        if (!options.live) this.each(function() { get(this); });

        if (options.trigger != 'manual') {
            var binder   = options.live ? 'live' : 'bind',
                eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur',
                                eventMove = 'mousemove';
            this[binder](eventIn, enter)[binder](eventOut, leave)[binder](eventMove, move);

        }

        return this;

    };

    $.fn.tipsy.defaults = {
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover',
        follow: false,
        hoverStay: false,
    };

    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };

    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };

    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };

    $.fn.tipsy.autoBounds = function(margin, prefer) {
      return function() {
        var dir = {ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false)},
          boundTop = $(document).scrollTop() + margin,
          boundLeft = $(document).scrollLeft() + margin,
          $this = $(this);

        if ($this.offset().top < boundTop) dir.ns = 'n';
        if ($this.offset().left < boundLeft) dir.ew = 'w';
        if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
        if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

        return dir.ns + (dir.ew ? dir.ew : '');
      };
    };


})(jQuery);