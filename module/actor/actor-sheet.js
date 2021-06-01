import { martialOptions, meleeAttackTypes, meleeBonkOptions, rangedModifiers, weaponTypes } from "../lookups.js"
import { localize } from "../utils.js"
import { ModifiersDialog } from "../dialog/modifiers.js"
import { SortOrders } from "./skill-sort.js";

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
    if (this.actor.data.type == 'character' || this.actor.data.type == "npc") {
      // Give space for temporary stuff. Delete on sheet close?
      if(data.data.transient == null) {
        data.data.transient = { skillFilter: "" };
      }
      this._prepareCharacterItems(data);
      this._addWoundTrack(data);
      data.skillsSort = this.actor.getFlag('cyberpunk2020', 'skillSortOrder') || "Name";
      data.skillsSortChoices = Object.keys(SortOrders);
      data.skillDisplayList = this._filterSkills(data);
      data.weaponTypes = weaponTypes;
    }

    return data;
  }

  // These are technically items, but are in their own method as they should be more easily referable
  // Data is TOP-level data
  _prepareSkills(data) {
    // I'm essentially debating whether to make a Skills block in data or what we give to rolls
  }

  // Handle searching skills
  _filterSkills(data) {
    if(data.data.transient.skillFilter == null) {
      data.data.transient.skillFilter = "";
    }
    let upperSearch = data.data.transient.skillFilter.toUpperCase();
    const fullList = data.data.sortedSkillView || Object.keys(data.data.skills);

    let listToFilter = fullList;

    // Only filter if we need to
    if(upperSearch === "") {
      return listToFilter;
    }
    else {
      // If we searched previously and the old search had results, we can filter those instead of the whole lot
      if(data.data.transient.oldSearch != null 
        && data.skillDisplayList != null
        && upperSearch.startsWith(oldSearch)) {
        listToFilter = data.skillDisplayList; 
      }
      return listToFilter.filter(skillName => {
        return skillName.toUpperCase().includes(upperSearch);
      });
    }
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
    // We have to look the actor up, because the sheet's actor doesn't have itemTypes on, and I'd rather not reclassify all the skills etc when there's literally 100 of them
    let id = sheetData.actor._id;
    let sortedItems = game.actors.get(id).itemTypes;

    // Does this copy need to be done with itemTypes being a thing?
    sheetData.gear = {
      weapons: sortedItems.weapon,
      armor: sortedItems.armor,
      cyberware: sortedItems.cyberware,
      misc: sortedItems.misc,
      all: [sortedItems.weapons],
      cyberCost: sortedItems.cyberware.reduce((a,b) => a + b.data.data.cost, 0)
    };

  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    /**
   * Get an owned item from a click event, for any event trigger with a data-item-id property
   * @param {*} ev 
   */
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
    html.find(".skill-sort > select").change(ev => {
      let sort = ev.currentTarget.value;
      this.actor.sortSkills(sort);
    });
    html.find(".skill-roll").click(ev => {
      let skillName = ev.currentTarget.dataset.skillName;
      this.actor.rollSkill(skillName);
    });
    html.find(".roll-initiative").click(ev => {
      this.actor.rollInitiative();
    });
    html.find(".damage").click(ev => {
      let damage = Number(ev.currentTarget.dataset.damage);
      this.actor.update({
        "data.damage": damage
      });
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
      ev.stopPropagation();
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
      ev.stopPropagation();
      let item = getEventItem(this, ev);
      let isRanged = item.isRanged();

      let modifierGroups = undefined;
      let onConfirm = undefined;
      if(isRanged) {
        modifierGroups = rangedModifiers(item);
      }
      else if (item.data.data.attackType === meleeAttackTypes.martial){
        modifierGroups = martialOptions(this.actor);
      }
      else {
        modifierGroups = meleeBonkOptions();
      }
      
      let dialog = new ModifiersDialog(this.actor, {
        weapon: item,
        modifierGroups: modifierGroups,
        onConfirm: (fireOptions) => item.__weaponRoll(fireOptions)
      });
      dialog.render(true);
    });
  }
}
