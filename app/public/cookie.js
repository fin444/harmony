
export function getThingFromCookie(thing) {
    const escapedThing = thing.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(?:^|;\s*)'+escapedThing+'=([^;]*)');
    const match = document.cookie.match(regex);
    console.log("regex match: ", match);
    console.log("Cookie: ", document.cookie);
    return match ? match[1] : null;
}

export function addThingToCookie(thing, value) {
    const escapedThing = thing.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(?:^|;\s*)'+escapedThing+'=([^;]*)');
    const match = document.cookie.match(regex);

    const line = `${thing}=${value};`;

    if (match) {
        String.replace(regex, line);
    } else {
        document.cookie = String.concat(document.cookie, line);
    }
    console.log("Cookie: ", document.cookie);
}

export function clearThingFromCookie(thing) {
    const escapedThing = thing.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(?:^|;\s*)'+escapedThing+'=([^;]*)');
    const match = document.cookie.match(regex);

    const line = `${thing}=${value};`;

    if (match) {
        String.replace(regex, line);
    } else {
        document.cookie = document.cookie.replace(regex[0], "");
    }
    console.log("Cookie: ", document.cookie);
}