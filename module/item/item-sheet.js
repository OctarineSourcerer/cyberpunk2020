import { weaponTypes, sortedAttackTypes, concealability, availability, reliability, attackSkills, meleeAttackTypes, getStatNames } from "../lookups.js";
import { formulaHasDice } from "../dice.js";
import { localize } from "../utils.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CyberpunkItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cyberpunk", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/cyberpunk2020/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // This means the handlebars data and the form edit data actually mirror each other
    const data = super.getData();

    // TODO: Check that this actually can switch on type okay
    switch (this.item.data.type) {
      case "weapon":
        this._prepareWeapon(data);
        break;
    
      case "armor":
        this._prepareArmor(data);

      case "skill":
        this._prepareSkill(data);

      default:
        break;
    }
    return data;
  }

  _prepareSkill(system) {
    system.stats = getStatNames();
  }

  _prepareWeapon(system) {
    system.weaponTypes = Object.values(weaponTypes).sort();
    if(this.item.system.weaponType === weaponTypes.melee) {
      system.attackTypes = Object.values(meleeAttackTypes).sort();
    }
    else {
      system.attackTypes = sortedAttackTypes;
    }
    system.concealabilities = Object.values(concealability);
    system.availabilities = Object.values(availability);
    system.reliabilities = Object.values(reliability);
    system.attackSkills = [...attackSkills[this.item.system.weaponType].map(x => localize("Skill"+x)), ...(this.actor?.trainedMartials() || [])];

    // TODO: Be not so inefficient for this
    if(!system.attackSkills.length && this.actor) {
      if(this.actor) {
        system.attackSkills = this.actor.itemTypes.skill.map(skill => skill.name).sort();
      }
    }
  }

  _prepareArmor(system) {
    
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here, same as actor sheet.
    html.find(".item-roll").click(this.item.roll.bind(this));

    html.find(".accel").click(() => this.item.accel());
    html.find(".decel").click(() => this.item.accel(true));
    
    // roll for humanity loss on cyberware 
    html.find('.humanity-cost-roll').click(async ev => {
      ev.stopPropagation();
      let itemId = this.object.data.id;
      const cyber = this.actor.items.get(itemId);
      const hc = cyber.system.humanityCost;
      let loss = 0;
      // determine if humanity cost is a number or dice
      if (formulaHasDice(hc)) {
        // roll the humanity cost
        let r = await new Roll(hc).evaluate();
        loss = r.total ? r.total : 0;
      } else {
        const num = Number(hc);
        loss = (isNaN(num)) ? 0 : num;
      }
      cyber.system.humanityLoss = loss;
      cyber.sheet.render(true);
    });
  }
  
}
