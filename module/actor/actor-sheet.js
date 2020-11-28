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
      template: "systems/cyberpunk2020/templates/actor/actor-sheet.html",
      // Default window dimensions
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "info" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // the data THIS returns is only available in this class and the template
    const data = super.getData();

    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    return data;
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
    const gear = [];
    const features = [];

    // Assign and return.
    // actorData.___ = different containers
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Find elements with stuff like html.find('.cssClass').click(this.function.bind(this));
    // Bind makes the "this" object in the function this.
  }
}
