// This is where all the magic values go, because cyberpunk has SO many of those
export let weaponTypes = {
    pistol: "P",
    submachinegun: "SMG",
    shotgun: "SHG",
    rifle: "RIF",
    heavy: "HVY",
    melee: "MELEE",
    exotic: "EX"
}

// How a weapon attacks. Something like pistol or an SMG have rigid rules on how they can attack, but shotguns can be regular or auto shotgun, exotic can be laser, etc. So this is for weird and special stuff that isn't necessarily covered by the weapon's type or other information
// If we change attack type to be an array, we could say, have ["BEAM" "LASER"]
export let rangedAttackType = {
    auto: "AUTO",
    // Strange ranged weapons
    paint: "PAINT",
    drugs: "DRUGS",
    acid: "ACID",
    taser: "TASER",
    dart: "DART",
    squirt: "SQUIRT",
    throwable: "THROW",
    archer: "ARCHER",
    // Beam weapons
    laser: "LASER",
    microwave: "MICROWAVE",
    // Area effect weapons
    shotgun: "SHOTGUN",
    autoshotgun: "AUTOSHOTGUN",
    grenade: "GRENADE", // Separate entry from throwable because grenades have different throw distance
    gas: "GAS",
    flamethrow: "FLAMETHROW",
    landmine: "LANDMINE",
    claymore: "CLAYMORE",
    rpg: "RPG", // Fired same as with other grenade launchers or shoulder mounts, so not sure if should be here,
    missile: "MISSILE",
    explosiveCharge: "EXPLOCHARGE"
}

// This lot's a bit weird, because this is for storing an *item's* attack type, so it doesn't include martial
export let meleeAttackType = {
    martial: "MARTIAL",
    mono: "MONO", // Monokatanas, etc
    cyberbeast: "BEAST"
}