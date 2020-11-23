browser.contextMenus.create({
    id: "oii-open-tab",
    title: "Open tab in incognito mode",
    contexts: ["tab"],
});
browser.contextMenus.create({
    id: "oii-open-page",
    title: "Open page in incognito mode",
    contexts: ["page"],
});
browser.contextMenus.create({
    id: "oii-open-link",
    title: "Open link in incognito mode",
    contexts: ["link"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if ((info.menuItemId === "oii-open-tab" || info.menuItemId === "oii-open-page") && tab?.url) {
        openUrlInIncognito(tab.url)
            .catch(error => console.warn("Error opening tab in incognito: " + error));
    }
    if (info.menuItemId === "oii-open-link") {
        const url = info.linkUrl ?? "";
        openUrlInIncognito(url)
            .catch(error => console.warn("Error opening link in incognito: " + error));
    }
});

browser.browserAction.onClicked.addListener(async (tab) => {
    if (tab?.url)
        await openUrlInIncognito(tab.url)
            .catch(error => console.warn("Error opening this in incognito: " + error));
});

const openUrlInIncognito = async (url) => {
    let iWindow;
    try {
        const gettingAll = await browser.windows.getAll({windowTypes: ["normal"]});
        iWindow = gettingAll?.find(win => win.incognito)
        if (!iWindow) {
            iWindow = await browser.windows.create({incognito: true});
        }
    } catch (e) {
        throw "Cannot find or open incognito window -- " + e;
    }
    if (iWindow) {
        try {
            const iTab = await browser.tabs.create({
                windowId: iWindow.id,
                active: true,
                url
            });
        } catch (e) {
            throw "Cannot open incognito tab -- " + e;
        }
    } else {
        throw "No incognito window found";
    }
}
