# cyberpunk2020 (for FoundryVTT)
R. Talsorian Games' [Cyberpunk 2020](https://talsorianstore.com/products/cyberpunk-2020) system, but for FoundryVTT. Time to get chromed, and frag some slags.

I believe this is now ready to reasonably run games in without anything particularly fundamental missing (minus, at the moment, custom skills).
Here's the gist of what's there so far:

* A character sheet with stats, damage tracking, gear, combat tab, searchable skills, and cyberware.
  * Cyberware does not currently affect stats - it will probably involve working with Active Effects, but no promises, as I have no idea how to implement that framework yet.
* Consistent design reminiscent of the Core Rulebook, with UI design and user experience taken into heavy consideration.
* Skills sortable by either name or stat. You can swap between chipped and not, with both being stored independently (so you can chip/unchip). Rollable.
* Stopping power and encumbrance tracked for armor.
  * SP is currently just added together for each equipped piece of armor. Proportional armor will possibly come later.
* Ranged attacks for single shots, as well as three-round burst and autofire for automatic weapons.
* Easy modifier selection when making ranged attacks.

Yet to come:
* Ammo expenditure and reloads easily doable from chat messages.
* Attack hit roll automatically translating to the name of the hit location.
* Target selection for attacks.
* The smorgasbord that is cyberpunk's melee system.
* Non-0-point skills to be shown first.
* Improvement points for skills, custom skills.
  * The biggest thing here is figuring out a non-cluttered UI for these.
* Template area selection for area attacks
* Netrunning: Please dear gods, I've not used it in a campaign so it's a little far down my list
* Mech sheet: Yes this will come Ste, likely after Okay Weapon Rolls and the combat tab.

All rights to Cyberpunk 2020 lie with R. Talsorian games. Under their [homebrew content policy](https://rtalsoriangames.com/homebrew-content-policy/), any compendium produced with this will likely only be the statistical summaries of items, equivalent to the rows in the weapon table, without R. Talsorian's descriptive text. There will not be any stat blocks for monsters, NPCs, or hazards.

Sheet currently looks like this:

![image](https://user-images.githubusercontent.com/6842867/106651313-e6161b00-658b-11eb-9595-d4469b425718.png)

Current progress (not a full list, but what comes to mind as I write): 
* Skills: usable. swap between chipped and stat values, roll skill checks, search skills.
* Stats: Visually there, editable, with both base and temp mod.
  * Yet to come: UI-consistent way of viewing what modifies them.


Happy to take any feedback; feel free to add issues or to make a PR :)