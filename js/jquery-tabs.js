;(function ($) {
	"use strict";

	var JqueryTabsObject = function(element, options) {
		this.options = $.extend({}, $.fn.jqueryTabs.defaults, options);
		this.container = $(element);
		this.element_data = this.container.data();

		// data attribute options
		for(var j in this.element_data) {
			if (this.element_data.hasOwnProperty(j)) {
				this.option(j, this.element_data[j]);
			}
		}

		this._startup();
	};

	JqueryTabsObject.prototype = {
		active: false,
		triggers: null,
		triggersA: null,
		tabs_elements: null,
		tabs_animation_block: null,
		currentTab: 0,

		/**
		 * Closes all tabs.
		 * @private
		 */
		_closeTabs: function () {
			this.triggers.removeClass(this.options.activeTabLiClass);
			this.tabs_elements.hide().removeClass(this.options.activeTabItemClass);
		},
		
		/**
		 * Function called when a tab is clicked.
		 * @private
		 * @param {Event} The event when the element was activated
		 */
		_handleToggle: function (event) {
			var tab = $(event.currentTarget);
			if (!tab.hasClass(this.options.stopClass)) {
				event.preventDefault();
			}
			this.openTab(tab.data('tab') || 0);
		},

		/**
		 * Creates all events and starts the tabs.
		 * @private
		 */
		_startup: function () {
			var self = this, tab_body_el = this.options.tabBodyId ? $(this.options.tabBodyId) : false;
			
			if (this.active) {
				this.destroy();
			}

			this.active = true;
			this.triggers = this.container.children('ul:first-child').children();
			this.triggersA = this.triggers.children(this.options.triggerTagType);

			if (tab_body_el && tab_body_el.length) {
				// by setting the option "tabBodyId" we can use a tab body that is not a child of the container. It can be anywere on the page.
				this.tabs_elements = tab_body_el.children('.' + this.options.tabItem);
			} else {
				this.tabs_elements = this.container.children('.' + this.options.tabBody).children('.' + this.options.tabItem);
			}

			this.triggersA.each(function (index) {
				$(this).data('tab', index).on('click', function (event) {
					self._handleToggle(event);
				});
			});

			if (this.options.initialOpenHref !== null) {
				this.openByHref(this.options.initialOpenHref);
			} else {
				this.openTab(this.options.initialOpenNum);
			}
		},

		/**
		 * Opens a tab based on the tabs position in a 0 based array.
		 * @public
		 * @param {Int} num The tab position to open
		 */
		openTab: function (num) {
			this.currentTab = num;
			if (typeof this.options.beforeOpenCallback === 'function') {
				this.options.beforeOpenCallback($(this.triggers[num]), $(this.tabs_elements[num]), this);
			}
			if (!this.options.killOpen && this.tabs_elements[num] && this.triggers[num]) {
				this._closeTabs();
				$(this.triggers[num]).addClass(this.options.activeTabLiClass);
				$(this.tabs_elements[num]).addClass(this.options.activeTabItemClass).show();
				if (typeof this.options.openCallback === 'function') {
					this.options.openCallback($(this.triggers[num]), $(this.tabs_elements[num]), this);
				}
			}
			this.options.killOpen = false;
		},
		
		/**
		 * Opens a tab based on the href of the a tag relating to the tab you would like to open.
		 * @public
		 * @param {String} id The href of the a tag to open
		 */
		openByHref: function(id) {
			var num = this.triggers.find('[href="' + id + '"]').data('tab');
			if (num) {
				this.openTab(parseInt(num, 10));
			} else {
				this.openTab(0);
			}
		},
		
		/**
		 * Removes all events from the tab
		 * @public
		 */
		destroy: function () {
			if (this.triggersA && this.triggersA.length) {
				try {
					this.triggersA.off('click');
				} catch(e) {

				}
			}
			this.triggers = [];
			this.triggersA = [];
			this.tabs_elements = [];
		},
		
		/**
		 * Instantiates the tab class
		 * @public
		 */
		build: function () {
			this.destroy();
			this._startup();
		},

		/**
		 * Sets multiple options on the plugin
		 * @private
		 * @return {object} current instance of the plugin
		 */
		_setOptions: function (options) {
			var self = this;
			$.each(options, function (key, value) {
				self._setOption(key, value);
			});

			return this;
		},

		/**
		 * Sets an option on the plugin
		 * @private
		 * @return {object} current instance of the plugin
		 */
		_setOption: function (key, value) {
			this.options[key] = value;
			
			return this;
		},

		/**
		 * Gets the plugin instance
		 * @public
		 * @return {object} current instance of the plugin
		 */
		widget: function () {
			return this;
		},

		/**
		 * Gets/Sets an option for the plugin
		 * @public
		 * @return {*} Either the value of the option or the current instance of the plugin
		 */
		option: function(key, value) {
			var options = key;
			if (arguments.length === 0) {
				// don't return a reference to the internal hash
				return $.extend( {}, this.options );
			}

			if (typeof key === "string") {
				if (value === undefined) {
					return this.options[key];
				}
				options = {};
				options[key] = value;
			}
			this._setOptions(options);

			return this;
		}
	};	
	
	$.fn.jqueryTabs = function (option) {
		var isMethodCall = typeof option === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;
		// prevent calls to internal methods
		if ( isMethodCall && option.charAt( 0 ) === "_" ) {
			return returnValue;
		}

		// call internal method
		if ( isMethodCall ) {
			this.each(function() {
				var instance = $(this).data('jqueryTabs'),
					methodValue = instance && $.isFunction( instance[option] ) ? instance[ option ].apply( instance, args ) : instance;
				if (instance && methodValue && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
				return false;
			});
		} 
		// instantiate plugin
		else {
			this.each(function () {
				var $this = $(this),
					data = $this.data('jqueryTabs'),
					options = typeof option === 'object' && option;
				if (!data) {
					$this.data('jqueryTabs', (data = new JqueryTabsObject(this, options)));
				}
			});
		}
		return returnValue;
	};	

	/**
	 * Default Options
	 * @type {Object}
	 */
	$.fn.jqueryTabs.defaults = {
		activeTabItemClass: 'active',
		activeTabLiClass: 'active', 
		tabBody: 'tab-content',
		tabItem: 'tab-pane',
		stopClass: 'dont-stop',
		openCallback: null,
		beforeOpenCallback: null,
		initialOpenNum: 0,
		initialOpenHref: null,
		killOpen: false,
		tabBodyId: null,
		triggerTagType: 'a'
	};

	/**
	 * Constructor
	 */
	$.fn.jqueryTabs.Constructor = JqueryTabsObject;

	// on doc ready instantiate any tab with class name of "jquery-tabs-auto"
	$(document).ready(function() {
		$('.jquery-tabs-auto').jqueryTabs();
	});
})(jQuery);