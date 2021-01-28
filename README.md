# cyberpunk2020-foundry
R. Talsorian Games' [Cyberpunk 2020](https://talsorianstore.com/products/cyberpunk-2020) system, but for FoundryVTT. Time to get chromed, and frag some slags.

This is an early work, and thus far only has most of the underlying data structure of player characters (in `template.json`), as well as a few fields on the character sheet. Current roadmap:

* A character sheet, with damage tracking, gear, searchable skills, and cyberware.
  * I'll consider it a bonus point if I can get cyberware working with Active Effects, but no promises, cos I have no idea how to implement that framework yet.
* SP tracked for armor.
* Automated attacks for weapons. Ammo expenditure and reloads easily doable from chat messages.
* Attack hit roll automatically translated to the name of the hit location.

I aim to, at first, do these things in a style akin to the original style of the book; more modern/neon/decklike styles may be considered later.

All rights to Cyberpunk 2020 lie with R. Talsorian games. I don't intend to infringe on this and so, if not given express permission, I'm not likely to make compendiums with game content.

A snapshot of the sheet in construction:

![image](https://user-images.githubusercontent.com/6842867/102726466-fdb87d80-4316-11eb-9bd8-5cb9cf6c8ce6.png)

The character sheet's pretty interactive rn, but I need to do item sheets and rolls etc. Have had a bit of a hiatus since Christmas, but I should really resume dev at some point (as of end of January).

To anyone thinking of contributing, fair warning, I've not yet gotten to removing all the stuff that came in from Boilerplate. Hopefully the commit messages are at least sane though.
