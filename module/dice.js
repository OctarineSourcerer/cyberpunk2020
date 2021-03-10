export const BaseDie = "1d10x10"

export const formulaHasDice = function (formula) {
    return formula.match(/[0-9)][dD]/) || formula.match(/[dD][0-9(]/);
};

export const makeD10Roll = function(terms, rollData) {
    if(terms) {
        terms = [BaseDie, ...terms]
    }
    else {
        terms = [BaseDie]
    }
    return new Roll(terms.join(" + "), rollData)
}


export class DiceCyberpunk {
    /**
     * A standardized helper function for managing core Cyberpunk d10 rolls. Initially taken from Pathfinder1 and 5e, and modified
     *
     * @param {Event} event           The triggering event which initiated the roll
     * @param {Array} parts           The dice roll component parts, excluding the initial d10
     * @param {String} dice           The initial d20
     * @param {Actor} actor           The Actor making the d10 roll
     * @param {Object} data           Actor or item data against which to parse the roll. eg can include skillBonus etc? for at skillbonus etc
     * @param {String} title          The dice roll UI window title
     * @param {Object} speaker        The ChatMessage speaker to pass when creating the chat
     * @param {Function} flavor       A callable function for determining the chat message flavor given parts and data
     * @param {Number} critical       The value of d10 result which represents a critical success
     * @param {Number} fumble         The value of d10 result which represents a critical failure
     * @param {Array} extraRolls      An array containing bonuses/penalties for extra rolls
     */
    static async d10Roll({
        title,
        speaker,
        dice = BaseDie,
        terms,
        critical = 10,
        fumble = 1,
        flavor,
        rollData,
        chatTemplate,
        chatTemplateData,
    }) {
        // Handle input arguments
        flavor = flavor || title;

        if(terms) {
            terms = [dice, ...terms]
        }
        let roll = new Roll(terms.join(" + "), rollData).roll();

        // Convert the roll to a chat message
        if (chatTemplate) {
            // Create roll template data
            const d10 = roll.terms[0];
            const fullTemplateData = mergeObject(
                {
                    user: game.user._id,
                    formula: roll.formula,
                    tooltip: await roll.getTooltip(),
                    total: roll.total,
                    isCrit: d10.total >= critical,
                    isFumble: d10.total <= fumble,
                    title: title,
                    flavor: flavor,
                },
                chatTemplateData || {}
            );

            // Create chat data
            let chatData = {
                user: game.user._id,
                speaker: speaker,
                content: await renderTemplate(chatTemplate, fullTemplateData)
            };

            // Send message
            chatData = mergeObject(roll.toMessage({}, { create: false }), chatData);

            await ChatMessage.create(chatData);
        } else {
            await roll.toMessage({
                speaker: speaker,
                flavor: flavor
            });
        }

        return roll;
    }
}

/**
 * This class allows for making multiple rolls in a single action. For example, an attack roll and a damage roll.
 * The API is designed to make sure each roll WILL get an equivalent metadata, so users of Multiroll don't have to make sure to balance the number of rolls they add, and the metadata.
 * 
 * Example:
 *    let bigRoll = new Multiroll("Shootin'");
 *    bigRoll.addRoll(new Roll("1d10+3"), name="Attack");
 *    bigRoll.addRoll(new Roll("1d6+2"), name="Damage");
 *    bigRoll.execute();
 * 
 * Methods can be chained, e.g bigRoll.addRoll(...).addRoll(...)
 */
export class Multiroll {
    constructor(title, flavor="") {
        this.title = title;
        this.flavor = flavor;
        this.rolls = [];
        this.rollMetaData = [];
    }

    /**
     * 
     * @param {Roll} roll A FoundryVTT roll 
     * @param {data} metaData Extra data about the roll (such as name, crit thresholds).
     */
    addRoll(roll, name=undefined, flavor=undefined, critThreshold = 10, fumbleThreshold = 1, extra={}) {
        this.rolls.push(roll);
        this.rollMetaData.push(mergeObject({
            name: name,
            flavor: flavor, 
            critThreshold: critThreshold,
            fumbleThreshold: fumbleThreshold
        }, extra));
        return this;
    }

    /**
     * 
     * @param {*} speaker The speaker on the card for this multiroll
     * @param {string} templatePath Path to the template. eg systems/cyberpunk2020/templates/chat/weapon-roll.hbs
     * Template provided should be one that loops through rolls.
     * Example data provided to the template:
     * {
     *  user,
     *  title,
     *  flavor,
     *  rolls: [
     *      {roll: Roll, name, flavor, isCrit, isFumble, critThreshold, fumbleThreshold}
     *  ],
     *  ...
     * }
     */
    async execute(speaker, templatePath, extraTemplateData={}) {
        this.rolls.forEach(r => {
            if (!r._rolled) {
                r.roll();
            }
        });
        
        const fullTemplateData = mergeObject({
            user: game.user._id,
            title: this.title,
            flavor: this.flavor,
            rolls: this.rolls.map((roll, i) => {
                let metaData = this.rollMetaData[i];
                // Add name, flavor, critThreshold, fumbleThreshold etc. Also add whether crit or fumble.
                return mergeObject(metaData, { 
                    roll: roll,
                    isCrit: roll.terms[0] >= metaData.critThreshold,
                    isFumble: roll.terms[0] >= metaData.fumbleThreshold
                })
            }),
        }, extraTemplateData || {});

        let chatData = {
            user: game.user._id,
            speaker: speaker,
            content: await renderTemplate(templatePath, fullTemplateData)
        };
        await ChatMessage.create(chatData);
        return this;
    }
}