const updateFuncs = {
    "Actor": migrateActorData,
    "Item": migrateItemData
}
// I know there's a lot of await in here, and I think it might be possible to not wait for the results of updating entities. But I also don't know if it would blow foundry up to get so many update requests so far.

// Handle migration of things. The shape of it nabbed from 5e
export async function migrateWorld() {
    if (!game.user.isGM) {
        ui.notifications.error("Only the GM can migrate the world");
        return;
    }

    for(let actor of game.actors.entities) {
        migrateEntity(actor);
        actor.items.forEach(item => migrateEntity(item));
    }
    for(let item of game.items.entities) {
        migrateEntity(item);
    }
    for(let compendium of game.packs.entries.filter(pack => !pack.locked)) {
        console.log(`Updating entities in compendium ${compendium.metadata.label}`);
        let entityIds = compendium.index.map(e => e._id);
        entityIds.forEach(async (id) => {
            let entity = await compendium.getEntity(id);
            migrateEntity(entity, async (entity, updateData) => {
                updateData._id = id;
                await compendium.updateEntity(updateData);
            });
        });
    }
    game.settings.set("cyberpunk", "systemMigrationVersion", game.system.data.version);
    ui.notifications.info(`Cyberpunk2020 System Migration to version ${game.system.data.version} completed!`, {permanent: true});
}

const defaultDataUse = async (entity, updateData) => {
    if (!isObjectEmpty(updateData)) {
        await entity.update(updateData);
    }
}
async function migrateEntity(entity, withUpdataData = defaultDataUse) {
    try {
        let migrateDataFunc = updateFuncs[entity.entity];
        if(migrateDataFunc === undefined) {
            console.log(`No migrate function for entity with entity field "${entity.entity}"`);
        }
        const updateData = migrateDataFunc(entity.data);
        withUpdataData(entity, updateData);
    } catch(err) {
        err.message = `Failed cyberpunk system migration for ${entity.data.type} ${entity.name}: ${err.message}`;
        console.error(err);
        return;
    }
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

    if(typeof(data.damage) == "string") {
        console.log("Making damage a number");
        updateData[`data.damage`] = 0;
    }
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

export function migrateItemData(itemData) {
    console.log(`Migrating data of ${itemData.name}`);

    // No need to migrate items currently
    let updateData = {}
    let data = itemData.data;

    if(itemData.type == "weapon") {
        if(!itemData.rangeDamages) {
            console.log(`${itemData.name} has no place to put damages per range. Instantiating those.`);
            updateData["data.rangeDamages"] = game.system.template.Item.weapon.rangeDamages;
        }
    }
    return updateData;
}