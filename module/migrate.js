import { getDefaultSkills } from "./utils.js";

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

    for(let actor of game.actors.contents) {
        migrateDocument(actor);
        actor.items.forEach(item => migrateDocument(item));
    }
    for(let item of game.items.contents) {
        migrateDocument(item);
    }
    for(let compendium of game.packs.contents) {
        migrateCompendium(compendium);
    }
    game.settings.set("cyberpunk2020", "systemMigrationVersion", game.system.data.version);
    ui.notifications.info(`Cyberpunk2020 System Migration to version ${game.system.data.version} completed!`, {permanent: true});
}

const defaultDataUse = async (document, updateData) => {
    if (!isObjectEmpty(updateData)) {
        console.log(`Total update data for document ${document.name}:`);
        console.log(updateData);
        await document.update(updateData);
    }
}
async function migrateDocument(document, withUpdataData = defaultDataUse) {
    try {
        let migrateDataFunc = updateFuncs[document.documentName];
        if(migrateDataFunc === undefined) {
            console.log(`No migrate function for entity with documentName field "${document.documentName}"`);
        }
        const updateData = await migrateDataFunc(document.data);
        withUpdataData(document, updateData);
    } catch(err) {
        err.message = `Failed cyberpunk system migration for ${document.data.type} ${document.name}: ${err.message}`;
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
export async function migrateActorData(actorData) {
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
    
    // role skills that we keep
    let roleSkills = [];
    if(data.skills) {
        console.log(`${actorData.name} still uses non-item skills. Removing.`);
        updateData["data.skills"] = undefined;

        // Catalogue role skills with points in them to 
        roleSkills = Object.entries(data.skills)
            .filter((name, skillData) => skillData.isSpecial && (skillData.value > 0 || skillData.chipValue > 0))
            .map(convertOldSkill);
    }
    let skills = actorData.items.filter(item => item.type === "skill");
    const coreSkillsCount = 78;
    if(skills.length < coreSkillsCount) { // Easier way of checking no core skills
        console.log(`${actorData.name} does not have item skills. Adding the core ones!`);
        console.log(`Also adding any role skills you had points in: ${roleSkills.join(", ") || "None"}`);
        const skillsData = (await getDefaultSkills()).map(item => item.toObject());
        const currentItems = Array.from(actorData.items).map(item => item.toObject());
        updateData.items = currentItems.concat(skillsData, roleSkills);
        console.log(updateData["items"]);
    }

    return updateData;
} 

export function migrateItemData(itemData) {
    console.log(`Migrating data of ${itemData.name}`);

    // No need to migrate items currently
    let updateData = {}
    let data = itemData.data;
    let itemTemplates = game.system.template.Item[itemData.type].templates;

    if(itemTemplates?.includes("common") && data.source === undefined) {
        console.log(`${itemData.name} has no source field. Giving it one.`)
        updateData["data.source"] = "";
    }
    if(itemData.type == "weapon") {
        if(!data.rangeDamages) {
            console.log(`${itemData.name} has no place to put damages per range. Instantiating those.`);
            updateData["data.rangeDamages"] = game.system.template.Item.weapon.rangeDamages;
        }
    }
    return updateData;
}

export function migrateCompendium(compendium) {
    if(compendium.locked) {
        console.log(`Not migrating compendium ${compendium.metadata.label}, as it is locked`);
        return
    }
    console.log(`Updating entities in compendium ${compendium.metadata.label}`);
    let entityIds = compendium.index.map(e => e.id);
    entityIds.forEach(async (id) => {
        let entity = await compendium.getEntity(id);
        migrateDocument(entity, async (entity, updateData) => {
            updateData.id = id;
            await compendium.updateEntity(updateData);
        });
    });
}

// Take an old hardcoded skill and translate it into data for a skill item
export function convertOldSkill(name, skillData) {
    return {name: name, type: "skill", data: {
        flavor: "",
        notes: "",
        level: skillData.value || 0,
        chipLevel: skillData.chipValue || 0,
        isChipped: skillData.chipped,
        ip: skillData.ip,
        diffMod: 1, // No skills have those currently.
        isRoleSkill: skillData.isSpecial || false,
        stat: skillData.stat
    }};
}