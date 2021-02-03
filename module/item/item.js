import {weaponTypes} from "../lookups.js"
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
        __weaponRoll();
        break;
    
      default:
        break;
    }
  }

  __weaponRoll() {
    let owner = this.actor;
    if(owner === null) {
      throw new Error("This item isn't owned by anyone.");
    }
    let isRanged = this.type === weaponTypes.melee;
    
  }
}
