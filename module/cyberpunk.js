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

    // Repeat what's inside it X times.
    // Useful for testing the damage track. Use as, for example, {{#repeat 4}}whatyouwanttorepeat{{/repeat}}
    Handlebars.registerHelper("repeat", function(amount, options) {
        var result = "";
        for (var i = 0; i < amount; i++) {
            result = result + options.fn({i: i});
        }
        return result;
    });
    Handlebars.registerHelper("skillRef", function(skill) {
        return "CYBERPUNK.Skill" + skill;
    });

    // Register and preload templates with Foundry. See templates.js for usage
    preloadHandlebarsTemplates();
});