/*
dojo-mama: a JavaScript framework
Copyright (C) 2014 Clemson University

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/

define(['dojo/_base/declare',
		'dojo/_base/kernel',
		'dojo/_base/lang',
		'dojo/dom-attr',
		'dojo/dom-class',
		'dojo/dom-construct',
		'dojo/dom-style',
		'dojo/has',
		'dojo/on',
		'dojo/router',
		'dojo/topic',
		'dojox/gesture/swipe',
		'dojox/mobile/Pane'
], function(declare, kernel, lang, domAttr, domClass, domConstruct, domStyle, has, on, router, topic, swipe, Pane) {

	// module:
	//     dojo-mama/layout/responsiveTwoColumn/SubNav

	return declare([Pane], {
		// summary:
		//     The sub navigation module

		// backButtonNode: [private] Object
		//     The node containing the mobile view's back button
		backButtonNode: null,
		baseClass: 'dmSubNav',
		// config: [private] Object
		//     The dmConfig object
		config: null,
		// fullscreenButtonNode: [private] Object
		//     The node for the button to toggle fullscreen
		fullscreenButtonNode: null,
		// fullscreenClickHandle: [private] Object
		//     The dojo/on handle to the fullscreenButton's click handler
		fullscreenClickHandle: null,
		// swipeHandle: [private] Object
		//     The dojo/on handle to the swipe handler
		swipeHandle: null,
		// titleNode: [private] Object
		//     The module's title node
		titleNode: null,

		constructor: function() {
			this.config = kernel.global.dmConfig;
		},

		buildRendering: function() {
			// summary:
			//     Build out the sub navigation elements
			this.inherited(arguments);

			/* back button */
			this.backButtonNode = domConstruct.create('a', {
				'class': 'dmSubNavBackButton',
				href: '/',
				innerHTML: '<div></div>'
			}, this.domNode);
			domStyle.set(this.backButtonNode, 'text-decoration', 'none');
			/* title (desktop) */
			this.titleNode = domConstruct.create('span', {
				'class': 'dmSubNavTitle'
			}, this.domNode);

			this.fullscreenButtonNode = domConstruct.create('button', {
				'class': 'dmFullscreenButton hidden_phone',
				role: 'button',
				tabindex: 0,
				title: 'Toggle fullscreen'
			}, this.domNode);

			this.fullscreenClickHandle = on(this.fullscreenButtonNode, 'click', lang.hitch(this, function() {
				var html = document.getElementsByTagName('html')[0],
					view = this.config.activeModule && this.config.activeModule.currentView;
				domClass.toggle(html, 'fullscreen_mode');
				if (view) {
					view.resize();
				}
			}));

			// ARIA
			domAttr.set(this.titleNode, 'role', 'heading');
			domAttr.set(this.titleNode, 'aria-live', 'polite');
			domAttr.set(this.titleNode, 'tabindex', 0);
			domAttr.set(this.backButtonNode, 'role', 'button');
			domAttr.set(this.backButtonNode, 'tabindex', 0);
			domAttr.set(this.backButtonNode, 'title', 'Back');
		},

		startup: function() {
			this.inherited(arguments);
			/* subscribe to topics */
			topic.subscribe('/dojo-mama/updateSubNav', lang.hitch(this, this.updateSubNav));
		},

		destroy: function() {
			this.fullscreenClickHandle.remove();
			if (this.swipeHandle) {
				this.swipeHandle.remove();
			}
			this.inherited(arguments);
		},

		updateSubNav: function(args) {
			// summary:
			//    Updates the sub nav functionality
			// description:
			//    Updates the sub nav
			// args: Object
			//    Args is an object containing parameters for the sub nav:
			//
			//    - back: a string containing the back button route
			//    - title: a string containing the title of the current view
			//    - optionalBar: a DOM node or a Dijit widget with a domNode property
			//      containing optional navigation options such as view-specific
			//      buttons or a search bar. If optionalBar is the string "empty", it
			//      removes the previously added optional DOM node or widget.
			//
			//    Each key is optional.

			var back = args.back,
				title = args.title,
				optionalBar = args.optionalBar;

			// update subnav title
			if (title !== undefined && title !== null) {
				this.titleNode.innerHTML = title;
			}
			// update back button route
			if (back) {
				this.backButtonNode.href = '#' + back;
			}

			// add optional DOM node to subnav
			if (optionalBar !== undefined && optionalBar !== null) {
				
				if (typeof optionalBar === 'object') {
					this.optionalBarId = optionalBar.id; // works for both widgets and native DOM nodes

					if (optionalBar.domNode !== undefined && optionalBar !== null) { // is a widget
						domConstruct.place(optionalBar.domNode, this.domNode);
					}
					else if (optionalBar.id !== undefined && optionalBar !== null) { // is a native DOM node
						domConstruct.place(optionalBar, this.domNode);
					}
				}
				
				else if (optionalBar === "empty") {
					domConstruct.destroy(this.optionalBarId);
				}
			}

		}

	});
});
