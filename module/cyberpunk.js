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

    Handlebars.registerHelper('toLowerCase', function (str) {
        return str.toLowerCase();
    });

    // Repeat what's inside it X times.
    // Useful for testing the damage track. Use as, for example, {{#loop 4}}whatyouwanttorepeat{{/loop}}
    Handlebars.registerHelper("repeat", function(amount, options) {
        var result = "";
        for (var i = 0; i < amount; i++) {
            result = result + options.fn(this);
        }
        return ret;
    });

    // Register and preload templates with Foundry. See templates.js for usage
    preloadHandlebarsTemplates();
});