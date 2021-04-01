import { weaponTypes } from "../lookups.js"
import { Multiroll, makeD10Roll }  from "../dice.js"
import { localize } from "../utils.js"

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class CyberpunkItem extends Item {
  // This also has preparedata, but we don't have to worry about that so far

  prepareData() {
    super.prepareData();

    switch(this.data.type) {
      case "armor":
        this._prepareArmorData(this.data.data);
    }
  }

  _prepareArmorData(data) {
    // If new owner and armor covers this many areas or more, delete armor coverage areas the owner does not have
    const COVERAGE_CLEANSE_THRESHOLD = 20;

    let nowOwned = !data.lastOwnerId && this.actor;
    let changedHands = data.lastOwnerId !== undefined && data.lastOwnerId != this.actor.id;
    if(nowOwned || changedHands) {
      data.lastOwnerId = this.actor.id;
      let ownerLocs = this.actor.data.data.hitLocations;
      
      // Time to morph the armor to its new owner!
      // I just want this here so people can armor up giant robotic snakes if they want, y'know? or mechs.
      // ...I am fully aware this is overkill effort for most games.
      let areasCovered = Object.keys(data.coverage).length;
      let cleanseAreas = areasCovered > COVERAGE_CLEANSE_THRESHOLD;
      if(cleanseAreas) {
        // Remove any extra areas
        // This is so that armors can't be made bigger indefinitely. No idea why players might do that, but hey.
        for(let armorArea in data.coverage) {
          if(!ownerLocs[armorArea]) {
            console.warn(`ARMOR MORPH: The new owner of this armor (${this.actor.name}) does not have a ${armorArea}. Removing the area from the armor.`)
            delete data.coverage.armorArea;
          }
        }
      }
      
      // TODO: Strict bodytypes option?
      // Add any areas the owner has but the armor doesn't.
      for(let ownerLoc in ownerLocs) {
        if(!data.coverage[ownerLoc]) {
          data.coverage[ownerLoc] = {
            stoppingPower: 0,
            ablation: 0
          }
        }
      }
    }
  }

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
  __weaponRoll() {
    let owner = this.actor;
    if (owner === null) {
      throw new Error("This item isn't owned by anyone.");
    }
    let isRanged = this.type !== weaponTypes.melee;
    

    let attackTerms = ["@stats.ref.total"];
    if(this.attackSkill) {
      attackTerms.push(`@skills.${this.attackSkill}.value`);
    }
    let attackRoll = makeD10Roll(attackTerms, owner.data.data);
    let damageRoll = new Roll(this.data.data.damage);
    let locationRoll = new Roll("1d10");

    let bigRoll = new Multiroll(this.name, this.data.data.flavor)
      .addRoll(attackRoll, {name: localize("Attack")})
      .addRoll(damageRoll, {name: localize("Damage")})
      .addRoll(locationRoll, {name: localize("Location")});

    bigRoll.defaultExecute({img:this.img});
  }
}
