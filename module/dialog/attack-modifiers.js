import { localize } from "../utils.js"
import { defaultTargetLocations } from "../lookups.js"

/**
 * A specialized form used to select the modifiers for shooting with a weapon
 * This could, I guess, also be done with dialog and FormDataExtended
 * @implements {FormApplication}
 */
 export class AttackModifiers extends FormApplication {

    /** @override */
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        id: "weapon-modifier",
        classes: ["cyberpunk"],
        title: localize("AttackModifiers"),
        template: "systems/cyberpunk2020/templates/dialog/attack-modifiers.hbs",
        width: 400,
        height: "auto",
        weapon: null
        // Fire mode
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
      // I will say this is an atrociously rigid implementation, a terrible prototype, and we shall see about making it more flexible.

      // Default range 50
      let range = this.options.weapon.data.data.range || 50;
      let fireModes = this.options.weapon.__getFireModes() || [];
      // Localisation data for ranges
      let rangeLocals = {
        "RangePB": { range: 1 },
        "RangeClose": { range: range/4 },
        "RangeMedium": { range: range/2 },
        "RangeLong": { range: range },
        "RangeExtreme": { range: range*2 }
      };
      return {
        extraMod: 0,
        aimRounds: 0,
        ambush: false,
        blinded: false,
        dualWield: false,
        fastDraw: false,
        hipfire: false,
        ricochet: false,
        running: false,
        targetArea: "",
        turningToFace: false,
        fireMode: fireModes[0] || "",
        choices: {
          ranges: Object.keys(rangeLocals),
          rounds: [0,1,2,3],
          fireModes: fireModes,
          // TODO: Choices dependent on target
          targetArea: defaultTargetLocations
        },
        locals: {
          ranges: rangeLocals,
          rounds: {
            0: {rounds: 0},
            1: {rounds: 1},
            2: {rounds: 2},
            3: {rounds: 3}
          }
        }
      }
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    _updateObject(event, formData) {
      const updateData = formData;
      // Update the object
      this.object = updateData;
      this.submit().then((form) => {
        let fireOptions = this.object;
        // We don't need localisation or choices options anymore
        delete fireOptions.locals;
        delete fireOptions.choices;
        console.log(fireOptions);
        this.options.weapon.__weaponRoll(fireOptions);
      });
    }
 }