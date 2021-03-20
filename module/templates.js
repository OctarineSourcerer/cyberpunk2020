/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
    // Path to partial from foundry path. For cyberpunk, is "systems/cyberpunk2020/templates/actor/parts/___.hbs". Is .hbs as they're handlebars files
    return loadTemplates([
        "systems/cyberpunk2020/templates/actor/parts/statsgrid.hbs",
        "systems/cyberpunk2020/templates/actor/parts/woundtracker.hbs",
        "systems/cyberpunk2020/templates/actor/parts/skills.hbs",
        "systems/cyberpunk2020/templates/actor/parts/gear.hbs",
        "systems/cyberpunk2020/templates/actor/parts/combat.hbs",

        // Shared templates
        "systems/cyberpunk2020/templates/fields/text.hbs",
        "systems/cyberpunk2020/templates/fields/number.hbs",
        "systems/cyberpunk2020/templates/fields/boolean.hbs",

        // Roll templates
        "systems/cyberpunk2020/templates/chat/default-roll.hbs",
        "systems/cyberpunk2020/templates/chat/weapon-roll.hbs",

        // Item sheet
        "systems/cyberpunk2020/templates/item/item-sheet.hbs",
        "systems/cyberpunk2020/templates/item/weapon-sheet.hbs"
    ]);
  };
  