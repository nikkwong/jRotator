        ;
        (function($, window, document, undefined) {
            var jRotator = function(elem, options) {
                var _this = this;
                this.elem = elem;
                this.$elem = $(elem);
                this.children = this.$elem.children();
                this.$children = $(this.$elem.children());
                this.childrenCount = this.$children.length;
                this.options = options;
                this.frequencyHandle = 0;
                this.timerHandles = {};
                this.loopPosition = 0;
                this.intervalHandles = {};
                this.resizeTimer = 0;
                this.width = this.$elem.outerWidth();
                this.leftBound = this.elem.getBoundingClientRect().left;
                this.rightBound = this.elem.getBoundingClientRect().right;

                // Optional metadata i.e. data-plugin-options
                this.metadata = this.$elem.data('jrotator-options');

            };

            // the jrotator prototype
            jRotator.prototype = {
                opts: {
                    lowerBound: 480,
                    upperBound: 0,
                    translationSpeed: 100,
                    flowDirection: 'ltr'
                },

                init: function() {
                    var _this = this,
                        $window = $(window),
                        lastChild = this.$children[this.childrenCount - 1];

                    // Introduce defaults that can be extended either
                    // globally or using an object literal.                    
                    this.config = $.extend({}, this.opts, this.options, this.metadata);
                    this.fixParentHeight.call(this);

                    $window.on('resize focus', this.resetHandler.bind(this));
                    $window.on('blur', function () {
                        this.reset();
                        this.removeEventHandlers();
                        this.initPosition.call(this);
                    }.bind(this));

                    this.initPosition.call(this);
                    if(this.childrenEqualOrOverflowParent()) {
                        this.addTranslationHandlers.call(this);
                        this.queueController.call(this, lastChild);
                        // Trigger initial flow.
                        this.$children.trigger('translate');
                    } else {
                        this.centerElements.call(this);
                    }

                    return this;
                },

                /** 
                * 
                * The animation relies on translations, so absolutely positioned
                * children must be initiated into position based on box positioning.
                *
                **/

                initPosition: function() {
                    var _this = this;
                    var leftBound = 0;
                    this.$children.each(function() {
                        $this = $(this);
                        // Get leftmost element
                        if ($this.prev().length !== 0) {
                            leftBound += $this.prev().outerWidth(true);
                            $this.css({
                                "-webkit-transform": "translate(" + leftBound + "px, 0px)",
                                "transform": "translate(" + leftBound + "px, 0px)",
                            });
                        }
                    });
                },

                fixParentHeight: function () {
                    // Get tallest child
                    var retVal = 0;
                    for (var i = 0; i < this.childrenCount; i++) {
                        if ($(this.$children[i]).outerHeight(true) > retVal) {
                            retVal = $(this.$children[i]).outerHeight(true);
                        }
                    }
                    this.$elem.css({"height": retVal});
                },

                addTranslationHandlers: function () {
                    var _this = this;
                    this.$children.on('translate', function () {
                        var $this = $(this),
                            w = $this.outerWidth(),
                            moveParams = _this.getTranslationDuration(this);
                        $this.css({
                            "-webkit-transform": "translate(-" + $this.outerWidth(true) + "px, 0px)",
                            "transform": "translate(-" + $this.outerWidth(true) + "px, 0px)",
                            "-webkit-transition": "-webkit-transform " + moveParams.translationDuration + "ms linear",
                            "transition": "transform " + moveParams.translationDuration + "ms linear"
                        });
                    });
                    this.$children.on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                        //Hide then move back to original Position.
                        $(this).toggle()
                            .css({
                                "-webkit-transform": "translate(" + parseInt(_this.width) + "px, 0px)",
                                "transform": "translate(" + parseInt(_this.width) + "px, 0px)"
                        }).toggle();
                    });
                },

                getTranslationDuration: function (child) {
                    var retVal = {};
                    retVal.distanceRequired = child.getBoundingClientRect().left - parseInt($(child).css("marginLeft")) - this.leftBound + $(child).outerWidth(true);
                    retVal.translationDuration = (retVal.distanceRequired / (this.opts.translationSpeed)) * 10000;
                    return retVal;
                },

                /** 
                * 
                * Trigger the transition on the first element which has a 
                * completed animation after the last element begins its animation cycle.
                *
                **/

                queueController: function (child) {
                    var distanceToSweetPoint = this.getTranslationDuration(child).distanceRequired - (this.rightBound - this.leftBound);
                    // debugger;
                    setTimeout(function () {
                        if (this.loopPosition === this.$children.length) {
                            // We are at the beginning, restart.
                            this.loopPosition = 0;
                        }
                        $(this.$children[this.loopPosition]).trigger('translate');
                        this.queueController(this.$children[this.loopPosition]);
                        this.loopPosition++;
                    }.bind(this), ((distanceToSweetPoint / this.opts.translationSpeed) * 10000));
                },

                reset: function() {
                    // Stop translations on all children
                    this.$children.each(function() {
                        var _this = $(this);
                        _this.addClass('notransition'); // Disable transitions
                        _this[0].offsetHeight; // Trigger a reflow, flushing the CSS changes
                        _this.removeClass('notransition');
                        _this.css({"-webkit-transform": "", "transform": "", "-webkit-transition": "", "transition": ""});
                    });

                    // Check if dimensions changed
                    this.width = this.$elem.outerWidth();
                    this.leftBound = this.elem.getBoundingClientRect().left;
                    this.rightBound = this.elem.getBoundingClientRect().right;
                },

                resetHandler: function () {
                    clearTimeout(this.resizeTimer);
                    this.resizeTimer = setTimeout(function() {
                        this.reset();
                        this.removeEventHandlers();
                        this.init();
                    }.bind(this), 250);
                },

                removeEventHandlers: function () {
                    this.$children.each(function () {
                        $(this).off();
                    })
                },

                /** 
                * 
                * We need to make sure that at least one element
                * is completely outside the bounding container  
                * so there are no gaps in the rotator. If it is
                * within the container, we just return.
                *
                **/

                childrenEqualOrOverflowParent: function() {
                    var child = this.$children[this.childrenCount - 1];
                    return this.elem.getBoundingClientRect().right <= child.getBoundingClientRect().left - parseInt($(child).css('marginLeft'));
                },

                centerElements: function () {
                    // Get the size of all children.
                    var childLength = 0;
                    for (var i = 0; i < this.childrenCount; i++) {
                        childLength += $(this.$children[i]).outerWidth(true);
                    }
                    var pxLeft = (this.width - childLength) / 2;
                    this.$children.each(function () {
                        $(this).css({
                            "-webkit-transform": "translate(" + pxLeft + "px, 0px)",
                            "transform": "translate(" + pxLeft + "px, 0px)"
                        });
                        pxLeft += $(this).outerWidth(true);
                    });
                }
            };

            jRotator.opts = jRotator.prototype.opts;
            window.jRotator = jRotator;

            $.fn.jRotator = function(options) {
                return this.each(function() {
                    new jRotator(this, options).init();
                });
            };

        })(jQuery, window, document);