import { properCase, replaceIn } from "./utils.js"

const templatePath = "systems/cyberpunk2020/templates/";
export function registerHandlebarsHelpers() {
    Handlebars.registerHelper('properCase', properCase);
    Handlebars.registerHelper('cLocal', function(str) {
        return game.i18n.localize("CYBERPUNK." + str);
    })
    Handlebars.registerHelper('localizeStat', function(str) {
        return "CYBERPUNK." + properCase(str);
    })
    Handlebars.registerHelper('equals', function(x, y) {
        return x === y;
    })

    // Repeat what's inside it X times. i starts at 1, ends at amount.
    // Useful for testing the damage track. Use as, for example, {{#repeat 4}}whatyouwanttorepeat{{/repeat}}
    Handlebars.registerHelper("repeat", function(amount, options) {
        var result = "";
        for (var i = 1; i <= amount; i++) {
            result = result + options.fn({i: i});
        }
        return result;
    });
    Handlebars.registerHelper("concat", function() {
        let result = "";
        //Skip the last argument.
        for(var i = 0; i < arguments.length - 1; ++i) {
            result += arguments[i];
        }
        return result;
    });
    Handlebars.registerHelper("skillRef", function(skill) {
        return "CYBERPUNK.Skill" + skill;
    });
    // Woundstate: 0 for light, 1 for serious, etc
    // It's a little unintuitive, but handlebars loops start at 0, and that's our first would state
    // Damage: How much damage the character has taken. Actor.data.data.damage.
    // Provides within its context classes, and the current wound
    Handlebars.registerHelper("damageBoxes", function(woundState, damage, options) {
        const woundsPerState = 4;
        const previousBoxes = woundState * woundsPerState;
        let ret = [];
        for(let boxNo = 1; boxNo <= woundsPerState; boxNo++) {
            let thisWound = previousBoxes + boxNo;
            let classes = `damage dmg${thisWound}`;
            if(boxNo === 1) {
                classes += " leftmost"
            }
            else if (boxNo === woundsPerState) {
                classes += " rightmost"
            }
    
            if(damage >= thisWound) {
                classes += " filled"
            }
            else { classes += " unfilled" }
            // When the wound box is filled, make clicking it again essentially "deselect" that wound
            if(damage == thisWound) {
                thisWound -= 1;
            }
            ret += options.fn({classes: classes, woundNo: thisWound});
        }
        return ret;
    });

    Handlebars.registerHelper("template", function(templateName) {
        return templatePath + templateName + ".hbs";
    });

    // eg. {{> (replaceIn "systems/cyberpunk2020/templates/path/to/a-partial-[VAR]" foo)}}
    Handlebars.registerHelper("replaceIn", replaceIn);
    // eg. {{> (cpTemplate "path/to/static-partial.hbs")}}
    Handlebars.registerHelper("cpTemplate", function(path) {
        return templatePath + path;
    });
    // eg. {{> (varTemplate "path/to/[VAR]-partial.hbs" foo)}}
    Handlebars.registerHelper("varTemplate", function(path, replaceWith) {
        return templatePath + replaceIn(path, replaceWith);
    });

    Handlebars.registerHelper("deepLookup", function(context, path) {
        let current = context;
        path.split(".").forEach(segment => {
            current = current[segment];
        });
        return current;
    });

    /** Display array of localizable strings, in short if possible
     * For each string, will look it up as a localization, with "Short" appended if possible, then join with "|"
    **/
    Handlebars.registerHelper("displayArray", function(array) {
        return array.map(e => {
            let makeShort = game.i18n.translations.CYBERPUNK[e + "Short"] !== undefined;
            let key = "CYBERPUNK."+(makeShort ? e + "Short" : e)
            return game.i18n.localize(key);
        }).join("|");
    });
}