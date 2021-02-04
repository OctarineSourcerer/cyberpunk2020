import {weaponTypes} from "../lookups.js"
import {DiceCyberpunk} from "../dice.js"

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class CyberpunkItem extends Item {
  // This also has preparedata, but we don't have to worry about that so far

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    // This is where the item would make a roll in the chat or something like that.
    switch (this.type) {
      case "weapon":
        this.__weaponRoll();
        break;
    
      default:
        break;
    }
  }

      // Now, this is gonna have to ask the player for different things depending on the weapon
    // Apply modifiers first? p99 in book
    // Crit fail jam roll
    
    // p106
    // Automatic weapon? choose between 3-round burst, full-auto and suppressive fire
    // 3-round = 1 target
    // full-auto = as many targets as you wish cos screw you
    // Suppressive fire? choose an area. save is rof/width area, minimum 2m

    // Laser? How much of the charge are you using?
    // Microwaver? regular attack, though includes path, but also roll on microwaver table

    // Area effect. Miss? Roll direction, roll meters away
    // Shotgun? Width depends on distance from character
    // Grenades have fixed width. Throw up to 10xBOD
    // Gas? Wind effect. Dear lord.

    // Let's just pretend the unusual ranged does exist for now
  __weaponRoll() {
    let owner = this.actor;
    if(owner === null) {
      throw new Error("This item isn't owned by anyone.");
    }
    let isRanged = this.type === weaponTypes.melee;
    let parts = [];
    parts.push("@stats.ref.value")
    DiceCyberpunk.d10Roll({
      flavor: "BOOM",
      data: owner.data.data,
      parts: parts,
      chatTemplate: "systems/cyberpunk2020/templates/chat/weapon-roll.hbs"
    });
  }
}
