// Handle migration of things. The shape of it nabbed from 5e
export async function migrateWorld() {
    for(let actor of game.actors.entities) {
        try {
            const updateData = migrateActorData(actor.data);
            if (!isObjectEmpty(updateData)) {
                await actor.update(updateData);
            }
            } catch(err) {
            err.message = `Failed cyberpunk system migration for Actor ${actor.name}: ${err.message}`;
            console.error(err);
            return;
        }
    }
    game.settings.set("cyberpunk", "systemMigrationVersion", game.system.data.version);
    ui.notifications.info(`Cyberpunk2020 System Migration to version ${game.system.data.version} completed!`, {permanent: true});
}

// For now, actors. We can do migrate world as a total of them all. Nabbed framework of code from 5e
/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {object} actor    The actor data object to update
 * @return {Object}         The updateData to apply
 */
export function migrateActorData(actor) {
    console.log(`Migrating data of ${actor.name}`);

    // No need to migrate items currently
    let updateData = {}
    let data = actor.data;

    for (const skillName in data.skills) {
        let skill = data.skills[skillName];
        if(skill.stat == "body") {
            console.log(`Changing ${skillName}'s stat from body to bt (is body type because cyberpunk)`);
            updateData[`data.skills.${skillName}.stat`] = "bt";
        }
    }

    return updateData;
} 

