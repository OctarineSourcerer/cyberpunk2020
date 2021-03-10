import { weaponTypes } from "../lookups.js"
import { DiceCyberpunk, Multiroll, makeD10Roll }  from "../dice.js"

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

  // Let's just pretend the unusual ranged doesn't exist for now
  /**
   * 
   * @param {Int} targetRange Range to target token, in meters.
   */
  __weaponRoll(targetRange) {
    let owner = this.actor;
    if (owner === null) {
      throw new Error("This item isn't owned by anyone.");
    }
    let isRanged = this.type !== weaponTypes.melee;
    
    let attackTerms = [];
    if(this.attackSkill) {
      attackTerms.push(`@stats.${this.attackSkill}.total`);
    }
    let attackRoll = makeD10Roll(attackTerms, owner.data.data);
    let damageRoll = new Roll(this.data.data.damage);
    let locationRoll = new Roll("1d10");

    let bigRoll = new Multiroll(this.name, this.data.data.text)
      .addRoll(attackRoll, name = "Attack")
      .addRoll(damageRoll, name = "Damage")
      .addRoll(locationRoll, name = "Location");

    bigRoll.execute(undefined, "systems/cyberpunk2020/templates/chat/default-roll.hbs", {img:this.img})
    
    // DiceCyberpunk.d10Roll({
    //   flavor: this.name,
    //   rollData: owner.data.data,
    //   parts: parts,
    //   chatTemplate: "systems/cyberpunk2020/templates/chat/weapon-roll.hbs",
    //   chatTemplateData: {
    //     description: this.data.data.text,
    //     img: this.img
    //   }
    // });
  }
}
