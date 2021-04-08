import { makeD10Roll, Multiroll } from "../dice.js";
import { SortOrders, sortSkills } from "./skill-sort.js";
import { properCase, localize } from "../utils.js"

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CyberpunkActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data - the stuff that's calculated from other data
   */
  prepareData() {
    super.prepareData();

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    switch ( this.data.type ) {
      case "character":
        this._prepareCharacterData(this.data);
    }
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;
    
    const stats = data.stats;
    // Calculate stat totals using base+temp
    for(const stat of Object.values(stats)) {
      stat.total = stat.base + stat.tempMod;
    }
    // A lookup for translating hit rolls to names of hit locations
    // I know that for ranges there are better data structures to lookup, but we're using d10s for hit locations, so it's no issue
    data.hitLocLookup = {};
    for(const hitLoc in data.hitLocations) {
      let area = data.hitLocations[hitLoc]
      area.stoppingPower = 0;
      let [start, end] = area.location;
      // Just one die number that'll hit the location
      if(!end) {
        data.hitLocLookup[start] = hitLoc;
      }
      // A range of die numbers that'll hit the location
      else {
        for(let i = start; i <= end; i++) {
          data.hitLocLookup[i] = hitLoc;
        }
      }
    }

    // Reflex is affected by encumbrance values too
    stats.ref.armorMod = 0;
    actorData.items.filter(i => i.type === "armor").forEach(armor => {
      if(armor.encumbrance != null) {
        stats.ref.armorMod -= armor.encumbrance;
      }

      // While we're looping through armor, might as well modify hit locations' armor
      for(let armorArea in armor.data.coverage) {
        let location = data.hitLocations[armorArea];
        if(location !== undefined) {
          armorArea = armor.data.coverage[armorArea];
          location.stoppingPower += armorArea.stoppingPower;
        }
      }
    });
    stats.ref.total = stats.ref.base + stats.ref.tempMod + stats.ref.armorMod;

    const move = stats.ma;
    move.run = move.total * 3;
    move.leap = Math.floor(move.total / 4); 

    const body = stats.bt;
    body.carry = body.total * 10;
    body.lift = body.total * 40;
    body.modifier = CyberpunkActor.btm(body.total);
    // This is where the effect wounds would have to be calculated

    // Only sort skills if we need to - sortSkills is essentially a dirty flag
    if(this.getFlag('cyberpunk2020', 'sortSkills')) {
      let sortOrder = this.getFlag('cyberpunk2020', 'skillSortOrder') || Object.keys(SortOrders)[0];
      actorData.data.skills = sortSkills(data.skills, SortOrders[sortOrder])
    }

    // Apply wound effects
    // Change stat total, but leave a record of the difference in stats.[statName].woundMod
    // Modifies the very-end-total, idk if this'll need to change in the future
    let woundState = this.woundState();
    let woundStat = function(stat, totalChange) {
        let newTotal = totalChange(stat.total)
        stat.woundMod = -(stat.total - newTotal);
        stat.total = newTotal;
    }
    if(woundState >= 4) {
      [stats.ref, stats.int, stats.cool].forEach(stat => woundStat(stat, total => Math.ceil(total/3)));
    } 
    else if(woundState == 3) {
      [stats.ref, stats.int, stats.cool].forEach(stat => woundStat(stat, total => Math.ceil(total/2)));
    }
    else if(woundState == 2) {
      woundStat(stats.ref, total => total - 2);
    }
  }

  /**
   * Get a body type modifier from the body type stat (body)
   * I couldn't figure out a single formula that'd work for it (cos of the weird widths of BT values)
   */
  static btm(body) {
    if(body < 2) throw "Body type cannot be below 2."
    switch(body) {
      case 2: return 0
      case 3: 
      case 4: return 1
      case 5:
      case 6:
      case 7: return 2;
      case 8:
      case 9: return 3;
      case 10: return 4;
      case body > 10: return 5;
    }
  }

  // Current wound state. 0 for uninjured, going up by 1 for each new one. 1 for Light, 2 Serious, 3 Critical etc.
  woundState() {
    const damage = this.data.data.damage;
    if(damage == 0) return 0;
    // Wound slots are 4 wide, so divide by 4, ceil the result
    return Math.ceil(damage/4);
  }

  saveThreshold() {
    const body = this.data.data.stats.body.total;
    return body - this.woundState();
  }

  _realSkillValue(skill) {
    let value = skill.value;
    if(skill.chipped && (skill.chipValue != undefined)) {
      value = skill.chipValue;
    }
    return value;
  }

  // TODO: This needs to be tested for nested skills eventually
  rollSkill(skillName) {
    let skill = this.data.data.skills[skillName];
    let value = this._realSkillValue(skill);

    let rollParts = [];
    rollParts.push(value);
    // TODO: Check if there IS a stat that special skills use
    if(skill.stat !== "special") {
      rollParts.push(`@stats.${skill.stat}.total`);
    }
    let roll = new Multiroll(localize("Skill"+skillName))
      .addRoll(makeD10Roll(rollParts, this.data.data));

    roll.defaultExecute();
  }

  rollStat(statName) {
    let fullStatName = localize(properCase(statName) + "Full");
    let roll = new Multiroll(fullStatName);
    roll.addRoll(makeD10Roll(
      [`@stats.${statName}.total`],
      this.data.data
    ));
    roll.defaultExecute();
  }

  rollInitiative() {
    // TODO: Get this actually working with the initiative tracker
    // let activeCombat = game.combats.active;
    // if(activeCombat !== undefined) {
    //   activeCombat.rollInitiative(this.id);
    //   return;
    // }
    let roll = new Multiroll(`${this.name} ${localize("Initiative")}`)
      .addRoll(makeD10Roll(["@stats.ref.total"], this.data.data));
    roll.defaultExecute();
  }

}