//Requires moment.js and jQuery

(function ($) {

    $.fn.timeline = function (options) {

        // This is the easiest way to have default options.
        var settings = $.extend({
            data: new Array(),
            dateFormat: "YYYY-MM-DD",
            eventLabelMargin: 10,
            eventLabelStyle: "",
            eventMarkerWidthDefault: 10,
            eventMarkerStyle: "",
            eventOrder: "desc",
            labelPosition: "left",
            nodeBorderWidth: 5,
            nodeHeight: 20,
            nodeStyle: "",
            nodeWidth: 20,            
            nodeLabelMargin: 10,
            nodeLabelStyle: "",
            nodeLabelFontSize: 20,            
            onEventLabelClick: function () { },
            onZoomIn: function () { },
            onZoomOut: function () { },
            onZoomReset: function () { },
            resetZoomButton: true,
            scale: 1,
            timelineStyle: "",
            timelineWidth: 1,
            zoomButtons: true,            
            zoomButtonStyle: "",
            zoomInButtonText: "+",            
            zoomIncrement: 0.3,
            zoomOutButtonText: "-",
            zoomResetButtonText: "0"
        }, options);

        var $this = this;
        $this.css({ "position": "relative" });
        var zoomLevel = 0;
        var unit = "px";

        var eventCount = settings.data.length;
        var eventLabelCursor = "pointer";
        var timelineTargetContainerId = this.attr("id");
        var timelineTargetContainerPadding = {
            top: parseInt(this.css("padding-top")),
            right: parseInt(this.css("padding-right")),
            bottom: parseInt(this.css("padding-bottom")),
            left: parseInt(this.css("padding-left"))
        };

        if (typeof settings.onEventLabelClick !== "function") {
            console.log("The value of onEventLabelClick variable is not a valid function.")
            settings.onEventLabelClick = "";
            eventLabelCursor = "default";            
        };

        if (typeof settings.onZoomIn !== "function") {
            console.log("The value of onZoomIn variable is not a valid function.")
            settings.onZoomIn = "";
        };

        if (typeof settings.onZoomOut !== "function") {
            console.log("The value of onZoomOut variable is not a valid function.")
            settings.onZoomOut = "";
        };

        if (typeof settings.onZoomReset !== "function") {
            console.log("The value of onZoomReset variable is not a valid function.")
            settings.onZoomOut = "";
        };

        //Sort the array of events by chronologically
        settings.data = settings.data.sort(function (a, b) {
            var sortOrder;
            if (settings.eventOrder == "desc") {
                sortOrder = new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
            } else if (settings.eventOrder == "asc") {
                sortOrder = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
            };
            return sortOrder;
        });

        //Add a 'year' property to each event, holding just the year for that event
        for (e = 0; e < eventCount; e++) {
            var year = moment(settings.data[e].eventDate, settings.dateFormat).year(); //Get the year from the event Date
            settings.data[e].year = year; //Add an extra value to the object in the array with just the year, for future reference
        };

        //Create an array of years containing all years between the earliest and latest events inclusively
        var years = new Array();        
        if (settings.eventOrder == "desc") {
            var lastYear = moment(settings.data[0].eventDate, settings.dateFormat).year(); //Get the year from the latest event's Date
            var firstYear = moment(settings.data[eventCount - 1].eventDate, settings.dateFormat).year(); //Get the year from the earliest event's Date
            years.push(lastYear + 1); //Add the year after latest event's year to the Years array - the top of the timeline will always be in the future
            years.push(lastYear); //Add the latest event's year to the Years array
            var year = lastYear;
            do { //Decrement the year by one and add it to the Years array until every year between the most recent and earliest event has been added
                year = year - 1;
                years.push(year);
            }
            while (year > firstYear);
        } else if (settings.eventOrder == "asc") {
            var lastYear = moment(settings.data[eventCount - 1].eventDate, settings.dateFormat).year(); //Get the year from the latest event's Date
            var firstYear = moment(settings.data[0].eventDate, settings.dateFormat).year(); //Get the year from the earliest event's Date
            years.push(firstYear); //Add the year after latest event's year to the Years array - the top of the timeline will always be in the future
            var year = firstYear;
            do { //Decrement the year by one and add it to the Years array until every year between the most recent and earliest event has been added
                year = year + 1;
                years.push(year);
            }
            while (year < lastYear + 1);
        };

        
       
        //Set the text alignment of the labels depending on the position specified for the labels relative to the nodes
        var labelTextAlignment = "left";
        if (settings.labelPosition == "left") {
            labelTextAlignment = "right";
        } else if (settings.labelPosition == "right") {
            labelTextAlignment = "left";
        }


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Create a generic node
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        var $nodeAndLabel = $("<div></div>").addClass("node-and-label"); //This class can be removed when testing is finished. It's not doing anything except being used as a jQuery selector by test code
        var $node = $("<div></div");
        var $nodeLabel = $("<a></a>");

        $nodeAndLabel.css({
            "display": "flex"
        });

        $node.css({
            "width": settings.nodeWidth,
            "height": settings.nodeHeight,
            "border-width": settings.nodeBorderWidth
        }).addClass("node " + settings.nodeStyle);

        $nodeLabel.css({
            "padding-left": settings.nodeLabelMargin,
            "padding-right": settings.nodeLabelMargin,
            "text-align": labelTextAlignment,
            "overflow": "hidden",
            "max-height": settings.nodeHeight + (settings.nodeBorderWidth),
            "flex-grow": "1",
            "positon": "relative",
            "z-index": "1",
            "font-size": settings.nodeLabelFontSize + "px",
            "padding-top": (settings.nodeHeight + settings.nodeBorderWidth - settings.nodeLabelFontSize) / 2
        }).addClass("node-label " + settings.nodeLabelStyle);

        if (settings.labelPosition == "left") {
            $nodeAndLabel.append($nodeLabel, $node);
        } else if (settings.labelPosition == "right") {
            $nodeAndLabel.append($node, $nodeLabel);
        };
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////



        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Create a generic section of timeline line, used for the line between the last event rendered each year (the first event that year, because the timeline is rendered in reverse chronological order) and the next year node
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        var $line = $("<div></div>").addClass("main-timeline " + settings.timelineStyle);

        $line.css({
            "width": "0"
        });

        if (settings.labelPosition == "left") {
            $line.css({
                //Set the left margin of the timeline to be the full width of the parent less half the width of the nodes less the width of the node border less the border width of the timeline itself
                "margin-left": "calc(100% - " + String(settings.nodeWidth / 2) + unit + " - " + String(settings.timelineWidth) + unit + " - " + String(settings.nodeBorderWidth) + unit + ")",
                "border-left": "none", //Removing one of the borders, in case both left and right have been specified in CSS
                "border-right-width": settings.timelineWidth + unit, //This needs to be specified in settings as it's used in calculations. Values specified in CSS will be ignored.
            });
        } else if (settings.labelPosition == "right") {
            $line.css({
                "margin-left": (settings.nodeWidth / 2) + settings.nodeBorderWidth,
                "border-right": "none", //Removing one of the borders, in case both left and right have been specified in CSS
                "border-left-width": settings.timelineWidth + unit, //This needs to be specified in settings as it's used in calculations. Values specified in CSS will be ignored.
            });
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Create a generic event, consisting of the vertical timeline down to the event and the horizontal marker out to the event
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        var $eventContainer = $("<div></div>").addClass("event-container"); //This class can be removed when testing is finished
        var $event = $("<div></div>").addClass("event"); //This class can be removed when testing is finished
        var $eventLine = $("<div></div>");
        var $eventLabel = $("<div></div>");

        $eventContainer.css({
            "display": "flex",
            "flex-direction": "column",
            "z-index": "2"
        });

        $event.css({
            "position": "relative",
            "flow-grow": "1"
        })

        $eventLine.css({
            "width": settings.eventMarkerWidthDefault,
            "border-width": settings.timelineWidth,
            "border-bottom-left-radius": 0, //Just in case someone specifies this in CSS!
            "border-bottom-right-radius": 0 //Just in case someone specifies this in CSS!
        }).addClass("main-timeline " + settings.timelineStyle).addClass("event-marker " + settings.eventMarkerStyle);

        $eventLabel.css({
            "padding-left": settings.eventLabelMargin,
            "padding-right": settings.eventLabelMargin,
            "position": "absolute",
            "top": "0",
            "text-align": labelTextAlignment,
            "cursor": eventLabelCursor,
            "width": "0", //This gets overridden once everything has been rendered
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap"
        }).addClass("event-label " + settings.eventLabelStyle);

        //Set properties according to the label positioning specificed in the settings
        if (settings.labelPosition == "left") {
            $eventContainer.css({
                "align-items": "flex-end"
            });
            $eventLine.css({
                "border-left": "none",
                "margin-right": (settings.nodeWidth / 2) + settings.nodeBorderWidth
            });
            $eventLabel.css({
                "right": "100%"
            });

            $event.append($eventLabel, $eventLine);

        } else if (settings.labelPosition == "right") {
            $eventContainer.css({
                "align-items": "flex-start"
            });
            $eventLine.css({
                "border-right": "none",
                "margin-left": (settings.nodeWidth / 2) + settings.nodeBorderWidth
            });
            $eventLabel.css({                
                "left":"100%"
            });

            $event.append($eventLine, $eventLabel);
        }

        
        $eventContainer.append($event);
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////



        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        //This is the main section for generating the timeline
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (settings.eventOrder == "desc") {
            for (y = 0; y < years.length; y++) {
                var mFirstMomentThisYear = moment(String(years[y] - 1) + "-12-31", "YYYY-MM-DD"); //A variable holding the last second of the year
                var mLastEventEnd = mFirstMomentThisYear //At the start of the iteration for each year, the last event added is the Group node for that year

                var $thisYear = $("<div style='position:relative'></div>");

                //Create a div containing a node           
                $thisNodeAndLabel = $nodeAndLabel.clone();
                $(".node-label", $thisNodeAndLabel).html(years[y]).attr("id", timelineTargetContainerId + years[y]);

                //$thisNode.append($nodeLabel);
                $thisYear.append($thisNodeAndLabel);

                //Create an array of events for the year BEFORE the year in this iteration (because we're always adding events below the current node, at least for as long as the timeline is in descending order)
                var eventsThisYear = settings.data.filter(function (event) {
                    return event["year"] === years[y] - 1;
                });

                //Add the events in the eventsThisYear array to the timeline
                for (e = 0; e < eventsThisYear.length; e++) {
                    var mThisEventDate = moment(eventsThisYear[e].eventDate); //Get the date of the current event
                    var daysSinceLastEvent = Math.abs(mLastEventEnd.diff(mThisEventDate, "days")) //Get the number of days until the next date or the next Group node (the last event/node to have been added to the timeline)                
                    $thisEvent = $eventContainer.clone();
                    var thisEventHeight = daysSinceLastEvent * settings.scale
                    $(".main-timeline", $thisEvent).height(thisEventHeight); //Set the height of the event to the number of days since the last event that was added, at least while 1 day = 1px
                    $(".main-timeline", $thisEvent).data("originalHeight", thisEventHeight); //Store the event's original height in its data to be used when zooming
                    mLastEventEnd = mThisEventDate; //Update the date of the last event added to the date of this event, which is now the last one to have been added!
                    $(".event-label", $thisEvent).html(eventsThisYear[e].eventLabel).offset({ top: (daysSinceLastEvent * settings.scale) }); //Populate the event label and offset its top by the same distance as the height of the event, so it's aligned with the bottom of its marker
                    $(".event-label", $thisEvent).prop("title", moment(eventsThisYear[e].eventDate).format("dddd, MMMM Do YYYY")); //Populate the title attribute of the event with the date
                    $(".event-label", $thisEvent).data("event", eventsThisYear[e]); //Store the event's data in the DOM element's data               
                    $thisYear.append($thisEvent);
                };

                //Create a line which will fill the gap between the last event added and the next node which will be added in the next year iteration, unless this is the last year in the array
                if (y < years.length - 1) {
                    $thisNodeLine = $line.clone();
                    var remainingLineHeight = Math.abs(mLastEventEnd.diff(moment(mFirstMomentThisYear).subtract(1, "years"), "days")); //Calculate the number of days from the last rendered event/node to the start of the year which will be rendered in the next year iteration
                    $thisNodeLine.data("originalHeight", remainingLineHeight); //Store the line's original height in its data to be used when zooming
                    $thisNodeLine.height(remainingLineHeight * settings.scale); //Set the line's height to the number of days from the last event added to the start of the year
                    $thisYear.append($thisNodeLine);
                };

                $this.append($thisYear);
            };
        } else if (settings.eventOrder == "asc") {
            for (y = 0; y < years.length; y++) {
                var mFirstMomentThisYear = moment(String(years[y]) + "-01-01", "YYYY-MM-DD"); //A variable holding the last second of the year
                var mLastEventEnd = mFirstMomentThisYear //At the start of the iteration for each year, the last event added is the Group node for that year

                var $thisYear = $("<div style='position:relative'></div>");

                //Create a div containing a node           
                $thisNodeAndLabel = $nodeAndLabel.clone();
                $(".node-label", $thisNodeAndLabel).html(years[y]).attr("id", timelineTargetContainerId + years[y]);

                //$thisNode.append($nodeLabel);
                $thisYear.append($thisNodeAndLabel);

                //Create an array of events for the year in this iteration
                var eventsThisYear = settings.data.filter(function (event) {
                    return event["year"] === years[y];
                });

                //Add the events in the eventsThisYear array to the timeline
                for (e = 0; e < eventsThisYear.length; e++) {
                    var mThisEventDate = moment(eventsThisYear[e].eventDate); //Get the date of the current event
                    var daysSinceLastEvent = Math.abs(mLastEventEnd.diff(mThisEventDate, "days")) //Get the number of days until the next date or the next Group node (the last event/node to have been added to the timeline)                
                    $thisEvent = $eventContainer.clone();
                    var thisEventHeight = daysSinceLastEvent * settings.scale
                    $(".main-timeline", $thisEvent).height(thisEventHeight); //Set the height of the event to the number of days since the last event that was added, at least while 1 day = 1px
                    $(".main-timeline", $thisEvent).data("originalHeight", thisEventHeight); //Store the event's original height in its data to be used when zooming
                    mLastEventEnd = mThisEventDate; //Update the date of the last event added to the date of this event, which is now the last one to have been added!
                    $(".event-label", $thisEvent).html(eventsThisYear[e].eventLabel).offset({ top: (daysSinceLastEvent * settings.scale) }); //Populate the event label and offset its top by the same distance as the height of the event, so it's aligned with the bottom of its marker
                    $(".event-label", $thisEvent).prop("title", moment(eventsThisYear[e].eventDate).format("dddd, MMMM Do YYYY")); //Populate the title attribute of the event with the date
                    $(".event-label", $thisEvent).data("event", eventsThisYear[e]); //Store the event's data in the DOM element's data               
                    $thisYear.append($thisEvent);
                };

                //Create a line which will fill the gap between the last event added and the next node which will be added in the next year iteration, unless this is the last year in the array
                if (y < years.length - 1) {
                    $thisNodeLine = $line.clone();
                    var remainingLineHeight = Math.abs(mLastEventEnd.diff(moment(mFirstMomentThisYear).add(1, "years"), "days")); //Calculate the number of days from the last rendered event/node to the start of the year which will be rendered in the next year iteration
                    $thisNodeLine.data("originalHeight", remainingLineHeight); //Store the line's original height in its data to be used when zooming
                    $thisNodeLine.height(remainingLineHeight * settings.scale); //Set the line's height to the number of days from the last event added to the start of the year
                    $thisYear.append($thisNodeLine);
                };

                $this.append($thisYear);
            };
        };
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////



        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Post-creation styling and tidying up
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Set the width of all the event labels to match that of the first (and therefore all) node label. As the node label uses flex-grow, that should make the event labels fill the avaiable width.
        //This is required because it's necessary to set the width of the event labels explicitly due to their being positioned absolutely
        $(".event-label").width($(".node-label").first().width());

        //Move all of the event labels up by half the height of the labels, so as to centre them vertically alongside the makers. This can surely be done better?
        var eventLabelTopOffset = ($(".event-label").first().height() / 2);
        $(".event-label").css("top", "-=" + eventLabelTopOffset);

        //Apply further CSS to elements
        $(".main-timeline").css({ "transition": "height .5s", "transition-timing-function": "ease-out" });
        $(".event-label").css({ "transition": "top .5s, opacity .1s", "transition-timing-function": "ease-out" });
        $(".event-label:first").addClass("active");
        $(".event-label").eq(0).on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function (e) { //Create and event handler for css transitions completing and call function to fade overlapping event labels
            fadeOverlappingLabels();            
        });        

        //Set low opacity for overlapping labels
        fadeOverlappingLabels();
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////



        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Zoom
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (settings.zoomButtons) {
            var $zoomButtons = $("<div></div>").css({ "position": "absolute", "z-index": 2, "top": 0 });

            if (settings.labelPosition == "left") {
                $zoomButtons.css("left", 0);
            } else if (settings.labelPosition == "right") {
                $zoomButtons.css("right", 0);
            };

            var $zoomOutButton = $("<button>" + settings.zoomOutButtonText + "</button>");
            $zoomOutButton.click(function () {
                zoom(-settings.zoomIncrement);
                settings.onZoomOut.call();
            });
            $zoomButtons.append($zoomOutButton);

            if (settings.resetZoomButton) {
                var $resetZoomButton = $("<button>" + settings.zoomResetButtonText + "</button>");
                $resetZoomButton.click(function () {
                    resetZoom();
                    settings.onZoomReset.call();
                });
                $zoomButtons.append($resetZoomButton);                
            };

            var $zoomInButton = $("<button>" + settings.zoomInButtonText + "</button>");
            $zoomInButton.click(function () {
                zoom(settings.zoomIncrement);
                settings.onZoomIn.call();
            });
            $zoomButtons.append($zoomInButton);


            $("button", $zoomButtons).addClass("zoom-button " + settings.zoomButtonStyle);
            $this.append($zoomButtons);
        };

        function zoom(zoomAmount) {
            if (zoomAmount <0) {
                zoomLevel--;
            } else {
                zoomLevel++;
            };
            var zoomAmount = Math.abs(zoomAmount);
            var zoomMultiplier = 1 / (1 - zoomAmount);
            $(".main-timeline", $this).height(function () {
                var $thisSection = $(this)
                var newHeight = $thisSection.data("originalHeight") * Math.pow(zoomMultiplier, zoomLevel);

                var newEventLabelTop = $thisSection.offset().top + newHeight - eventLabelTopOffset; //Move the event labels to the new bottom of the event line, then up by half the height of the label so it's centered against the marker
                if (settings.labelPosition == "left") {
                    $thisSection.prev(".event-label").offset({ top: newEventLabelTop });
                } else if (settings.labelPosition == "right") {
                    $thisSection.next(".event-label").offset({ top: newEventLabelTop });
                };                    
                return newHeight;
            });
        };

        function resetZoom() {
            zoomLevel = 0;
            zoom(0);
        };
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////



        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Handle overlapping Event Labels
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        function fadeOverlappingLabels() {            
            var lastBottom = 0;
            var eventLabelFontSizeRaw = $(".event-label").eq(0).css("font-size"); //Get the font size of the first (and thus all) label
            var eventLabelFontSize = Math.floor(parseInt(eventLabelFontSizeRaw.replace('px', ''))); //Convert the font size to a number

            $(".event-label", $this).each(function () {
                var $thisLabel = $(this);
                if ($thisLabel.offset().top < lastBottom - (eventLabelFontSize * 0.3)) { //Allow the labels to overlap by 20% of the font height (30% of line height, assuming standard of 1.5), which seems to work well
                    $thisLabel.css("opacity", "0.1");
                } else {
                    $thisLabel.css("opacity", "1");
                };
                lastBottom = $thisLabel.offset().top + $thisLabel.height();
            });

            console.log($(".main-timeline").eq(0).height());
        };
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////



        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Callbacks
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        //onEventLabelClick
        $(".event-label", $this).click(function () {
            settings.onEventLabelClick.call(undefined, $(this).data("event"));
        })

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////



        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Methods
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Zoom
        $.fn.timeline.zoom = function(zoomAmount) {
            if (zoomAmount == undefined) zoomAmount = settings.zoomAmount; //Use the default zoom amount if one isn't specified
            zoom(zoomAmount);
        };

        //Reset Zoom
        $.fn.timeline.resetZoom = function () {
            resetZoom();
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        function round(value, decimals) {
            return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
        }
        
        $this.wrap("<div class='timeline-container'></div>");
        return $this;        
    };
}(jQuery));
