import { makeD10Roll, Multiroll } from "../dice.js";
import { SortOrders, sortSkills } from "./skill-sort.js";
import { properCase, localize, deepLookup } from "../utils.js"

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CyberpunkActor extends Actor {

  /** @override */
  static async create(data, options={}) {
    data.token = data.token || {};
    if ( data.type === "character" ) {
      mergeObject(data.token, {
        vision: true,
        dimSight: 30,
        brightSight: 0,
        actorLink: true, // boy do characters need this
        disposition: 1
      }, {overwrite: false});
    }
    return super.create(data, options);
  }

  /**
   * Augment the basic actor data with additional dynamic data - the stuff that's calculated from other data
   */
  prepareData() {
    super.prepareData();
    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    switch ( this.data.type ) {
      // NPCs are exactly the same as characters at the moment, but don't get vision or default actorlink
      case "npc":
      case "character":
        this._prepareCharacterData(this.data.data);
        break;
    }
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(data) {
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
    
    // Sort through this now so we don't have to later
    let equippedItems = this.items.entries.filter(item => {
      return item.data.data.equipped;
    });

    // Reflex is affected by encumbrance values too
    stats.ref.armorMod = 0;
    equippedItems.filter(i => i.type === "armor").forEach(armor => {
      let armorData = armor.data.data;
      if(armorData.encumbrance != null) {
        stats.ref.armorMod -= armorData.encumbrance;
      }

      // While we're looping through armor, might as well modify hit locations' armor
      for(let armorArea in armorData.coverage) {
        let location = data.hitLocations[armorArea];
        if(location !== undefined) {
          armorArea = armorData.coverage[armorArea];
          location.stoppingPower += armorArea.stoppingPower;
        }
      }
    });
    stats.ref.total = stats.ref.base + stats.ref.tempMod + stats.ref.armorMod;

    const move = stats.ma;
    move.run = move.total * 3;
    move.leap = Math.floor(move.run / 4); 

    const body = stats.bt;
    body.carry = body.total * 10;
    body.lift = body.total * 40;
    body.modifier = CyberpunkActor.btm(body.total);
    data.carryWeight = 0;
    equippedItems.forEach(item => {
      let weight = item.data.data.weight || 0;
      data.carryWeight += weight;
    });

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
    // calculate and configure the humanity
    const emp = stats.emp;
    emp.humanity = {base: emp.base * 10};
    // calculate total HL from cyberware
    let hl = 0;
    equippedItems.filter(i => i.type === "cyberware").forEach(cyberware => {
      hl += (cyberware.humanityLoss) ? cyberware.humanityLoss : 0;
    });

    emp.humanity.loss = hl;
    // calculate current Humanity and current EMP
    emp.humanity.total = emp.humanity.base - emp.humanity.loss;
    emp.total = emp.base + emp.tempMod - Math.floor(emp.humanity.loss/10);
  }

  /**
   * 
   * @param {string} sortOrder The order to sort skills by. Options are in skill-sort.js's SortOrders. "stat" or "alph". Default "alph".
   */
  sortSkills(sortOrder) {
    sortOrder = sortOrder || Object.keys(SortOrders)[0];
    console.log(`Sorting skills by ${sortOrder}`);
    let sortedView = sortSkills(this.data.data.skills, SortOrders[sortOrder]);

    // Technically UI info, but we don't wanna calc every time we open a sheet so store it in the actor.
    this.update({
      "data.sortedSkillView": sortedView,
      "data.skillsSortedBy": sortOrder
    });
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
      default: return 5;
    }
  }

  // Current wound state. 0 for uninjured, going up by 1 for each new one. 1 for Light, 2 Serious, 3 Critical etc.
  woundState() {
    const damage = this.data.data.damage;
    if(damage == 0) return 0;
    // Wound slots are 4 wide, so divide by 4, ceil the result
    return Math.ceil(damage/4);
  }


  stunThreshold() {
    const body = this.data.data.stats.bt.total;
    // +1 as Light has no penalty, but is 1 from woundState()
    return body - this.woundState() + 1; 
  }

  deathThreshold() {
    // The first wound state to penalise is Mortal 1 instead of Serious.
    return this.stunThreshold() + 3;
  }

  _realSkillValue(skill) {
    let value = skill.value;
    if(skill.chipped && (skill.chipValue != undefined)) {
      value = skill.chipValue;
    }
    return value;
  }

  rollSkill(skillName) {
    // Is a deep lookup as the nested skills are likely "Martial.Aikido" or along those lines
    let skill = deepLookup(this.data.data.skills, skillName);
    let value = this._realSkillValue(skill);

    let rollParts = [];
    rollParts.push(value);

    if(skill.stat) {
      rollParts.push(`@stats.${skill.stat}.total`);
    }
    if(skillName === "AwarenessNotice") {
      rollParts.push("@skills.CombatSense.value");
    }

    // When rolling skill, we use something like MartialArts.Aikido. Dots and translation keys don't play nice, so instead each group uses a translation prefix
    let [parentName, childName] = skillName.split(".");
    let translationKey = "Skill";
    if(childName && this.data.data.skills[parentName].translationPrefix) {
      translationKey += this.data.data.skills[parentName].translationPrefix + childName;
    }
    else {
      translationKey += parentName;
    }
    let roll = new Multiroll(localize(translationKey))
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
    let roll = new Multiroll(`${this.name} ${localize("Initiative")}`, localize("InitiativeTrackerWarning"))
      .addRoll(makeD10Roll(["@stats.ref.total","@skills.CombatSense.value"], this.data.data));
    roll.defaultExecute();
  }

  rollStunDeath() {
    let rolls = new Multiroll(localize("StunDeathSave"), localize("UnderThresholdMessage"));
    rolls.addRoll(new Roll("1d10"), {
      name: localize("Save")
    });
    rolls.addRoll(new Roll(`${this.stunThreshold()}`), {
      name: "Stun Threshold"
    });
    rolls.addRoll(new Roll(`${this.deathThreshold()}`), {
      name: "Death Threshold"
    });
    rolls.defaultExecute();
  }
}