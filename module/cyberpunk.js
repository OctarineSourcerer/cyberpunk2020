import { CyberpunkActor } from "./actor/actor.js";
import { CyberpunkActorSheet } from "./actor/actor-sheet.js";
import { CyberpunkItem } from "./item/item.js";
import { CyberpunkItemSheet } from "./item/item-sheet.js";

import { preloadHandlebarsTemplates } from "./templates.js";
import { properCase } from "./utils.js"

Hooks.once('init', async function () {

    // Place classes in system namespace for later reference.
    game.cyberpunk = {
        CyberpunkActor,
        CyberpunkItem,
    };

    // Define custom Entity classes
    CONFIG.Actor.entityClass = CyberpunkActor;
    CONFIG.Item.entityClass = CyberpunkItem;

    // Register sheets, unregister original core sheets
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("cyberpunk", CyberpunkActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("cyberpunk", CyberpunkItemSheet, { makeDefault: true });

    Handlebars.registerHelper('properCase', properCase);
    Handlebars.registerHelper('cLocal', function(str) {
        return game.i18n.localize("CYBERPUNK." + str);
    })
    Handlebars.registerHelper('localizeStat', function(str) {
        return "CYBERPUNK." + properCase(str);
    })
    Handlebars.registerHelper('equals', function(x, y) {
        return x === y;
    })

    // Repeat what's inside it X times. i starts at 1, ends at amount.
    // Useful for testing the damage track. Use as, for example, {{#repeat 4}}whatyouwanttorepeat{{/repeat}}
    Handlebars.registerHelper("repeat", function(amount, options) {
        var result = "";
        for (var i = 1; i <= amount; i++) {
            result = result + options.fn({i: i});
        }
        return result;
    });
    Handlebars.registerHelper("skillRef", function(skill) {
        return "CYBERPUNK.Skill" + skill;
    });
    // Woundstate: 0 for light, 1 for serious, etc
    // It's a little unintuitive, but handlebars loops start at 0, and that's our first would state
    // Damage: How much damage the character has taken. Actor.data.data.damage.
    // Provides within its context classes, and the current wound
    Handlebars.registerHelper("damageBoxes", function(woundState, damage, options) {
        const woundsPerState = 4;
        const previousBoxes = woundState * woundsPerState;
        let ret = [];
        for(let boxNo = 1; boxNo <= woundsPerState; boxNo++) {
            let thisWound = previousBoxes + boxNo;
            let classes = `damage dmg${thisWound}`;
            if(boxNo === 1) {
                classes += " leftmost"
            }
            else if (boxNo === woundsPerState) {
                classes += " rightmost"
            }
    
            if(damage >= thisWound) {
                classes += " filled"
            }
            else { classes += " unfilled" }
            // When the wound box is filled, make clicking it again essentially "deselect" that wound
            if(damage == thisWound) {
                thisWound -= 1;
            }
            ret += options.fn({classes: classes, woundNo: thisWound});
        }
        return ret;
    });

    Handlebars.registerHelper("template", function(templateName) {
        return "systems/cyberpunk2020/templates/" + templateName + ".html";
    });

    Handlebars.registerHelper("deepLookup", function(context, path) {
        let current = context;
        path.split(".").forEach(segment => {
            current = current[segment];
        });
        return current;
    });

    // Register and preload templates with Foundry. See templates.js for usage
    preloadHandlebarsTemplates();
});