/*
 * Class Tab
 * @param  {[type]} opts [description]
 * @author : Zhong Yuan 2013.6.26
 * @version : v1.0 beta
 * @change log:
 *         2014.4.1 : improved touch event preventing
 */
var Tab = function(opts) {
	var init = function(opts) {
		this.conf = this._extends({
			bonds: [],
			selected: 'tab_selected',
			auto: false,
			startOn: 0,
			trigger: 'mouseover',
			touchDir : 'h',
			customSelect : null,
			onRender: function() {},
			onBefore: function() {},
			onAfter: function() {}
		}, opts);
		this._initDoms();
		this._initStates();
		this._initEvents();
		this._launch();
	};
	init.prototype = {
		constructor: init,
		// utils
		_id: function (id) {
			return document.getElementById(id);
		},
		_class: function (searchClass, node, tag) {
			var classElements = [],
				els, elsLen, pattern;
			if (node == null) node = document.body;
			if (tag == null) tag = '*';
			if (node.getElementsByClassName) {
				return node.getElementsByClassName(searchClass);
			}
			if (node.querySelectorAll) {
				return node.querySelectorAll('.' + searchClass);
			}
			els = node.getElementsByTagName(tag);
			elsLen = els.length;
			pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
			for (i = 0, j = 0; i < elsLen; i++) {
				if (pattern.test(els[i].className)) {
					classElements[j] = els[i];
					j++;
				}
			}
			return classElements;
		},
		_extends: function (destination, source) {
			for (property in source) {
				destination[property] = source[property];
			}
			return destination;
		},
		_addEvent: function (o, type, fn) {
			o.addEventListener ? o.addEventListener(type, fn, false) : o.attachEvent('on' + type, fn);
		},
	    _hasClass: function (element, name) {
	        var re = new RegExp('(^| )' + name + '( |$)');
	        return re.test(element.className);
	    },
	    _removeClass: function (element, name) {
	        var re = new RegExp('(^| )' + name + '( |$)');
	        if (name) {
	            element.className = element.className.replace(re, ' ').replace(/^\s+|\s+$/g, "");
	        } else {
	            element.className = '';
	        }
	    },
	    _addClass: function (element, name) {
	        if (!this._hasClass(element, name)) {
	            element.className += ' ' + name;
	        }
	    },
		// init
		_initDoms: function () {
			var that = this,
				c = this.conf,
				bondsLen = c.bonds.length,
				tabs = [], conts = [];

			for (var i = 0; i < bondsLen; i++) {
				var curBond = c.bonds[i];
				if (curBond.length < 2) {
					throw new Error('参数长度不匹配');
				}
				tabs.push(typeof curBond[0] === 'string' ? this._id(curBond[0]) : curBond[0]);
				conts.push(typeof curBond[1] === 'string' ? this._id(curBond[1]) : curBond[1]);
			}

			this.doms = {
				tabs: tabs,
				conts: conts
			};
		},
		_initStates: function () {
			var that = this,
				c = this.conf,
				d = this.doms,
				curIdx, total, order, touchDir, nextIndex, prevIndex;

			total = d.tabs.length;

			touchDir = 'ontouchstart' in window ? c.touchDir : false;

			this.states = {
				curIdx: 0,
				total : total,
				auto : c.auto,
				order : null,
				enable : true,
				touchDir : touchDir
			};
		},
		_initEvents: function () {
			var that = this,
				c = this.conf, d = this.doms, s = this.states,
				touchAttr, ckTouchAttr, touching = false, selectChanged = false, startTouch, ckStartPos, prevented;
			for(var i = 0; i < s.total; i ++){
				if(d.tabs[i].getAttribute('data-tabed')){ continue; }
				this._addEvent(d.tabs[i], c.trigger, (function(i) {
					return function (e) {
						if(!s.enable){return;}
						that.select(i);
					}
				})(i));

				// for gesture
				if(s.touchDir) {
					touchAttr = s.touchDir == 'v' ? 'pageY' : 'pageX';
					ckTouchAttr = s.touchDir == 'v' ? 'pageX' : 'pageY';
					this._addEvent(d.conts[i], 'touchstart', _touchstart);
					this._addEvent(d.conts[i], 'touchmove', _touchmove);
					this._addEvent(d.conts[i], 'touchend', _touchend);
				}
				d.tabs[i].setAttribute('data-tabed', i);
			}

			function _touchstart (e) {
				if(e.touches.length !== 1) { return; }
				touching = true;
				that._autoPlay && clearInterval(that._autoPlay);
				startPos = e.touches[0][touchAttr];
				ckStartPos = e.touches[0][ckTouchAttr];
			}
			function _touchmove (e) {
				var touchItv, ckTouchItv, toIdx;
				if(e.touches.length !== 1 || selectChanged) { return; }
				touchItv = e.touches[0][touchAttr] - startPos;
				if(!prevented){
					ckTouchItv = e.touches[0][ckTouchAttr] - ckStartPos;
					if(Math.abs(touchItv) > (Math.abs(ckTouchItv) * 10)){
						prevented = true;
					}
				}
				prevented && e.preventDefault();
				if(Math.abs(touchItv) > 50){
					if(touchItv > 0){
						toIdx = (s.curIdx - 1 < 0 ? (s.total - 1) : (s.curIdx - 1));
					}
					else{
						toIdx = (s.curIdx + 1 == s.total ? 0 : (s.curIdx + 1));
					}
					that.select(toIdx);
					selectChanged = true;
				}
			}
			function _touchend (e) {
				// that.select()
				startPos = ckStartPos = null;
				prevented = false;
				selectChanged = touching = false;
				s.auto && that.autoPlay(s.auto);
			}
		},
		_launch: function () {
			var c = this.conf,
				d = this.doms,
				s = this.states;

			if (!isNaN(c.startOn)) {
				this.select(c.startOn);
			}

			c.onRender && c.onRender.call(this);

			if (c.auto) {
				this.autoPlay(c.auto);
			}
		},
		add: function (tabEle, contEle) {
			var c = this.conf, d = this.doms, s = this.states;
			if(typeof tabEle == 'string'){ tabEle = this._id(tabEle); }
			if(typeof contEle == 'string'){ contEle = this._id(contEle); }
			d.tabs.push(tabEle);
			d.conts.push(contEle);
			s.total ++;
			this._initEvents();
		},
		order: function(orderList) {},
		prev: function () {
			var that = this,
				c = this.conf, d = this.doms, s = this.states;
			if(s.curIdx == 0){
				this.select(s.total - 1);
			}
			else{
				this.select(s.curIdx - 1);
			}
		},
		next: function () {
			var that = this,
				c = this.conf, d = this.doms, s = this.states;
			if(s.curIdx == s.total - 1){
				this.select(0);
			}
			else{
				this.select(s.curIdx + 1);
			}
		},
		select: function (i, once) {
			var that = this,
				c = this.conf, d = this.doms, s = this.states;
			if(i == s.curIdx){ return; }
			if(!s.enable){return;}
			if(i < 0 || i > s.total - 1){
				throw new Error('所切换的选项卡不存在');
				return;
			}
			this._selectTimeout && clearTimeout(this._selectTimeout);
			this._selectTimeout = setTimeout(function () {
				c.onBefore && c.onBefore.call(that, i);
				that._autoPlay && clearInterval(that._autoPlay);
				// custom switch function
				if(c.customSelect && typeof c.customSelect === 'function'){
					for(var j = 0; j < s.total; j ++){
						if(i == j){
							that._addClass(d.tabs[i], c.selected);
						}
						else{
							that._removeClass(d.tabs[j], c.selected);
						}
					}
					c.customSelect.call(that, i);
				}
				else{
					for(var j = 0; j < s.total; j ++){
						if(i == j){
							that._addClass(d.tabs[i], c.selected);
							d.conts[i].style.display = '';
						}
						else{
							that._removeClass(d.tabs[j], c.selected);
							d.conts[j].style.display = 'none';
						}
					}
				}
				s.curIdx = i;
				s.auto && that.autoPlay(s.auto);
				c.onAfter && c.onAfter.call(that, i);
				once && once.call(that);
			}, 50);
		},
		autoPlay: function (auto) {
			var that = this,
				c = this.conf, d = this.doms, s = this.states,
				itvSeconds = auto ? (isNaN(auto) ? 5000 : auto * 1000) : false;
			this._autoPlay && clearInterval(this._autoPlay);
			if(itvSeconds){
				this._autoPlay = setInterval(function () {
					if(s.curIdx == s.total - 1){
						that.select(0);
					}
					else{
						that.select(s.curIdx + 1);
					}
				}, itvSeconds);
			}
			s.auto = auto;
		},
		enable : function (isEnbale) {
			this.states.enable = !!isEnbale;
		}
	};
	return init;
}();