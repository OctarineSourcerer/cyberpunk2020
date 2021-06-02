export { SortOrders, sortSkills }

// For now, these are arranged as they are in the book and on other sheets. But it seems a slightly arbitrary order, may change to match topstats, and have those in a sane order too.
// Order to consider stats in for skills. Lower values come first.
const statOrder = {
    // Don't have one of these be 0, that's falsy
    "role": 1,
    "int": 3,
    "ref": 4,
    "tech": 5,
    "cool": 6,
    "attr": 7,
    "luck": 8,
    "ma": 9,
    "bt": 10,
    "emp": 11,
}

const SortOrders = {
    Name: byName,
    Stat: byStat
}

// To sort hierarchically, break ties (0) with the return of another comparison function
function byName(skillA, skillB) {
    if(skillA.name > skillB.name) {
        return 1;
    }
    else if(skillA.name === skillB.name) {
        return 0;
    }
    return -1;
}

function byStat(skillA, skillB) {
    let searchRank = (skill) => {
        if(skill.data.data.isRoleSkill)
            return statOrder["role"];
        return statOrder[skill.data.data.stat];
    };
    let order_a = searchRank(skillA) || -1;
    let order_b = searchRank(skillB) || -1;
    if(order_a > order_b) {
        return 1;
    }
    else if(order_a === order_b) {
        return 0;
    }
    return -1;
}

/* This would usually be in actor-sheet.js; sorting stats is mostly for UX purposes. But that'd mean creating a sorted version of stats EVERY time the sheet opens. And CP2020 has 89 stats by default; enough for me to not want to do that. So we sort in the actor itself */
// Really just a fancy "sort object", but I've set this module up specifically for actor skills
function sortSkills(skills, sortOrder) {
    if(!sortOrder) {
        console.warn("No sort order given. Returning original skill list");
        return skills;
    }
    let unsorted = skills.slice();
    return unsorted.sort(sortOrder);
}