/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
    // Path to partial from foundry path. For cyberpunk, is "systems/cyberpunk2020/templates/actor/parts/___.html"
    return loadTemplates([
        "systems/cyberpunk2020/templates/actor/parts/statsgrid.html",
        "systems/cyberpunk2020/templates/actor/parts/woundtracker.html"
    ]);
  };
  