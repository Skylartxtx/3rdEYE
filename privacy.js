console.log('进入privacy.js');
document.addEventListener('DOMContentLoaded', function () {
    console.log('进入隐私页面逻辑内部');
    //从 Chrome 的 local storage 中获取键 'policyAccepted' 的值。
    chrome.storage.local.get('policyAccepted', function (result) {
        console.log('privacy.JS-Privacy-policy的状态是:', result.policyAccepted);
        if (result.policyAccepted) {//检查：if user already agree,go to 'popup.html'
            console.log('Enter a wrong page：user has accepte the policy enter popup');
            window.location.href = 'popup.html';
        } else {//in privacy.html untile user agree
            console.log('wait utile user agree');
            const agreeButton = document.getElementById('agree-button');
            if (agreeButton) {
                agreeButton.addEventListener('click', function () {
                    // 保存用户同意的状态到 chrome.storage.local
                    chrome.storage.local.set({ policyAccepted: true }, function() {
                        console.log('privacy:User has accepted the privacy policy');

                        chrome.action.setPopup({popup: 'popup.html'});
                    });

                    // 跳转到 popup.html
                    window.location.href = 'popup.html';
                });
            }
                
        }
    });
});

document.getElementById('navigateToAbout').addEventListener('click', function() {
    window.open('aboutus.html', '_blank');  // Opens the aboutus.html in a new tab
});

document.getElementById('navigateToAbout2').addEventListener('click', function() {
    window.open('aboutus.html', '_blank');  // Opens the aboutus.html in a new tab
});
