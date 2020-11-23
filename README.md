# cyberpunk2020-foundry
R. Talsorian Games' [Cyberpunk 2020](https://talsorianstore.com/products/cyberpunk-2020) system, but for FoundryVTT. Time to get chromed, and frag some slags.

This is an early work, and thus far only has most of the underlying data structure of player characters (in `template.json`), as well as a few fields on the character sheet. Current roadmap:

* A character sheet, with damage tracking, gear, searchable skills, and cyberware.
  * I'll consider it a bonus point if I can get cyberware working with Active Effects, but no promises, cos I have no idea how to implement that framework yet.
* SP tracked for armor.
* Automated attacks for weapons. Ammo expenditure and reloads easily doable from chat messages.
* Attack hit roll automatically translated to the name of the hit location.

I aim to, at first, do these things in a style akin to the original style of the book; more modern/neon/decklike styles may be considered later.