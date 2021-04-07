/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @implements {FormApplication}
 */
 export class AttackModifiers extends FormApplication {

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
      const updateData = formData;
  
      // Update the object
      this.object.update(updateData);
    }
  }
  