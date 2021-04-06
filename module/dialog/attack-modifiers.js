/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @implements {FormApplication}
 */
 export default class WeaponModifiers extends FormApplication {

    /** @override */
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        id: "weapon-modifier",
        classes: ["cyberpunk"],
        title: "Weapon Modifier",
        template: "systems/cyberpunk2020/templates/dialog/attack-modifiers.hbs",
        width: 400,
        height: "auto",
      });
    }
  
    /* -------------------------------------------- */
  
    /**
     * Return a reference to the target attribute
     * @type {String}
     */
    get attribute() {
        return this.options.name;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData() {
      return {
        aimRounds: 0,
        ambush: false,
        fastDraw: false,
        ricochet: false,
        blinded: false,
        turningToFace: false,
        dualWield: false,
        running: false,
        hipfire: false
      }
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _updateObject(event, formData) {
      const updateData = {};
  
      // Obtain choices
      const chosen = [];
      for ( let [k, v] of Object.entries(formData) ) {
        if ( (k !== "custom") && v ) chosen.push(k);
      }
      updateData[`${this.attribute}.value`] = chosen;
  
      // Validate the number chosen
      if ( this.options.minimum && (chosen.length < this.options.minimum) ) {
        return ui.notifications.error(`You must choose at least ${this.options.minimum} options`);
      }
      if ( this.options.maximum && (chosen.length > this.options.maximum) ) {
        return ui.notifications.error(`You may choose no more than ${this.options.maximum} options`);
      }
  
      // Include custom
      if ( this.options.allowCustom ) {
        updateData[`${this.attribute}.custom`] = formData.custom;
      }
  
      // Update the object
      this.object.update(updateData);
    }
  }
  