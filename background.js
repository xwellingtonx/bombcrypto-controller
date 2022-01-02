chrome.action.onClicked.addListener( tab => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['controller.js']
    })
    .then(() => {
        console.log("Injected controller script.");
    })
    .catch(err => console.log(err));
});