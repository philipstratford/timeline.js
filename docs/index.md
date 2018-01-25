---
layout: default
title: Timeline Home
---

# Introduction
Timeline.js is a lightweight jQuery plugin primarily intended for displaying a sequence of events in an attractive, interactive way. Whilst there are lots of Javascript libraries available for displaying events on a timeline in various formats, I couldn't find anything which did quite what I needed so I wrote timeline.js.

The project is hosted on <a href="{{ site.github.repository_url }}">GitHub</a>. It's currently in pre-release but when it's released I'll include a link to the latest version here.

# Getting Started
<div style="position: relative">
	<div id="timelineDemo"></div>
</div>

<script type="text/javascript">
    $(function () {

        var timelineData = new Array();

        var eventLabel = [
            "Archduke Assassination",
            "Russia Mobilizes",
            "World War I Begins",
            "Germans Fire",
            "Lusitania Sinks",
            "Germany Limits Submarines",
            "First Tanks",
            "Submarines Back",
            "Zimmerman Telegram",
            "Wilson for War",
            "U.S. Enters War",
            "Selective Service Act",
            "Germany and Russia Peace",
            "Battle of Cantigny",
            "Chateau-Thierry",
            "Battle of Belleau Wood",
            "Belleau Wood Ends",
            "Battle of St. Mihiel",
            "Wilhelm Abdicates",
            "Armistice Day"];

        var eventDate = [
            "1914-06-28",
            "1914-07-30",
            "1914-08-04",
            "1915-04-22",
            "1915-05-07",
            "1915-09-18",
            "1916-09-15",
            "1917-02-01",
            "1917-02-25",
            "1917-04-02",
            "1917-04-06",
            "1917-05-18",
            "1918-03-03",
            "1918-05-28",
            "1918-06-03",
            "1918-06-06",
            "1918-06-26",
            "1918-09-12",
            "1918-11-09",
            "1918-11-11"];

        var eventDetail = [
            "Archduke Franz Ferdinand is assassinated in Sarajevo. His death is the event that sparks World War I.",
            "Russia mobilizes its vast army to intervene against Austria-Hungary in favor of its ally, Serbia. This move starts a chain reaction that leads to the mobilization of the rest of the European Great Powers, and inevitably to the outbreak of hostilities.",
            "Germany invades Belgium, beginning World War I.",
            "The Germans fire shells filled with chlorine gas at Allied lines. This is the first time that large amounts of gas are used in battle, and the result is the near-collapse of the French lines. However, the Germans are unable to take advantage of the breach.",
            "A German submarine sinks the passenger liner Lusitania. The ship carries 1,198 people, 128 of them Americans.",
            "Reacting to international outrage at the sinking of the Lusitania and other neutral passenger lines, Kaiser Wilhelm suspends unrestricted submarine warfare. This is an attempt to keep the United States out of the war, but it severely hampers German efforts to prevent American supplies from reaching France and Britain.",
            "The British employ the first tanks ever used in battle, at Delville Wood. Although they are useful at breaking through barbed wire and clearing a path for the infantry, tanks are still primitive and they fail to be the decisive weapon, as their designers thought they would be.",
            "Germany resumes unrestricted submarine warfare in European waterways. This act, more than any other, draws the United States into the war and causes the eventual defeat of Germany.",
            "British intelligence gives Wilson the so-called Zimmermann Telegram, a message from German foreign secretary Arthur Zimmermann proposing that Mexico side with Germany in case of war between Germany and the United States. In return, Germany promises to return to Mexico the 'lost provinces' of Texas and much of the rest of the American Southwest. Mexico declines the offer, but the outrage at this interference in the Western Hemisphere pushes American public opinion to support entering the war.",
            "President Wilson outlines his case for war to Congress.",
            "Congress authorizes a declaration of war against Germany. The United States enters World War I on the side of France and Britain.",
            "Congress passes the Selective Service Act authorizing the draft. Although criticized for destroying democracy at home while fighting for it abroad, President Wilson claims he sees no other option and signs the bill into law.",
            "The Germans sign a peace treaty with the new Bolshevik government of Russia. The terms of the treaty give Germany huge tracts of land that had been the Ukraine and Poland, and peace on the Eastern Front allows Germany to shift soldiers to the Western Front, causing serious problems for the French, British, and Americans.",
            "The Battle of Cantigny is the first major American offensive of the war. Though small in scale, the Americans fight bravely and soon go on to larger attacks against German positions.",
            "The Americans attack the Germans at Chateau-Thierry. This battle would morph into the larger Battle of Belleau Wood.",
            "The Battle of Belleau Wood begins as the U.S. Marine Corps attacks the Germans across an open field of wheat, suffering huge casualties.",
            "The Battle of Belleau Wood ends with the final expulsion of the Germans from the wood, which marks the farthest German advance on Paris. The area has changed hands six times during the three-week battle, which has caused nearly 10,000 American casualties.",
            "The Battle of St. Mihiel begins when 300,000 American troops under the direct command of General Pershing fling themselves into the German lines.",
            "Kaiser Wilhelm abdicates, ending all German hope for a victory. He and his retinue quietly slip over the border into the Netherlands where he lives out the remainder of his life in relative peace and writes a self-promoting memoir defending his actions in the war.",
            "An Armistice is signed ending fighting on the Western Front."];

        for (i = 0; i < eventDate.length; i++) {
            var nodeData = {};
            nodeData["eventLabel"] = eventLabel[i];
            nodeData["eventDate"] = eventDate[i];
            nodeData["eventDetail"] = eventDetail[i];

            timelineData[i] = nodeData;
        };

        $("#timelineDemo").timeline({
            data: timelineData,
            labelPosition: "right",
            eventOrder: "asc",
			scale: 0.5
        });

    })

</script>