// Handle migration of things. The shape of it nabbed from 5e
export async function migrateWorld() {
    if (!game.user.isGM) {
        ui.notifications.error("Only the GM can migrate the world");
        return;
    }
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
 * @param {object} actorData    The actor data object to update
 * @return {Object}         The updateData to apply
 */
export function migrateActorData(actorData) {
    console.log(`Migrating data of ${actorData.name}`);

    // No need to migrate items currently
    let updateData = {}
    let data = actorData.data;

    if(actorData.type == "character") {
        if(!actorData.token.actorLink) {
            console.log(`Making ${actorData.name}'s default token be linked to the actor, and be friendly`);
            updateData[`token.actorLink`] = true;
            updateData[`token.disposition`] = 1;
        }
        if(!actorData.token.vision) {
            console.log(`Making ${actorData.name}'s default token actually have vision`);
            updateData[`token.vision`] = true;
            updateData[`token.dimSight`] = 30;
        }
    }
    for (const skillName in data.skills) {
        let skill = data.skills[skillName];
        if(skill.stat == "body") {
            console.log(`Changing ${skillName}'s stat from body to bt (is body type because cyberpunk)`);
            updateData[`data.skills.${skillName}.stat`] = "bt";
        }
        // Check for skills that have their stat as special, then assign the new stat from the template
        if(skill.stat == "special") {
            let actualStat = game.system.template.Actor.templates.skills.skills[skillName].stat;
            console.log(`Changing ${skillName}'s stat from special to ${actualStat}, and marking it as a special skill`);
            updateData[`data.skills.${skillName}.stat`] = actualStat;
            updateData[`data.skills.${skillName}.isSpecial`] = true;
        }
        if(skillName == "Expert" || skillName == "Language") {
            if(!skill.group) {
                // No translation prefix as these will be custom entries
                console.log(`Making Expert and Language into groups instead of empty entries.`);
                updateData[`data.skills.${skillName}.group`] = true;
            }
        }
    }


    return updateData;
} 

