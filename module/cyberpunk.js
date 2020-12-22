import { CyberpunkActor } from "./actor/actor.js";
import { CyberpunkActorSheet } from "./actor/actor-sheet.js";
import { CyberpunkItem } from "./item/item.js";
import { CyberpunkItemSheet } from "./item/item-sheet.js";

import { preloadHandlebarsTemplates } from "./templates.js";

Hooks.once('init', async function () {

    // Place classes in system namespace for later reference.
    game.cyberpunk = {
        CyberpunkActor,
        CyberpunkItem,
    };

    // Define custom Entity classes
    CONFIG.Actor.entityClass = CyberpunkActor;
    CONFIG.Item.entityClass = CyberpunkActor;

    // Register sheets, unregister original core sheets
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("cyberpunk", CyberpunkActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("cyberpunk", CyberpunkItemSheet, { makeDefault: true });

    let properCase = function (str) {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    };
    Handlebars.registerHelper('properCase', properCase);
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
    // Damage: Which damage box in the woundstate - 1-4, as each has 4 boxes
    Handlebars.registerHelper("damageBoxes", function(woundState, damage, options) {
        const woundsPerState = 4;
        const previousBoxes = woundState * woundsPerState;
        let ret = [];
        for(let boxNo = 1; boxNo <= woundsPerState; boxNo++) {
            const thisWound = previousBoxes + boxNo;
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
            ret += options.fn({classes: classes, woundNo: thisWound});
        }
        return ret;
    });

    // Register and preload templates with Foundry. See templates.js for usage
    preloadHandlebarsTemplates();
});