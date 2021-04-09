import { weaponTypes } from "../lookups.js"
import { localize } from "../utils.js"
import { AttackModifiers } from "../dialog/attack-modifiers.js"

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CyberpunkActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      // Css classes
      classes: ["cyberpunk", "sheet", "actor"],
      template: "systems/cyberpunk2020/templates/actor/actor-sheet.hbs",
      // Default window dimensions
      width: 590,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // the data THIS returns is only available in this class and the template
    const data = super.getData();

    // Prepare items.
    if (this.actor.data.type == 'character') {
      // Give space for temporary stuff. Delete on sheet close?
      if(data.data.transient == null) {
        data.data.transient = { skillFilter: "" };
      }
      this._prepareCharacterItems(data);
      this._addWoundTrack(data);
      this._filterSkills(data);
      data.weaponTypes = weaponTypes;
    }

    return data;
  }

  _filterSkills(data) {
    if(data.data.transient.skillFilter == null) {
      data.data.transient.skillFilter = "";
    }
    let upperSearch = data.data.transient.skillFilter.toUpperCase();
    const fullSkills = data.data.skills;

    // By default, we'll copy the whole list of skills, no filtering
    let listToFilter = fullSkills;
    let filterFn = (result, [k,v]) => {
      result[k] = v;
      return result;
    };

    // Only change those defaults if we actually need to filter
    if(upperSearch !== "") {
      // If we're searchin', we need to actually filter as we copy
      filterFn = (result, [k,v]) => {
        if(k.toUpperCase().includes(upperSearch)) {
          result[k] = v;
        }
        return result;
      }
      // If we searched previously and the old search had results, we can filter those instead of the whole lot
      if(data.data.transient.oldSearch != null 
        && data.skillDisplayList != null
        && upperSearch.startsWith(oldSearch)) {
        listToFilter = data.skillDisplayList;
      }
    }
    // Copy filtered skills to skillDisplayList.
    data.skillDisplayList = Object
        .entries(listToFilter)
        .reduce(filterFn, {});
  }

  _addWoundTrack(sheetData) {
    // Add localized wound states, excluding uninjured. All non-mortal, plus mortal
    const nonMortals = ["Light", "Serious", "Critical"].map(e => game.i18n.localize("CYBERPUNK."+e));
    const mortals = Array(7).fill().map((_,index) => game.i18n.format("CYBERPUNK.Mortal", {mortality: index}));
    sheetData.woundStates = nonMortals.concat(mortals);
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const misc = [];
    const weapons = [];
    const armor = [];
    const cyberware = [];

    const targetLookup = {
      "weapon": weapons,
      "armor": armor,
      "cyberware": cyberware,
      "misc": misc
    };

    let totalWeight = 0;
    actorData.items.forEach(item => {
      (targetLookup[item.type] || misc).push(item);
      totalWeight += (item.weight || 0);
    });

    actorData.data.gear = {
      carryWeight: totalWeight,
      weapons: weapons,
      armor: armor,
      cyberware: cyberware,
      misc: misc
    };
  }

  /**
   * Get an owned item from a click event, for any event trigger with a data-item-id property
   * @param {*} ev 
   */

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    function getEventItem(sheet, ev) {
      let itemId = ev.currentTarget.dataset.itemId;
      return sheet.actor.getOwnedItem(itemId);
    }
    
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
    
    // Find elements with stuff like html.find('.cssClass').click(this.function.bind(this));
    // Bind makes the "this" object in the function this.
    // html.find('.skill-search').click(this._onItemCreate.bind(this));

    html.find('.stat-roll').click(ev => {
      let statName = ev.currentTarget.dataset.statName;
      this.actor.rollStat(statName);
    });
    html.find(".skill-roll").click(ev => {
      let skillName = ev.currentTarget.dataset.skillName;
      this.actor.rollSkill(skillName);
    });
    html.find(".roll-initiative").click(ev => {
      this.actor.rollInitiative();
    });
    html.find(".stun-death-save").click(ev => {
      this.actor.rollStunDeath();
    });

    html.find('.item-roll').click(ev => {
      // Roll is often within child events, don't bubble please
      ev.stopPropagation();
      let item = getEventItem(this, ev);
      item.roll();
    });
    html.find('.item-edit').click(ev => {
      let item = getEventItem(this, ev);
      item.sheet.render(true);
    });
    html.find('.item-delete').click(ev => {
      ev.stopPropagation();
      let item = getEventItem(this, ev);
      let confirmDialog = new Dialog({
        title: localize("ItemDeleteConfirmTitle"),
        content: `<p>${localize("ItemDeleteConfirmText")}</p>`,
        buttons: {
          yes: {
            label: localize("Yes"),
            callback: () => item.delete()
          },
          no: { label: localize("No") },
        },
        default:"no"
      });
      confirmDialog.render(true);
    });

    html.find('.fire-weapon').click(ev => {
      let item = getEventItem(this, ev);
      let dialog = new AttackModifiers(this.actor, {
        weapon: item
      });
      dialog.render(true);
    });
  }
}
