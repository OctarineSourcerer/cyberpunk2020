# cyberpunk2020
R. Talsorian Games' [Cyberpunk 2020](https://talsorianstore.com/products/cyberpunk-2020) system, but for FoundryVTT. Time to get chromed, and frag some slags.

This is an early work, and so I warn you: please don't use this for games yet! Not everything is here yet, and what IS here is subject to rapid, unwarned, and unmigrating changes for now. Here's a glimpse of some things I hope to achieve with this:

* A character sheet, with damage tracking, gear, searchable skills, and cyberware.
  * I'll consider it a bonus point if I can get cyberware working with Active Effects, but no promises, cos I have no idea how to implement that framework yet.
* Consistent design reminiscent of the Core Rulebook, with UI design and user experience taken into heavy consideration.
* Stopping power tracked for armor.
* Automated attacks for weapons. Ammo expenditure and reloads easily doable from chat messages.
* Attack hit roll automatically translated to the name of the hit location.

I aim to, at first, do these things in a style akin to the original style of the book; more modern/neon/decklike styles may be considered later.

All rights to Cyberpunk 2020 lie with R. Talsorian games. I don't intend to infringe on this and so, if not given express permission, I'm not likely to make compendiums with game content as part of this module.

Sheet currently looks like this:

![image](https://user-images.githubusercontent.com/6842867/106651313-e6161b00-658b-11eb-9595-d4469b425718.png)

Current progress (not a full list, but what comes to mind as I write): 
* Skills: usable. swap between chipped and stat values, roll skill checks, search skills.
  * Yet to come: Option for choosing how to sort skills by default. Alphabetically (with optional non-0 skills first), and by-stat.
* Stats: Visually there, editable, with both base and temp mod.
  * Yet to come: Click 'em to roll 'em. Be affected by wound tracker. UI-consistent way of viewing cyberware stat mods IF I get to those.
* Gear: List style is sorted. It'll list any *weapons* you drag on currently, and let you edit those, as well as roll with them (well, the very barebones rolls). 
  * Yet to come: List all items by type. Add button maybe? Cyberware. Cyberware will have no effects while I get the rest of the system sorted, though it'd be great.
* Item sheets: A VERY barebones sheet is in place for weapons only.
  * Yet to come: Generic item sheet. Should be easy enough, as weapons are most complex. Armor & cyberware sheets.
* Combat tab: Yet To Come as a whole
  * Should provide easy access to all the things you need during combat, in one place
* Weapon rolls: Very basic attack-only at the moment
  * This one is a HUGE one; cyberpunk's weapons are certainly something. I plan to get to it, honest - look at `lookups.js` if you want a hint.
* Netrunning: Please dear gods, I've not used it in a campaign so it's a little far down my list
* Mech sheet: Yes this will come Ste, likely after Okay Weapon Rolls and the combat tab.

Happy to take any feedback; feel free to add issues or to make a PR :)