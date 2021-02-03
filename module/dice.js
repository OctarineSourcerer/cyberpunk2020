export const formulaHasDice = function (formula) {
    return formula.match(/[0-9)][dD]/) || formula.match(/[dD][0-9(]/);
};

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
        dice = "1d10x10",
        parts,
        data,
        title,
        speaker,
        flavor,
        critical = 10,
        fumble = 1,
        chatTemplate,
        chatTemplateData,
    }) {
        // Handle input arguments
        flavor = flavor || title;

        if(parts) {
            parts = [dice, ...parts]
        }
        let roll = new Roll(parts.join(" + "), data).roll();

        // Convert the roll to a chat message
        if (chatTemplate) {
            // Create roll template data
            const d10 = roll.terms[0];
            const rollData = mergeObject(
                {
                    user: game.user._id,
                    formula: roll.formula,
                    tooltip: await roll.getTooltip(),
                    total: roll.total,
                    isCrit: d10.total >= critical,
                    isFumble: d10.total <= fumble,
                    flavor: flavor,
                },
                chatTemplateData || {}
            );

            // Create chat data
            let chatData = {
                user: game.user._id,
                speaker: speaker,
                content: await renderTemplate(chatTemplate, rollData)
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