class BarSelector extends MovieClip {


	public var parentObj:Object;		// the parent object
	public var units:String; 			// the units of the selector
	public var lengthInUnits:Number;	// the length of the selector in appropriate units
	public var isVisible:Boolean;		// is the selector visible or not
	public var isSet:Boolean;			// has the selector been moved to select a region
	public var width:Number;
	public var height:Number;
	public var topArrow:MovieClip;
	public var bottomArrow:MovieClip;
	public var regionClip:MovieClip;	// a generic clip to define the region selecte
	
	public var borderColor:Number = 0xdddddd;		// color of the selector border
	public var barBgColor:Number = 0xFFFFFF;		// color of the selector background
	public var barColor:Number = 0xdddddd;			// color of the bar itself


	public var startPosition:Number;
	public var endPosition:Number;

	// Constructor function called by parent object
	// returns a BarSelector object to the parent

	public static function createBarSelector(target:MovieClip, depth:Number, x:Number, y:Number, width:Number, height:Number, id:String, length:Number):BarSelector {

		//trace("CreateBar called...");

		var barSelector:BarSelector = BarSelector(target.attachMovie("BarSelector","BarSelector_" + id + "_" + depth,depth));
		barSelector.init(target, x, y, width, height,length);
		return barSelector;


	}
	
	// Initialization function called by constructor
	
	public function init(target:MovieClip, x:Number, y:Number, width:Number, height:Number, length:Number):Void {

		//trace("Init called...");
		
		this.parentObj = target;
		this._x = x;
		this._y = y;
		this.width = width;
		this.height = height;
		this.lengthInUnits = length;
		
		this.regionClip = createEmptyMovieClip("regionClip", this.getNextHighestDepth());
		//this.regionClip._visible = false; // hide it initially
		this.regionClip._x = 0;
		this.regionClip._y = 0;
		this.regionClip.width = width;
		this.regionClip.height = height;
		
		this.regionClip.onPress = function() {
		
			var startLoc:Number = Math.round((this._parent.lengthInUnits/this._parent.height)*this._y);
			var endLoc:Number = Math.round((this._parent.lengthInUnits/this._parent.height)*(this.height+this._y));
			// trace("Region start pos: " + startLoc + " bp, end pos: " + endLoc + " bp");
			
			if (Key.isDown(Key.SHIFT)) {
				trace("Clearing regionClip")
				this._x = 0;
				this._y = 0;
				this.width = _parent.width;
				this.height = _parent.height;
				this.clear();
				
				// move to the top and bottom ends and hide sliders
				this._parent.topArrow._y = 0;
				this._parent.bottomArrow._y = _parent.height;
				this._parent.topArrow.scale._visible = false;
				this._parent.bottomArrow.scale._visible = false;
			}
			else {
			
				// if there is a Browser URL defined in the main timeline (ie from the Flashvars)
				// then link out to the browser
				if(_root.browserURL) {
					var browserUrl:String = _root.browserURL + _parent._parent.chromosome + ":" + startLoc + ".." + endLoc;
					// trace("Link out to " + browserUrl);
					getURL(browserUrl, "_blank");
				}
				else {
					_root.featureInfo.text = "Sorry - no external link configured for region"
				}
			}
		}
		
		this.regionClip.onRollOver = function() {
			this._parent.topArrow.scale._alpha = 0;
			this._parent.topArrow.scale.location._visible = false;
			this._parent.topArrow.scale._visible = true;
			
			this._parent.bottomArrow.scale._alpha = 0;
			this._parent.bottomArrow.scale.location._visible = false;
			this._parent.bottomArrow.scale._visible = true;
			
			this._parent.drawRegion(0x86EE8A);
			
			this.onEnterFrame = function() {
				// fade in
				if (this._parent.topArrow.scale._alpha < 100) {
					this._parent.topArrow.scale._alpha += 5;
					this._parent.bottomArrow.scale._alpha += 5;
				}
				else {
					this._parent.topArrow.scale._alpha = 100;
					this._parent.bottomArrow.scale._alpha = 100;
					this._parent.topArrow.scale.location._visible = true;
					this._parent.bottomArrow.scale.location._visible = true;
					delete this.onEnterFrame;
				}
				updateAfterEvent();
			}
		
		}
		
		this.regionClip.onRollOut = function() {
			this._parent.drawRegion();
			this._parent.topArrow.scale._visible = false;
			this._parent.bottomArrow.scale._visible = false;
		
		}
		
		this.regionClip.onRelease = function() {
		
		
		}
		
		this.drawBarSelector();
		
		var init:Object = new Object();
		
		init.onRollOver = function() {
  			Mouse.hide();
  			this.attachMovie("slider_cursor_mc", "slider_cursor_mc", this.getNextHighestDepth(), {_x:this._xmouse, _y:this._ymouse});
  			this.slider_cursor_mc._xscale = 50;
  			this.slider_cursor_mc._yscale = 50;
  			
		};
		
		/*
		init.onMouseMove = function() {
  			this.slider_cursor_mc._x = this._xmouse;
  			this.slider_cursor_mc._y = this._ymouse;
		};
		*/
		
		init.onRollOut = function() {
 			 Mouse.show();
 			 this.slider_cursor_mc.removeMovieClip();
		};
		
		
		init._x = 0;
		init._y = 0;
		
		init.onPress = function() {
			this.startDrag();
			this.scale._visible = true;
		}
		
		init.onRelease = function() {
			this._x = 0;
			this.stopDrag();
			this.scale._visible = false;
			if(this._y < 0) {
				this._y = 0;
			}
			if(this._y > _parent.height) {
				this._y = _parent.height;
			}
			 _parent.drawRegion();
		}
		
		init.onReleaseOutside = function() {
			this.onRelease();
		}
		
		init.onMouseMove = function() {
			
			this._x = 0;
			this._xmouse = 0;
			this.scale.location.text = Math.round((_parent.lengthInUnits/_parent.height)*(this._y));
			if(this._y < 0) {
				this._y = 0;
			}
			if(this._y > _parent.height) {
				this._y = _parent.height;
			}
			
			this.slider_cursor_mc._x = this._xmouse;
  			this.slider_cursor_mc._y = this._ymouse;
  			
			updateAfterEvent();
		}
		
		
		this.attachMovie("TopArrow","topArrow", this.getNextHighestDepth(), init);
		this.topArrow.scale._visible = false;
		
		init._y = this.height;
		this.attachMovie("TopArrow","bottomArrow", this.getNextHighestDepth(), init);
		this.bottomArrow.scale._visible = false;


		
	}


	
	public function drawBarSelector():Void {
	
		// trace("Drawing bar...");
	
		this.lineStyle(0, borderColor, 100);
		this.beginFill(barBgColor,30);
		this.moveTo(0,0);
		this.lineTo(this.width,0);
		this.lineTo(this.width,this.height);
		this.lineTo(0,this.height);
		this.lineTo(0,0);
		this.endFill();
	
	
	
	}
	
	public function clearRegion(starty,endy) {
	
		this.beginFill(barBgColor,100);
		this.moveTo(0,starty);
		this.lineTo(this.width,starty);
		this.lineTo(this.width,endy);
		this.lineTo(0,endy);
		this.lineTo(0,starty);
		this.endFill();
		updateAfterEvent();
	}
	
	
	
	// Redraws the selected region based on the position of the
	// top and bottom arrows
	public function drawRegion(newColor:Number) {
	
		// option to pass in bar color, if no color
		// default to the defined bar color
		if(!newColor) {
			newColor = barColor;	
		}
	
		// clearRegion(0,this.height);
		this.regionClip.clear();
		var starty:Number = topArrow._y;
		var endy:Number = bottomArrow._y;
		
		// swap over
		if(starty > endy) {
			endy = topArrow._y;
			starty = bottomArrow._y;
		}
		

		var startLoc:Number;
		var endLoc:Number;
		
		// only draw the new bar if the markers arent
		// all the way at the end... what if they want all the chromosome?
		if(starty != 0 || endy != this.height) {
			
			
			this.regionClip._y = starty;
			this.regionClip.height = (endy-starty);
			this.regionClip.beginFill(newColor,100);
			this.regionClip.moveTo(0,0);
			this.regionClip.lineTo(this.regionClip.width,0);
			this.regionClip.lineTo(this.regionClip.width,this.regionClip.height);
			this.regionClip.lineTo(0,this.regionClip.height);
			this.regionClip.lineTo(0,0);
			this.regionClip.regionClip.endFill();
					updateAfterEvent();
			startLoc = (this.lengthInUnits/this.height)*starty;
			endLoc = (this.lengthInUnits/this.height)*endy;
			//trace("start pos: " + startLoc + " bp, end pos: " + endLoc + " bp");
			//trace("region: h" + this.regionClip.height + ", y: " + this.regionClip._y);
		}
	}

}