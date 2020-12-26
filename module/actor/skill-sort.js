export { SortOrders, sortSkills }

// For now, these are arranged as they are in the book and on other sheets. But it seems a slightly arbitrary order, may change to match topstats, and have those in a sane order too.
// Order to consider stats in for skills. Lower values come first.
const statOrder = {
    "special": 0,
    "body": 1,
    "cool": 2,
    "int": 3,
    "ref": 4,
    "tech": 5
}

const SortOrders = {
    alph: byName,
    stat: byStat
}

function byName([a_name, a_val], [b_name, b_val]) {
    if(a_name > b_name) {
        return 1;
    }
    else if(a_name === b_name) {
        return 0;
    }
    return -1;
}

function byStat([a_name, a_val], [b_name, b_val]) {
    const order_a = statOrder[a_val.stat];
    const order_b = statOrder[b_val.stat];
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
    return Object.entries(skills).sort(sortOrder).reduce(function (result, [key, value]) {
        result[key] = value;
        return result;
    }, {}); 
}