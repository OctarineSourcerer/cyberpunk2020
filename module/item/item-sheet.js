import { weaponTypes, sortedAttackTypes, concealability, availability, reliability } from "../lookups.js"

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
    const data = super.getData();
    switch (this.item.data.type) {
      case "weapon":
        this._prepareWeapon(data);
        break;
    
      case "armor":
        this._prepareArmor(data);
      default:
        break;
    }
    return data;
  }

  _prepareWeapon(data) {
    data.weaponTypes = Object.values(weaponTypes).sort();
    data.attackTypes = sortedAttackTypes;
    data.concealabilities = Object.values(concealability);
    data.availabilities = Object.values(availability);
    data.reliabilities = Object.values(reliability);
    // TODO: Be not so inefficient for this
    data.attackSkills = Object.keys(this.actor.data.data.skills).sort().map(e => "Skill" + e);
  }

  _prepareArmor(data) {
    
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
    html.find(".item-roll").click(this.item.roll.bind(this))
  }
}
