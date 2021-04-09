// This is where all the magic values go, because cyberpunk has SO many of those
// Any given string value is the same as its key in the localization file, and will be used for translation

export let weaponTypes = {
    pistol: "Pistol",
    submachinegun: "SMG",
    shotgun: "Shotgun",
    rifle: "Rifle",
    heavy: "Heavy",
    melee: "Melee",
    exotic: "Exotic"
}

// How a weapon attacks. Something like pistol or an SMG have rigid rules on how they can attack, but shotguns can be regular or auto shotgun, exotic can be laser, etc. So this is for weird and special stuff that isn't necessarily covered by the weapon's type or other information
// If we change attack type to be an array, we could say, have ["BEAM" "LASER"]
export let rangedAttackTypes = {
    auto: "Auto",
    // Strange ranged weapons
    paint: "Paint",
    drugs: "Drugs",
    acid: "Acid",
    taser: "Taser",
    dart: "Dart",
    squirt: "Squirt",
    throwable: "Throw",
    archer: "Archer",
    // Beam weapons
    laser: "Laser",
    microwave: "Microwave",
    // Area effect weapons
    shotgun: "Shotgun",
    autoshotgun: "Autoshotgun",
    grenade: "Grenade", // Separate entry from throwable because grenades have different throw distance
    gas: "Gas",
    flamethrow: "Flamethrow",
    landmine: "Landmine",
    claymore: "Claymore",
    rpg: "RPG", // Fired same as with other grenade launchers or shoulder mounts, so not sure if should be here,
    missile: "Missile",
    explosiveCharge: "Explocharge"
}

// This lot's a bit weird, because this is for storing an *item's* attack type, so it doesn't include martial
export let meleeAttackTypes = {
    martial: "Martial",
    mono: "Mono", // Monokatanas, etc
    cyberbeast: "Beast"
}

// There's a lot of these, so here's a sorted one for convenience 
export let sortedAttackTypes = Object.values(rangedAttackTypes).concat(Object.values(meleeAttackTypes)).sort();

// These are preceded by Conceal, as for example, conceal Jacket is in fact supposed to show "Jacket/Coat/Shoulder Rig", so just "Jacket" doesn't make sense
export let concealability = {
    pocket: "ConcealPocket",
    jacket: "ConcealJacket",
    longcoat: "ConcealLongcoat",
    noHide: "ConcealNoHide"
}

export let availability = {
    excellent: "Excellent",
    common: "Common",
    poor: "Poor",
    rare: "Rare"
}

export let reliability = {
    very: "VeryReliable",
    standard: "Standard",
    unreliable: "Unreliable"
}

export let fireModes = {
    fullAuto: "FullAuto",
    threeRoundBurst: "ThreeRoundBurst",
    suppressive: "Suppressive",
    // Really semi auto is any none auto with RoF with more than 1
    semiAuto: "SemiAuto"
}

// Be warned that the localisations of these take a range parameter
export let ranges = {
    pointBlank: "RangePB",
    close: "RangeClose",
    medium: "RangeMedium",
    long: "RangeLong",
    extreme: "RangeExtreme"
}
let rangeDCs = {}
rangeDCs[ranges.pointBlank] = 10;
rangeDCs[ranges.close] = 15;
rangeDCs[ranges.medium] = 20;
rangeDCs[ranges.long] = 25;
rangeDCs[ranges.extreme] = 30;
let rangeResolve = {};
rangeResolve[ranges.pointBlank] = range => 1;
rangeResolve[ranges.close] = range => range/4;
rangeResolve[ranges.medium] = range => range/2;
rangeResolve[ranges.long] = range => range;
rangeResolve[ranges.extreme] = range => range*2;
export { rangeDCs, rangeResolve }

export let defaultTargetLocations = ["Head", "Torso", "lArmShort", "rArmShort", "lLegShort", "rLegShort"]
export let defaultAreaLookup = {
    1: "Head",
    2: "Torso",
    3: "Torso",
    4: "Torso",
    5: "rArm",
    6: "lArm",
    7: "lLeg",
    8: "lLeg",
    9: "rLeg",
    10: "rLeg"
}