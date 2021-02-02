/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
    // Path to partial from foundry path. For cyberpunk, is "systems/cyberpunk2020/templates/actor/parts/___.html"
    return loadTemplates([
        "systems/cyberpunk2020/templates/actor/parts/statsgrid.html",
        "systems/cyberpunk2020/templates/actor/parts/woundtracker.html",
        "systems/cyberpunk2020/templates/actor/parts/skills.html",

        // Shared templates
        "systems/cyberpunk2020/templates/fields/text.html",
        "systems/cyberpunk2020/templates/fields/number.html",
        "systems/cyberpunk2020/templates/fields/boolean.html"
    ]);
  };
  