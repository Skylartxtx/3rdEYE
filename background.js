console.log('Background script is running');

chrome.runtime.onInstalled.addListener(() => {
    // 创建右键菜单
    chrome.contextMenus.create({
        id: 'analyzePage',
        title: 'Analyze this page with 3rdEYE',
        contexts: ['page']  // 在网页的右键菜单中显示
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log('右键插件图标');
    if (!tab) {
        console.warn('无法找到活动的标签页');
        return;
    }

    if (info.menuItemId === 'analyzePage') {
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('about://') || tab.url.startsWith('file://')) {
            console.warn('无法在受限页面上执行脚本:', tab.url);
            return;
        }

        // 打开 popup 页面
        openPopup();
    }
});
// 打开 popup 页面，检查是否同意隐私政策
function openPopup() {
    chrome.storage.local.get(['policyAccepted'], function(result) {
        console.log('Privacy-policy的状态是:', result.policyAccepted);
        if (result.policyAccepted) {
            console.log('打开html');
            chrome.action.setPopup({popup: 'popup.html'});  // 将插件图标的弹出页面设置为 popup.html
            chrome.action.openPopup()
        } else {
            chrome.action.setPopup({popup: 'privacy.html'});  // 将插件图标的弹出页面设置为 privacy.html
            chrome.action.openPopup()
        }
    });
}

