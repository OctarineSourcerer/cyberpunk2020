// Utility methods that don't really belong anywhere else

export function properCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
};

export function replaceIn(replaceIn, replaceWith) {
    return replaceIn.replace("[VAR]", replaceWith);
}

export function localize(str) {
    return game.i18n.localize("CYBERPUNK." + str);
}

export function shortLocalize(str) {
    let makeShort = game.i18n.translations.CYBERPUNK[str + "Short"] !== undefined;
    let key = "CYBERPUNK."+(makeShort ? str + "Short" : str)
    return game.i18n.localize(key);
}