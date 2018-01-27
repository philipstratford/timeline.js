var timelineData = new Array();

        var eventLabel = [
            "Club founded",
	    "First match",
	    "First Football League match",
            "Promotion to First Division"
	];

        var eventDate = [
            "1892-06-03",
	    "1892-09-03",
	    "1893-09-02",
	    "1894-04-28"
	];

        var eventDetail = [
            "On March 15, 1892, John Houlding famously broke from the board of Everton to form a new club - Liverpool FC. The club was formally recognised by the Board of Trade on June 3, making it our official birthday.",
	    "Higher Walton are the opposition as Liverpool play their first competitive match - an 8-0 victory!",
	    "Liverpool play their first ever Football League game against Middlesbrough Ironopolis.",
	    "Liverpool win promotion to the First Division at the first attempt."
	];

        for (i = 0; i < eventDate.length; i++) {
            var nodeData = {};
            nodeData["eventLabel"] = eventLabel[i];
            nodeData["eventDate"] = eventDate[i];
            nodeData["eventDetail"] = eventDetail[i];

            timelineData[i] = nodeData;
        };