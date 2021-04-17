export function registerSystemSettings() {
   /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register("cyberpunk", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    // TODO: Check if, when game version is changed, this changes. It should not.
    default: game.system.data.version
  });
}