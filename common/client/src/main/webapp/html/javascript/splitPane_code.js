/*
 * Define panes for the split panes, created using jQuery-ui-layout and handle their events.
 * @author: Ajit Singh.
 */
var myLayout;

$(document).ready(function () {
    // myLayout= $('body').layout(); -- syntax with No Options
    myLayout= $('body').layout({
        //      reference only - these options are NOT required because 'true' is the default
		closable: true,
                resizable: true/*false*/,
                slidable: true, // when closed, pane can 'slide' open over other panes - closes on mouse-out
		livePaneResizing: true,

                // some resizing/toggling settings
   	        north__initClosed: true,
//	        north__initHidden: true,
//		north__slidable: false,	// OVERRIDE the pane-default of 'slidable=true'
//		north__togglerLength_closed: '50%', //'100%', // toggle-button is full-width of resizer-bar
//		north__spacing_closed: 20, // resizer-bar size when closed (20= big resizer bar) (default: zero height)
		north__maxSize: 0.2, // 20% of layout width
                // Allow pane to slide open with a click anywhere on its resizer bar.
                north__slideTrigger_open: "click", // click, dblclick or mouseenter 
                // Close the pane only with a click anywhere on its resizer bar and not with a mouseout event.
                north__slideTrigger_close: "click", // click or mouseleave 
                /* When a pane opens, have it slide open (overlay) instead of just opening (because 
                 * just opening a pane resizes the pane adjacent to it. */
                north__onopen_start: function (pane, $Pane) {
                 $Pane.data("parentLayout").slideOpen("north"); 
                 return false; // cancel: open("north")
                },

//		south__resizable: false, // OVERRIDE the pane-default of 'resizable=true'
   	        south__initClosed: true,
//	        south__initHidden: true,
//		south__spacing_open: 0, // no resizer-bar when open (zero height)
//		south__spacing_closed: 20, // resizer-bar when closed (20= big resizer bar) (default: zero height)
                south__size: 25,
		south__minSize: 25,
		south__maxSize: 0.03, // 3% of layout width
                // Allow pane to slide open with a click anywhere on its resizer bar.
                south__slideTrigger_open: "click", // click, dblclick or mouseenter 
                // Close the pane only with a click anywhere on its resizer bar and not with a mouseout event.
                south__slideTrigger_close: "click", // click or mouseleave 
                /* When a pane opens, have it slide open (overlay) instead of just opening (because 
                 * just opening a pane resizes the pane adjacent to it. */
                south__onopen_start: function (pane, $Pane) {
                 $Pane.data("parentLayout").slideOpen("south"); 
                 return false; // cancel: open("south")
                },

		// some pane-size settings
   	        east__initClosed: true,
//	        east__initHidden: true,
                east__size: 400,
		east__minSize: 300,
		east__maxSize: 0.5, // 50% of layout width
                // Allow pane to slide open with a click anywhere on its resizer bar.
                east__slideTrigger_open: "click", // click, dblclick or mouseenter 
                // Close the pane only with a click anywhere on its resizer bar and not with a mouseout event.
                east__slideTrigger_close: "click", // click or mouseleave 
                /* When a pane opens, have it slide open (overlay) instead of just opening (because 
                 * just opening a pane resizes the pane adjacent to it. */
                east__onopen_start: function (pane, $Pane) {
                 $Pane.data("parentLayout").slideOpen("east"); 
                 return false; // cancel: open("east")
                },

                center__minWidth: 600, //800 // min. width for the center pane.
//		center__resizable: false, // OVERRIDE the pane-default of 'resizable=true'

		showDebugMessages: true // log and/or display messages from debugging & testing code
               });

    // add event to the 'Close' button in the Item Info. pane dynamically.
    myLayout.bindButton('#btnCloseItemInfoPane', 'close', 'east');
    // Also, add event to the 'Show' button in the Center pane dynamically.
//  myLayout.bindButton('#showItemInfoPane', 'open', 'east');

    // Customise the event handling for clicking the Toggler buttons on the North, East & South panes.
    var northToggler= myLayout.togglers.north;
    var eastToggler= myLayout.togglers.east;
    var southToggler= myLayout.togglers.south;
    // Unbind the panes' Toggler button's default click functionality to prevent adjacent panes from resizing.
    northToggler.unbind("click");
    eastToggler.unbind("click");
    southToggler.unbind("click");

    /*
     * DISABLE TEXT-SELECTION WHEN DRAGGING (or even trying to drag.)
     * this functionality will be included in RC30.80
     */
    $.layout.disableTextSelection= function(){
      var $d= $(document), 
              s= 'textSelectionDisabled', x= 'textSelectionInitialized';

      if($.fn.disableSelection) {
         if (!$d.data(x)) // document hasn't been initialized yet
             $d.on('mouseup', $.layout.enableTextSelection ).data(x, true);
         if (!$d.data(s))
             $d.disableSelection().data(s, true);
        }
      //console.log('$.layout.disableTextSelection');
    };

    $.layout.enableTextSelection= function() {
     var $d= $(document), s= 'textSelectionDisabled';
     if($.fn.enableSelection && $d.data(s))
        $d.enableSelection().data(s, false);
     //console.log('$.layout.enableTextSelection');
    };

    $(".ui-layout-resizer")
        .disableSelection() // affects only the resizer element
	.on('mousedown', $.layout.disableTextSelection ); // affects entire document
});
