document.addEventListener('DOMContentLoaded', function () {
    // 检查用户是否已经同意隐私政策
    chrome.storage.local.get('policyAccepted', function (result) {
        if (!result.policyAccepted) {
            // 用户未同意隐私政策，跳转到隐私政策页面
            window.location.href = 'privacy.html';
            return;  // 停止执行后续代码
        }else {
            // 用户已经同意隐私政策，执行其他逻辑
            console.log('User has already accepted the privacy policy');
        }

        // 用户已同意隐私政策，显示主页面内容
        const toggleArea = document.getElementById('toggle-area');
        const expandedContent = document.getElementById('expanded-content');
        const toggleButton = document.getElementById('toggle-button');

        // 分数显示区域开始加载时显示加载动画，隐藏分数
        document.getElementById('loading-animation').style.display = 'block';
        document.getElementById('grade-display').style.display = 'none';

        // 切换展开/收起内容
        toggleArea.addEventListener('click', function () {
            if (expandedContent.style.display === 'none' || expandedContent.style.display === '') {
                expandedContent.style.display = 'block';
                toggleButton.setAttribute('src', 'picture/up-arrow.png');
            } else {
                expandedContent.style.display = 'none';
                toggleButton.setAttribute('src', 'picture/down-arrow.png');
            }
        });

        // 切换不同的页面部分
        function switchSection(sectionToShow) {
            document.getElementById('report-section').style.display = 'none';
            document.getElementById('history-section').style.display = 'none';
            document.getElementById('analysis-section').style.display = 'none';
            document.getElementById('setting-section').style.display = 'none';

            document.getElementById(sectionToShow).style.display = 'block';
        }

        // 导航栏按钮功能
        document.getElementById('nav-report').addEventListener('click', function () {
            switchSection('report-section');
            console.log('跳转到report-section，历史记录可访问状态是'+ document.getElementById('history-toggle').checked);
            chrome.storage.local.get('historyToggle', function(result) {
                const historyToggleState = result.historyToggle !== undefined ? result.historyToggle : true; // 默认值为 true
                document.getElementById('history-toggle').checked = historyToggleState;
                document.getElementById('history-status').textContent = historyToggleState ? 'On' : 'Off';
        
                // Display/hide history content based on the toggle state
                if (historyToggleState) {
                    document.getElementById('history-content').style.display = 'block';
                    document.getElementById('no-permission-div').style.display = 'none';
                } else {
                    document.getElementById('history-content').style.display = 'none';
                    document.getElementById('no-permission-div').style.display = 'block';
                }
            });
        
        });
//-------------------------------------------------------------------------------------------------------------history-section--------------------------------------------
        document.getElementById('nav-history').addEventListener('click', function () {
            chrome.storage.local.get('historyToggle', function(result) {
                const historyToggleState = result.historyToggle !== undefined ? result.historyToggle : true; // 默认值为 true
                document.getElementById('history-toggle').checked = historyToggleState;
                document.getElementById('history-status').textContent = historyToggleState ? 'On' : 'Off';
        
                // Display/hide history content based on the toggle state
                if (historyToggleState) {
                    document.getElementById('history-content').style.display = 'block';
                    document.getElementById('no-permission-div').style.display = 'none';
                } else {
                    document.getElementById('history-content').style.display = 'none';
                    document.getElementById('no-permission-div').style.display = 'block';
                }
            });

            console.log('跳转到History-section，历史记录可访问状态是'+ document.getElementById('history-toggle').checked);

            switchSection('history-section');

            const historyToggle = $('#history-toggle');
            if (historyToggle.is(':checked')) {
                document.getElementById('history-content').style.display = 'block';
                document.getElementById('no-permission-div').style.display = 'none';

                // 清空已经加载的历史记录，防止重复加载
                clearHistory(); // 调用清除历史记录的函数
                loadHistory(); // 当用户点击历史时加载历史记录
                const searchInput = document.getElementById('search-input');
                searchInput.addEventListener('focus', function() {
                    // 可以添加任何需要在输入框获得焦点时的逻辑
                    console.log('Search input is focused.');
                });
                
                // 当搜索栏失去焦点时（鼠标离开）
                searchInput.addEventListener('blur', function() {
                    console.log('Search input lost focus.');
                    // 失去焦点时恢复加载所有历史记录
                    loadHistory();
                });
                // 搜索栏事件监听器
                document.getElementById('search-input').addEventListener('input', function () {
                    const query = this.value.toLowerCase();  // 获取用户输入的内容
                    
                    if (query) {
                        searchHistory(query);  // 有输入内容时调用搜索函数
                    } else {
                        loadHistory();  // 如果搜索框为空，重新加载所有历史记录
                    }
                });
                //搜索历史记录
                function searchHistory(query) {
                    chrome.storage.local.get('historyData', function (result) {
                        let historyData = result.historyData || [];
                        
                        // 过滤历史记录，检查是否有匹配的记录
                        let filteredHistory = historyData.filter(record => {
                            return (
                                record.pageTitle.toLowerCase().includes(query) ||  // 页面标题匹配查询
                                record.time.includes(query) ||                      // 时间匹配查询
                                record.date.includes(query)                         // 日期匹配查询
                            );
                        });
                
                        // 清空之前的历史记录
                        clearHistory();
                
                        // 如果没有匹配的记录，显示“无匹配历史记录”
                        if (filteredHistory.length === 0) {
                            document.getElementById('no-matching-records').style.display = 'block';  // 显示无匹配记录的提示
                            document.getElementById('history-content').style.display = 'none';


                        } else {
                            document.getElementById('no-matching-records').style.display = 'none';  // 隐藏无匹配记录的提示
                            document.getElementById('history-content').style.display = 'block';


                            
                            // 遍历每一天的记录并显示匹配的历史记录
                            for (let i = 0; i < 7; i++) {
                                const historyDayDiv = document.getElementById(`history-day${i + 1}`);
                                const dayLabel = document.getElementById(`day-label${i + 1}`);
                                const historyItemsContainer = historyDayDiv.querySelector('.history-items');
                
                                // 清空每一天的历史记录容器
                                historyItemsContainer.innerHTML = '';
                
                                // 找出该日期的所有匹配记录
                                const currentDayRecords = filteredHistory.filter(record => record.date === dayLabel.textContent);
                
                                if (currentDayRecords.length > 0) {
                                    // 显示匹配的历史记录
                                    currentDayRecords.forEach(record => {
                                        let historyItem = document.createElement('div');
                                        historyItem.className = 'history-item';
                
                                        let pageIcon = document.createElement('img');
                                        pageIcon.className = 'page-icon';
                                        pageIcon.src = record.iconUrl || 'icon16.png';
                
                                        let pageText = document.createElement('span');
                                        pageText.className = 'history-text';
                                        pageText.textContent = record.pageTitle;
                
                                        let pageTime = document.createElement('span');
                                        pageTime.className = 'history-time';
                                        pageTime.textContent = record.time;
                
                                        historyItem.appendChild(pageIcon);
                                        historyItem.appendChild(pageText);
                                        historyItem.appendChild(pageTime);
                
                                        if (historyItemsContainer) {
                                            historyItemsContainer.appendChild(historyItem);
                                        } else {
                                            // 如果没有容器则创建一个新的容器
                                            const newContainer = document.createElement('div');
                                            newContainer.classList.add('history-items');
                                            newContainer.appendChild(historyItem);
                                            historyDayDiv.appendChild(newContainer);
                                        }
                                    });
                                } else {
                                    // 如果该日期下没有匹配的记录，隐藏该日期
                                    historyDayDiv.style.display = 'none';
                                }
                            }
                        }
                    });
                }
                

                // 添加 clearHistory 函数，用于清空历史记录容器
                function clearHistory() {
                    // 遍历所有历史记录的容器（7天的记录）
                    for (let i = 0; i < 7; i++) {
                        const historyDayDiv = document.getElementById(`history-day${i + 1}`);
                        if (historyDayDiv) {
                            // 找到或创建 .history-items 容器
                            let historyItemsContainer = historyDayDiv.querySelector('.history-items');
                            console.log(historyItemsContainer);  // 检查是否找到了元素
                            if (historyItemsContainer) {
                                historyItemsContainer.innerHTML = '';
                                console.log('清理history-items下的item');
                                
                            } else {
                                console.log('没有找到.history-items元素');
                            }


                        }
                    }
                }

                function loadHistory() {
                    console.log('加载历史记录函数');
                    chrome.storage.local.get('historyData', function (result) {
                        let historyData = result.historyData || [];
                        let historyContainer = document.querySelector('.history-content');
                
                        if (historyData.length === 0) {
                            console.log('没有历史记录');
                        }
                        // 确保 history-section 是可见的
                        const historySection = document.getElementById('history-section');
                        if (historySection) {
                            historySection.style.display = 'block';  // 显示历史记录部分
        

                        }
                
                        // 初始化日期标签，将当前日期往前推7天
                        const today = new Date();
                        for (let i = 0; i < 7; i++) {
                            const currentDay = new Date(today);
                            currentDay.setDate(today.getDate() - i);
                
                            // 获取 day-label 元素
                            const dayLabel = document.getElementById(`day-label${i + 1}`);
                            if (dayLabel) {
                                console.log(`Found element with id day-label${i + 1}`);
                                dayLabel.textContent = currentDay.toISOString().split('T')[0];  // 格式化日期为YYYY-MM-DD
                            } else {
                                console.warn(`Element with id day-label${i + 1} not found`);
                            }
                
                            // 获取历史记录容器
                            const historyDayDiv = document.getElementById(`history-day${i + 1}`);
                            let historyItemsContainer = historyDayDiv.querySelector('.history-items');
                            
                            // 如果没有找到容器，创建一个新的存放历史记录的容器
                            if (!historyItemsContainer) {
                                const newContainer = document.createElement('div');
                                newContainer.classList.add('history-items');
                                historyDayDiv.appendChild(newContainer);
                                historyItemsContainer = newContainer; // 将新创建的容器赋值给 historyItemsContainer
                            }
                
                            // 清空历史记录
                            historyItemsContainer.innerHTML = '';
                
                            // 填充当天的历史记录
                            let dayString = currentDay.toISOString().split('T')[0];
                            let groupedHistory = historyData.filter(item => item.date === dayString);
                
                            if (groupedHistory.length > 0) {
                                groupedHistory.forEach(record => {
                                    let historyItem = document.createElement('div');
                                    historyItem.className = 'history-item';
                
                                    let pageIcon = document.createElement('img');
                                    pageIcon.className = 'page-icon';
                                    pageIcon.src = record.iconUrl || 'icon16.png';
                
                                    let pageText = document.createElement('span');
                                    pageText.className = 'history-text';
                                    pageText.textContent = record.pageTitle;
                
                                    let pageTime = document.createElement('span');
                                    pageTime.className = 'history-time';
                                    pageTime.textContent = record.time;
                
                                    historyItem.appendChild(pageIcon);
                                    historyItem.appendChild(pageText);
                                    historyItem.appendChild(pageTime);
                
                                    historyItemsContainer.appendChild(historyItem); // 将记录添加到容器中
                                });
                            } else {
                                dayLabel.style.display = 'none';
                            }
                        }
                    });
                }


            } else {
                document.getElementById('history-content').style.display = 'none';
                document.getElementById('no-permission-div').style.display = 'block';
                //显示用户没有打开History Record，将不会调用后台历史记录数据


            }

            
        });

        document.getElementById('nav-analysis').addEventListener('click', function () {
           //reset the history=toggle
            chrome.storage.local.get('historyToggle', function(result) {
                const historyToggleState = result.historyToggle !== undefined ? result.historyToggle : true; // 默认值为 true
                document.getElementById('history-toggle').checked = historyToggleState;
                document.getElementById('history-status').textContent = historyToggleState ? 'On' : 'Off';
        
                // Display/hide history content based on the toggle state
                if (historyToggleState) {
                    document.getElementById('history-content').style.display = 'block';
                    document.getElementById('no-permission-div').style.display = 'none';
                } else {
                    document.getElementById('history-content').style.display = 'none';
                    document.getElementById('no-permission-div').style.display = 'block';
                }
            });
            console.log('跳转到analysis-section，历史记录可访问状态是'+ document.getElementById('history-toggle').checked);
            switchSection('analysis-section');
            calculateScores();
            calculateDailyAverages(); // Calculate daily averages when viewing analysis section
            calculatetype_show_most();
            //
            const checkhistoryToggle = document.getElementById('history-toggle').checked;
            // Analysis display results after setting history records to be inaccessible
            if (!checkhistoryToggle) {
                console.log("设置文字");
                // 设置 most-type 和 most-type-expaned 为 'NAN' 并改变颜色为红色
                document.getElementById('most-type').innerHTML = 'NAN';
                document.getElementById('most-type-expaned').innerHTML = 'NAN';
                document.getElementById('most-type').style.color = 'red'; 
                document.getElementById('most-type-expaned').style.color = 'red'; 
            }


        });

        document.getElementById('nav-settings').addEventListener('click', function () {
            console.log('跳转到setting-section，历史记录可访问状态是' + document.getElementById('history-toggle').checked);
        
            // Load the stored toggle state from Chrome local storage
            chrome.storage.local.get('historyToggle', function(result) {
                const historyToggleState = result.historyToggle !== undefined ? result.historyToggle : true; // 默认值为 true
                document.getElementById('history-toggle').checked = historyToggleState;
                document.getElementById('history-status').textContent = historyToggleState ? 'On' : 'Off';
        
                // Display/hide history content based on the toggle state
                if (historyToggleState) {
                    document.getElementById('history-content').style.display = 'block';
                    document.getElementById('no-permission-div').style.display = 'none';
                } else {
                    document.getElementById('history-content').style.display = 'none';
                    document.getElementById('no-permission-div').style.display = 'block';
                }
            });
        
            // Switch to the settings section
            switchSection('setting-section');
        });
        

        

// ------------------------------------------------------------------------------------------------------------Analysis Section---------------------------------------------------------------------------
        function calculateScores() {
            chrome.storage.local.get('historyData', function (result) {
                let historyData = result.historyData || [];
        
                // If there's no history data, exit
                if (historyData.length === 0) {
                    console.log('No history data found');
                    return;
                }
        
                // Sort historyData by grade to find highest and lowest
                historyData.sort((a, b) => {
                    // Compare by grade first
                    if (b.grade !== a.grade) {
                        return b.grade - a.grade; // Sort by descending grade
                    }
                
                    // If grades are the same, compare by date
                    const dateA = new Date(`${a.date} ${a.time}`);
                    const dateB = new Date(`${b.date} ${b.time}`);
                    return dateB - dateA; // Sort by descending date and time
                });
                
                // Get the most recent highest and lowest scores
                let highestScoreItem = historyData[0];
                let lowestScoreItem = historyData[historyData.length - 1];
        
                // Update the highest score module
                document.querySelector('.highest-score h3').innerHTML = `${highestScoreItem.grade} <small>/100</small>`;
                document.getElementById('highest-score_date').innerHTML = highestScoreItem.date;
        
                const highestScoreElement = document.querySelector('.highest-score p');
                highestScoreElement.innerHTML = ''; // Clear any existing content
                
                // Create the icon element
                const iconImg = document.createElement('img');
                iconImg.src = highestScoreItem.iconUrl  || 'icon16.png'; // Set the icon URL
                iconImg.className = 'page-icon1';
                
                // Create the text node for the page title
                const titleText = document.createTextNode(' ' + highestScoreItem.pageTitle);
                
                // Append the icon and text to the container
                highestScoreElement.appendChild(iconImg);
                highestScoreElement.appendChild(titleText);
        
                // Update the lowest score module
                document.querySelector('.lowest-score h3').innerHTML = `${lowestScoreItem.grade} <small>/100</small>`;
                document.getElementById('lowest-score_date').innerHTML = lowestScoreItem.date;
                
                const lowestScoreElement = document.querySelector('.lowest-score p');
                lowestScoreElement.innerHTML = ''; // Clear any existing content
                
                // Create the icon element
                const iconImg1 = document.createElement('img');
                iconImg1.src = lowestScoreItem.iconUrl || 'icon16.png'; // Set the icon URL
                iconImg1.className = 'page-icon1';
                
                // Create the text node for the page title
                const titleText1 = document.createTextNode(' ' + lowestScoreItem.pageTitle);
                
                // Append the icon and text to the container
                lowestScoreElement.appendChild(iconImg1);
                lowestScoreElement.appendChild(titleText1);
            });
        }
        
        //most type
        function calculatetype_show_most() {
            chrome.storage.local.get('historyData', function (result) {
                let historyData = result.historyData || [];
                
                let categoryCount = {
                    'Hard News': 0,
                    'Soft News': 0,
                    'Sports News': 0,
                    'Business News': 0,
                    'Health News': 0
                };
                
                let totalCount = 0;
        
                // 统计每个新闻类型的数量
                historyData.forEach(record => {
                    if (record.type && categoryCount.hasOwnProperty(record.type)) {
                        categoryCount[record.type]++;
                        totalCount++;
                    }
                });
        
                // 计算每个新闻类型的百分比
                let percentages = {};
                for (let type in categoryCount) {
                    percentages[type] = ((categoryCount[type] / totalCount) * 100).toFixed(2);
                }
                let mostViewed = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b);
        
                // 更新最常查看的新闻类型
                if(categoryCount['Health News']==0 && categoryCount['Business News']==0 && categoryCount['Sports News'] ==0 && categoryCount['Soft News']==0 && categoryCount['Hard News']==0){
                    document.getElementById('most-type').innerHTML = 'NAN';
                    document.getElementById('most-type-expaned').innerHTML = 'NAN';
                }else{
                    document.getElementById('most-type').innerHTML = mostViewed;
                    document.getElementById('most-type-expaned').innerHTML = mostViewed;
                }
                //new code-yuyi
                if(document.getElementById('history-toggle').checked = false){
                    document.getElementById('most-type').innerHTML = 'NAN';
                    document.getElementById('most-type-expaned').innerHTML = 'NAN';
                }
                
                
                switch(document.getElementById('most-type').innerHTML) {
                    case 'Hard News':
                        console.log('COLOR：Hard News');
                        document.getElementById('most-type').style.color = '#855DFD'; // Purple
                        break;
                    case 'Soft News':
                        document.getElementById('most-type').style.color = '#FFFF3E'; // Yellow
                        break;
                    case 'Sports News':
                        document.getElementById('most-type').style.color = '#FE7DB3'; // Pink
                        break;
                    case 'Business News':
                        document.getElementById('most-type').style.color = '#FFA497'; // Red
                        break;
                    case 'Health News':
                        document.getElementById('most-type').style.color = '#81E5FE'; // Cyan
                        break;
                    default://defualt no record
                        document.getElementById('most-type').style.color = '#FF0000'; // red
                        break;
                }

                switch(mostViewed) {
                    case 'Hard News':
                        console.log('COLOR：Hard News');
                        document.getElementById('most-type-expaned').style.color = '#855DFD'; // Purple
                        break;
                    case 'Soft News':
                        document.getElementById('most-type-expaned').style.color = '#FFFF3E'; // Yellow
                        break;
                    case 'Sports News':
                        document.getElementById('most-type-expaned').style.color = '#FE7DB3'; // Pink
                        break;
                    case 'Business News':
                        document.getElementById('most-type-expaned').style.color = '#FFA497'; // Red
                        break;
                    case 'Health News':
                        document.getElementById('most-type-expaned').style.color = '#81E5FE'; // Cyan
                        break;
                    default:
                        document.getElementById('most-type-expaned').style.color = '#FF0000'; // red
                        break;
                }
        
                // 更新每个新闻类型的记录数和百分比
                updateRecord('Hard News', categoryCount['Hard News'], percentages['Hard News']);
                updateRecord('Soft News', categoryCount['Soft News'], percentages['Soft News']);
                updateRecord('Sports News', categoryCount['Sports News'], percentages['Sports News']);
                updateRecord('Business News', categoryCount['Business News'], percentages['Business News']);
                updateRecord('Health News', categoryCount['Health News'], percentages['Health News']);

                console.log('Hard News'+ categoryCount['Hard News']+"   " +percentages['Hard News']);
                console.log('Soft News'+ categoryCount['Soft News']+"   " +percentages['Soft News']);
                console.log('Sports News'+ categoryCount['Sports News']+"   " +percentages['Sports News']);
                console.log('Business News'+ categoryCount['Business News']+"   " +percentages['Business News']);
                console.log('Health News'+ categoryCount['Health News']+"   " +percentages['Health News']);
        
                // 更新日期范围为最近7天
                let endDate = new Date();
                let startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);
                document.getElementById('date-range').innerHTML = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        
                // 根据新闻占比动态调整球体大小
                // 根据新闻占比动态调整球体大小和隐藏为0%的球体
                const circleElements = document.querySelectorAll('.circle-chart .circle');
                const sizes = [
                    percentages['Hard News'],
                    percentages['Soft News'],
                    percentages['Sports News'],
                    percentages['Business News'],
                    percentages['Health News']
                ];

                // 遍历每个 circle，并根据百分比设置大小或隐藏
                circleElements.forEach((circle, index) => {
                    const size = Math.max(0, sizes[index] * 2);  // 设置最小大小为0
                    if (size > 0) {
                        circle.style.width = `${size}px`;
                        circle.style.height = `${size}px`;
                        circle.style.display = 'block';  // 显示球体
                
                        // 让球体相切，设置负的 margin-left 为球体半径的负值
                        if (index > 0) {
                            const previousSize = Math.max(0, sizes[index - 1] * 2);
                            circle.style.marginLeft = `-${Math.min(size, previousSize) / 2}px`;  // 使得两个球的边缘相切
                        } else {
                            circle.style.marginLeft = '0';  // 第一个球不需要 margin-left
                        }
                    } else {
                        circle.style.display = 'none';   // 隐藏大小为0的球体
                    }
                });

            });
        }
        
        function updateRecord(type, count, percentage) {
            // 获取所有 record-item 元素
            const recordItems = document.querySelectorAll('.record-item');
        
            // 遍历 record-item 找到包含指定类型的元素
            recordItems.forEach(recordElement => {
                const titleElement = recordElement.querySelector('.record-title');
                
                // 检查 titleElement 的文本是否与传入的 type 相匹配
                if (titleElement && titleElement.textContent === type) {
                    // 更新记录数和百分比
                    recordElement.querySelector('.record-details').textContent = `${count} records`;
                    recordElement.querySelector('.record-percentage').textContent = `${percentage}%`;
                }
            });
        }
        
        

        // average score
        function calculateDailyAverages() {
            chrome.storage.local.get('historyData', function (result) {
                let historyData = result.historyData || [];
                let dailyScores = {};
                let dailyAverages = [];
        
                // Group scores by date
                historyData.forEach(record => {
                    if (!dailyScores[record.date]) {
                        dailyScores[record.date] = [];
                    }
                    dailyScores[record.date].push(record.grade);
                });
        
                // Calculate daily averages
                Object.keys(dailyScores).forEach(date => {
                    let sum = dailyScores[date].reduce((a, b) => a + b, 0);
                    let average = sum / dailyScores[date].length;
                    dailyAverages.push({ date: date, average: average });
                });
        
                // Sort daily averages by date
                dailyAverages.sort((a, b) => new Date(a.date) - new Date(b.date));
        
                // Calculate the overall average score for the week
                let weeklySum = dailyAverages.reduce((acc, day) => acc + day.average, 0);
                let weeklyAverage = (weeklySum / dailyAverages.length).toFixed(1);
        
                // Update the weekly average display
                document.querySelector('.average-score h3').innerHTML = `${weeklyAverage} <small>/100</small>`;
        
                // Draw the chart with daily averages
                drawChart(dailyAverages);
            });
        }

        function drawChart(dailyAverages) {
            var canvas = document.getElementById("averageScoreChart");
            var ctx = canvas.getContext("2d");
            canvas.width = 800;
            canvas.height = 600;
        
            // Extract data and labels from dailyAverages
            var data = dailyAverages.map(item => item.average);
            var labels = dailyAverages.map(item => item.date.slice(5)); // Get MM/DD format
        
            ctx.font = "25px 'Roboto', sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "gray";
        
            const dataPointOffset = 30; // Additional offset for data points
        
            function init() {
                // Draw x and y axes
                ctx.beginPath();
                ctx.moveTo(100, 500);
                ctx.lineTo(100, 100);
                ctx.moveTo(100, 500);
                ctx.lineTo(700, 500);
                ctx.stroke();
        
                // Draw y-axis labels
                for (var i = 0; i <= 10; i++) {
                    ctx.fillText((10 - i) * 10, 80, i * 40 + 107); // Labels from 0 to 100
                }
        
                // Add y-axis title
                ctx.save();
                ctx.translate(35, canvas.height / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText("Average Grade", 0, 0);
                ctx.restore();
        
                // Add x-axis title
                ctx.fillText("Date", canvas.width / 2, canvas.height - 30); // Position at center bottom
            }
        
            function draw() {
                if (data.length === 1) {
                    // Handle case with only one data point
                    var xPos = canvas.width / 2;
                    var yPos = 500 - (data[0] * 4);
        
                    // Draw single point and its label
                    ctx.beginPath();
                    ctx.arc(xPos, yPos, 4, 0, Math.PI * 2, 0);
                    ctx.fillStyle = "black";
                    ctx.fill();
                    ctx.stroke();
        
                    // Draw the value above the point
                    ctx.fillStyle = "#b38b00"; // Yellow-like color
                    ctx.fillText(data[0].toFixed(1), xPos, yPos - 10);
        
                    // Draw the single date label under the x-axis
                    ctx.fillStyle = "black";
                    ctx.fillText(labels[0], xPos, 530);
        
                } else {
                    // Draw the line for multiple data points
                    ctx.beginPath();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "black"; // Change line color to black
                    for (var i = 0; i < data.length; i++) {
                        var xPos = i * (600 / (data.length - 1)) + 100 + dataPointOffset;
                        ctx.lineTo(xPos, 500 - (data[i] * 4)); // Adjust y-position
                    }
                    ctx.stroke();
        
                    // Draw circles for data points and values above them
                    for (var i = 0; i < data.length; i++) {
                        var xPos = i * (600 / (data.length - 1)) + 100 + dataPointOffset;
                        var yPos = 500 - (data[i] * 4);
        
                        // Draw the point
                        ctx.beginPath();
                        ctx.arc(xPos, yPos, 4, 0, Math.PI * 2, 0);
                        ctx.fillStyle = "black";
                        ctx.fill();
                        ctx.stroke();
        
                        // Draw value above the point
                        ctx.fillStyle = "#b38b00"; // Yellow-like color
                        ctx.fillText(data[i].toFixed(1), xPos, yPos - 10); // Move text 10px above the point
        
                        // Draw x-axis labels (dates)
                        ctx.fillStyle = "black";
                        ctx.fillText(labels[i], xPos, 530); // x-axis labels
                    }
                }
            }
        
            init();
            draw();
        }        
        
    });
});
//--------------------------------服务器返回的关于该网页的内容以及相应的处理--------------------------

// 查询当前活动标签页：目的1.使用POST请求将URL发送到我的服务器；目的2：如果返回的
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var currentTabUrl = tabs[0].url;
    var currentTabTitle = tabs[0].title;  // 获取当前标签页的标题
    var currentTabIconUrl = tabs[0].favIconUrl || '';  // 获取页面的图标URL
    // 1.使用POST请求将URL发送到我的服务器,并且获得返回信息
    fetch('https://deco3801-teamcs.uqcloud.net/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentTabUrl }),
    })
    //处理服务器返回的响应
    .then(response => {
        // Save the status code in a variable
        const status = response.status;

        // Check if the response is actually JSON or not
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            return response.json().then(data => ({ status, data })); // Return both status and JSON data
        } else {
            return response.text().then(text => ({ status, text })); // Return both status and text (likely HTML)
        }
    })
    //解析返回的JSON数据
    .then(({ status, data }) => {
        // Log either JSON or text response based on what the server returned
        console.log('Response:', data);
        console.log('Status Code:', status);

        //数据传输回来后，停止动画加载
        document.getElementById('loading-animation').style.display = 'none';
        document.getElementById('grade-display').style.display = 'block';  
        if (status == 500) {
            document.getElementById('grade-display').innerHTML = "There was an error communicating with the 3rdEYE servers. Please try again later.";
        } else {          
            // 判断type是否为undefined
            if (data === undefined || data === null) {
                // type是undefined时，显示提示信息
                document.getElementById('grade-display').innerHTML = 'Please use this plugin or refresh under the specified news page';
                console.log('data is undefined');
            } else {
                var type = data[0][2];
                var news_outlet = data[0][3];
                var news_outlet_details = data[0][4];
                var author = data[0][5];
                var author_details = data[0][6];
                var citations = data[0][7];
                var citations_details = data[0][8];
                var comparison = data[0][9];
                var comparison_details = data[0][10];
                var fact_checking = data[0][11];
                var fact_checking_details = data[0][12];
                var logical_consistency = data[0][13];
                var contradictory_details = data[0][14];
                var tone = data[0][15];
                var tone_details = data[0][16];
                var political = data[0][17];
                var political_details = data[0][18];
            
                var source_credibility = news_outlet + author
                var content_accuracy = citations + comparison + fact_checking
                var content_style = tone + political
                var grade = source_credibility + content_accuracy + logical_consistency + content_style

                // 保存页面信息到历史记录
                savePageToHistory(currentTabIconUrl, currentTabTitle, currentTabUrl, grade, type);
                if (grade < 85) {
                    if (Notification.permission === "granted") {
                        new Notification("WARNING", {
                            body: "Please be careful to discern the credibility of this news content.",
                            icon: "icon48.png"
                        });
                    } else if (Notification.permission !== "denied") {
                        Notification.requestPermission().then(permission => {
                            if (permission === "granted") {
                                new Notification("WARNING", {
                                    body: "Please be careful to discern the credibility of this news content.",
                                    icon: "icon48.png"
                                });
                            }
                        });
                    }
                }

                // 显示评分，并根据评分范围设置颜色
                const gradeDisplay = document.getElementById('grade-value');
                
                if (grade >= 0 && grade <= 45) {
                    gradeDisplay.style.color = 'red'; // 0-45分时显示红色
                    gradeDisplay.innerHTML = `${grade}`;
                } else if (grade >= 46 && grade <= 85) {
                    gradeDisplay.style.color = 'orange'; // 46-85分时显示橙色
                    gradeDisplay.innerHTML = `${grade}`;
                } else if (grade >= 86 && grade <= 100) {
                    gradeDisplay.style.color = '#58D68D'; // 86-100分时显示绿色
                    gradeDisplay.innerHTML = `${grade}`;
                } else {
                    // 如果评分超出范围，显示默认提示
                    gradeDisplay.innerHTML = 'Invalid score';
                }
                
                //Rating Details
                document.getElementById('credibility3').innerHTML = source_credibility
                document.getElementById('accuracy3').innerHTML = content_accuracy
                document.getElementById('consistency3').innerHTML = logical_consistency
                document.getElementById('style3').innerHTML = content_style
                
                document.getElementById('news_outlet').innerHTML = news_outlet_details
                document.getElementById('author').innerHTML = author_details
                document.getElementById('news_outlet_grade').innerHTML = news_outlet
                document.getElementById('author_grade').innerHTML = author
                
                document.getElementById('citations').innerHTML = citations_details
                document.getElementById('comparison').innerHTML = comparison_details
                document.getElementById('fact').innerHTML = fact_checking_details
                document.getElementById('citations_grade').innerHTML = citations
                document.getElementById('comparison_grade').innerHTML = comparison
                document.getElementById('fact_grade').innerHTML = fact_checking

                document.getElementById('contradictory').innerHTML = contradictory_details
                document.getElementById('contradictory_grade').innerHTML = logical_consistency

                document.getElementById('tone').innerHTML = tone_details
                document.getElementById('political').innerHTML = political_details
                document.getElementById('tone_grade').innerHTML = tone
                document.getElementById('political_grade').innerHTML = political

                // Function to open the Source Credibility details
                document.querySelector('.credibility2').addEventListener('click', function() {
                    document.getElementById('modalOverlay1').style.display = 'block';
                    document.getElementById('detailsModal1').style.display = 'block';
                });

                // Function to close the Source Credibility details modal
                document.getElementById('closeBtn1').addEventListener('click', function() {
                    document.getElementById('modalOverlay1').style.display = 'none';
                    document.getElementById('detailsModal1').style.display = 'none';
                });

                document.getElementById('modalOverlay1').addEventListener('click', function() {
                    document.getElementById('modalOverlay1').style.display = 'none';
                    document.getElementById('detailsModal1').style.display = 'none';
                });

                // Function to open the Content Accuracy details
                document.querySelector('.accuracy2').addEventListener('click', function() {
                    document.getElementById('modalOverlay2').style.display = 'block';
                    document.getElementById('detailsModal2').style.display = 'block';
                });

                // Function to close the Content Accuracy details modal
                document.getElementById('closeBtn2').addEventListener('click', function() {
                    document.getElementById('modalOverlay2').style.display = 'none';
                    document.getElementById('detailsModal2').style.display = 'none';
                });

                document.getElementById('modalOverlay2').addEventListener('click', function() {
                    document.getElementById('modalOverlay2').style.display = 'none';
                    document.getElementById('detailsModal2').style.display = 'none';
                });

                // Function to open the Logical Consistency details
                document.querySelector('.consistency2').addEventListener('click', function() {
                    document.getElementById('modalOverlay3').style.display = 'block';
                    document.getElementById('detailsModal3').style.display = 'block';
                });

                // Function to close the Logical Consistency details modal
                document.getElementById('closeBtn3').addEventListener('click', function() {
                    document.getElementById('modalOverlay3').style.display = 'none';
                    document.getElementById('detailsModal3').style.display = 'none';
                });

                document.getElementById('modalOverlay3').addEventListener('click', function() {
                    document.getElementById('modalOverlay3').style.display = 'none';
                    document.getElementById('detailsModal3').style.display = 'none';
                });

                // Function to open the Logical Consistency details
                document.querySelector('.style2').addEventListener('click', function() {
                    document.getElementById('modalOverlay4').style.display = 'block';
                    document.getElementById('detailsModal4').style.display = 'block';
                });

                // Function to close the Logical Consistency details modal
                document.getElementById('closeBtn4').addEventListener('click', function() {
                    document.getElementById('modalOverlay4').style.display = 'none';
                    document.getElementById('detailsModal4').style.display = 'none';
                });

                document.getElementById('modalOverlay4').addEventListener('click', function() {
                    document.getElementById('modalOverlay4').style.display = 'none';
                    document.getElementById('detailsModal4').style.display = 'none';
                });

                // radar chat
                document.getElementById('canvas').style.display = 'block';
                var canvas = document.getElementById("canvas")
                canvas.width = 800
                canvas.height = 800
                var ctx = canvas.getContext("2d")
                var ani = [] //动画效果的起始值数组
                var mouse = {
                    x: 0,
                    y: 0
                }
                var specials = { //用于绘制雷达图的原始数据
                    Credibility: source_credibility/30*100,
                    Accuracy: content_accuracy/35*100, 
                    Consistency: logical_consistency/10*100,
                    Style: content_style/25*100
                }
                canvas.addEventListener("mousemove", function(evt) {
                    mouse.x = evt.x - canvas.offsetLeft
                    mouse.y = evt.y - canvas.offsetTop
                })

                ctx.font = "25px sans-serif"
                for (var j = 0; j < Object.keys(specials).length; j++) { //动画效果值从0开始
                    ani.push(0)
                }

                function drawback(data) { //绘制雷达图背景
                    var count = Object.keys(data).length //计算对象长度
                    for (var j = 0; j <= 5; j++) { //按照每格20的数量绘制同心多边形
                        ctx.beginPath()
                        for (var i = 0; i < count; i++) {
                            ctx.strokeStyle = "gray"
                            ctx.lineWidth = 0.5
                            var r = j * 40
                            var deg = (i / count * 360 - 45) * Math.PI / 180
                            var x = r * Math.sin(deg) + r * Math.cos(deg) + 400
                            var y = r * Math.sin(deg) - r * Math.cos(deg) + 400
                            ctx.lineTo(x, y)
                        }
                        ctx.closePath()
                        ctx.stroke()

                    }
                    ctx.beginPath()
                    var i = 0
                    for (key in data) { //绘制轴线
                        ctx.moveTo(400, 400)
                        r = 200
                        deg = (i * 360 / count - 45) * Math.PI / 180
                        x = r * Math.sin(deg) + r * Math.cos(deg) + 400
                        y = r * Math.sin(deg) - r * Math.cos(deg) + 400
                        ctx.lineTo(x, y)
                        ctx.fillStyle = "green"
                        ctx.fillText(key, x + 5, y + 7) //根据雷达图端点坐标写入属性名
                        i++
                    }
                    ctx.stroke()
                }

                function draw(data) {
                    var count = Object.keys(data).length
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    drawback(data) //重绘底图
                    ctx.beginPath()
                    ctx.lineWidth = 2
                    ctx.strokeStyle = "green"
                    var i = 0
                    for (key in data) { //绘制雷达图
                        if (ani[i] < data[key]) { //判断当前数值是否等于数值
                            ani[i]++
                        }
                        var r = ani[i] / 100 * 200 //根据当前数值计算半径
                        var deg = (i * 360 / count - 45) * Math.PI / 180
                        var x = r * Math.sin(deg) + r * Math.cos(deg) + 400
                        var y = r * Math.sin(deg) - r * Math.cos(deg) + 400
                        ctx.fillStyle = "green"
                        ctx.fillRect(x - 3, y - 3, 6, 6)
                        ctx.lineTo(x, y)
                        i++
                    }
                    ctx.closePath()
                    ctx.fillStyle = "rgba(0,255,0,0.2)"
                    ctx.fill()
                    ctx.stroke()

                }

                function animation() {
                    draw(specials)
                    requestAnimationFrame(animation)
                }
                animation()

            }
        }

    })
    .catch((error) => {
        // Log any errors that occur during the fetch or processing
        console.error('Error:', error);
        document.getElementById('grade-display').innerHTML = "There was an error communicating with the 3rdEYE servers. Please try again later.";
    });


});


// 保存网页信息到 chrome.storage.local
function savePageToHistory(iconUrl, pageTitle, pageUrl,newsGrade,newsType) {
    console.log('进入background.js的savePageToHistory函数');
    chrome.storage.local.get('historyData', function(result) {
        let historyData = result.historyData || [];

        // 获取当前时间
        let currentTime = new Date();
        let timeString = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
        //储存的详细内容
        let newRecord = {
            iconUrl: iconUrl,
            pageTitle: pageTitle,
            pageUrl: pageUrl,
            time: timeString,
            date: currentTime.toISOString().split('T')[0],
            grade: newsGrade, 
            type: newsType    
        };

        // 检查是否已经存在相同的记录（同一日期、相同URL、时间相差小于5分钟）
        let isDuplicate = historyData.some(record => {
            let recordTime = new Date(`${record.date} ${record.time}`);
            let timeDifference = Math.abs(currentTime - recordTime); // 时间差异
            return record.pageUrl === newRecord.pageUrl &&
                   record.date === newRecord.date &&
                   timeDifference < 5 * 60 * 1000; // 检查时间差是否小于5分钟
        });

        if (isDuplicate) {
            console.log('检测到重复记录，跳过保存。');
            return; // 如果是重复记录，则不保存
        }

        // 添加新记录到历史数据
        historyData.push(newRecord);

        // 只保留最近7天的数据
        let sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        historyData = historyData.filter(record => new Date(record.date) >= sevenDaysAgo);

        // 存储更新后的历史记录
        chrome.storage.local.set({historyData: historyData}, function() {
            console.log('历史记录已保存');
        });

    });
}
//----------------------------------------------------------------------------------------------report section------------------------------------------
// Function to open the scoring rubric modal
document.getElementById('AI-right').addEventListener('click', function() {
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('scoringModal').style.display = 'block';
});

// Function to close the scoring rubric modal
document.getElementById('closeBtn').addEventListener('click', function() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('scoringModal').style.display = 'none';
});

document.getElementById('modalOverlay').addEventListener('click', function() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('scoringModal').style.display = 'none';
});

//---------------------------------------------------------------------------------------------Analysis-----------------------------------------------------
// Function to open the average score details
document.getElementById('most-details-link').addEventListener('click', function() {
    document.getElementById('Most-visited').style.display = 'none';
    document.getElementById('Most-visited-expaned').style.display = 'block';
});

// Function to close the average score details modal
document.getElementById('collapseBtn').addEventListener('click', function() {
    document.getElementById('Most-visited').style.display = 'block';
    document.getElementById('Most-visited-expaned').style.display = 'none';
});

// Function to open the average score details
document.getElementById('details-average').addEventListener('click', function() {
    document.getElementById('modalOverlay5').style.display = 'block';
    document.getElementById('detailsModal5').style.display = 'block';
});

// Function to close the average score details modal
document.getElementById('closeBtn5').addEventListener('click', function() {
    document.getElementById('modalOverlay5').style.display = 'none';
    document.getElementById('detailsModal5').style.display = 'none';
});

document.getElementById('modalOverlay5').addEventListener('click', function() {
    document.getElementById('modalOverlay5').style.display = 'none';
    document.getElementById('detailsModal5').style.display = 'none';
});

//----------------------------------------------------------------------setting section-------------------------------------------------

//Setting section

document.addEventListener('DOMContentLoaded', function () {
    const historyToggle = document.getElementById('history-toggle');
    const fontToggle = document.getElementById('font-toggle');
    const themeToggle = document.getElementById('theme-toggle');

    const historyStatus = document.getElementById('history-status'); // 确保元素存在
    const fontStatus = document.getElementById('font-status');
    const themeStatus = document.getElementById('theme-status');

    const linkElement = document.createElement('link'); // 创建一个新的 link 元素
    linkElement.rel = 'stylesheet';
    document.head.appendChild(linkElement); // 将 link 元素添加到 head 中

    // 初始化状态
    historyToggle.checked = true;
    fontToggle.checked = false;
    themeToggle.checked = true;
    updateCSS(); // 初始化加载正确的 CSS 文件
    console.log('初始的setting里历史记录访问权限是'+historyToggle.checked);
    
    // 切换 History Record 状态
    historyToggle.addEventListener('change', function () {
        const isHistoryEnabled = historyToggle.checked;
    
        chrome.storage.local.set({ historyToggle: isHistoryEnabled }, function() {
            console.log('历史记录开关状态已更新:', isHistoryEnabled);
        });
    
        // 检查 historyStatus 是否成功获取并更新状态
        if (historyStatus) {
            historyStatus.textContent = isHistoryEnabled ? 'On' : 'Off';
        } else {
            console.error('historyStatus element not found!');
        }
    
        if (isHistoryEnabled) {
            document.getElementById('history-content').style.display = 'block';  // 显示历史记录内容
            document.getElementById('no-permission-div').style.display = 'none';  // 隐藏“无权限访问历史记录”提示
        } else {
            document.getElementById('history-content').style.display = 'none';  // 隐藏历史记录内容
            document.getElementById('no-permission-div').style.display = 'block';  // 显示“无权限访问历史记录”提示
            document.getElementById('most-type').innerHTML = 'NAN';
            document.getElementById('most-type-expaned').innerHTML = 'NAN';
            document.getElementById('most-type').style.color = 'red'; 
            document.getElementById('most-type-expaned').style.color = 'red'; 
        }
    });

    // 其他切换功能同样需要确保相关元素存在
    fontToggle.addEventListener('change', function () {
        if (fontToggle.checked) {
            fontStatus.textContent = 'On';
        } else {
            fontStatus.textContent = 'Off';
        }
        updateCSS();
    });

    themeToggle.addEventListener('change', function () {
        if (themeToggle.checked) {
            themeStatus.textContent = 'Light';
        } else {
            themeStatus.textContent = 'Night';
        }
        updateCSS();
    });

    // 根据 fontStatus 和 themeStatus 动态切换 CSS
    function updateCSS() {
        if (fontToggle.checked ==  false&& themeToggle.checked == true) {
            linkElement.href = 'popup.css'; // 普通字体 + 亮色主题
        } else if (fontToggle.checked == true && themeToggle.checked == true) {
            linkElement.href = 'bigfront-popup.css'; // 大字体 + 亮色主题
        } else if (fontToggle.checked == false && themeToggle.checked == false) {
            linkElement.href = 'dark_popup.css'; // 普通字体 + 夜间主题
        } else if (fontToggle.checked == true && themeToggle.checked == false) {
            linkElement.href = 'dark_bigfront-popup.css'; // 大字体 + 夜间主题
        }
    }
});

// Function to open the privacy details popuup
    document.getElementById('details-privacy').addEventListener('click', function() {
        document.getElementById('modalOverlay6').style.display = 'block';
        document.getElementById('detailsModal6').style.display = 'block';
    });
    
    // Function to close the privacy details modal
    document.getElementById('closeBtn6').addEventListener('click', function() {
        document.getElementById('modalOverlay6').style.display = 'none';
        document.getElementById('detailsModal6').style.display = 'none';
    });
    
    document.getElementById('modalOverlay6').addEventListener('click', function() {
        document.getElementById('modalOverlay6').style.display = 'none';
        document.getElementById('detailsModal6').style.display = 'none';
    });
// Function to open the help details
document.getElementById('details-help').addEventListener('click', function() {
    document.getElementById('modalOverlay-help').style.display = 'block';
    document.getElementById('detailsModal-help').style.display = 'block';
});

// Function to close the help details modal
document.getElementById('closeBtn-help').addEventListener('click', function() {
    document.getElementById('modalOverlay-help').style.display = 'none';
    document.getElementById('detailsModal-help').style.display = 'none';
});

document.getElementById('modalOverlay-help').addEventListener('click', function() {
    document.getElementById('modalOverlay-help').style.display = 'none';
    document.getElementById('detailsModal-help').style.display = 'none';
});

//Function to open about us page
document.getElementById('about-us-link').addEventListener('click', function() {
    window.open('aboutus.html', '_blank');  // Opens the aboutus.html in a new tab
});

document.getElementById('navigateToAbout').addEventListener('click', function() {
    window.open('aboutus.html', '_blank');  // Opens the aboutus.html in a new tab
});

document.getElementById('navigateToAbout2').addEventListener('click', function() {
    window.open('aboutus.html', '_blank');  // Opens the aboutus.html in a new tab
});

