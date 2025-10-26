<template>
<div class="home">
    <div class="home-container">
        <div class="home-content">
            <h1>你在干什么？</h1>
            <p>通过网站，可以让别人知道你在干什么。</p>
            <p>数据可以包含电脑、浏览器、手机这几个维度。</p>
            <div class="feature-table">
                <table>
                    <thead>
                        <tr>
                            <th>平台</th>
                            <th>功能</th>
                            <th>自/手动</th>
                            <th>触发方式</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>电脑端</td>
                            <td>最近活动程序、程序标题、图标、更新时间</td>
                            <td>自动</td>
                            <td>固定时间间隔（默认10分钟）</td>
                        </tr>
                        <tr>
                            <td>浏览器端</td>
                            <td>网站信息、网站标题、无参数URL、更新时间</td>
                            <td>手动</td>
                            <td>点击上传按钮</td>
                        </tr>
                        <tr>
                            <td>安卓端</td>
                            <td>前台应用名称、WiFi信息、电池电量、更新时间</td>
                            <td>自动</td>
                            <td>切换应用时更新</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="todo-description">
                <h2>待办事项</h2>
                <ul>
                    <li>显示steam在线情况（已完成）</li>
                    <li>report命令行->gui（已完成部分功能）</li>
                    <li>应用时间统计（已完成基本功能）</li>
                    <li>定时上传统计数据库（未完成）</li>
                    <li>服务端应用时间统计接口（未完成）</li>
                    <li>前端表格统计（未完成）</li>
                </ul>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
.home {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.home-container {
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    padding: 20px;
}

h1 {
    font-size: 2em;
    margin-bottom: 10px;
}

h2 {
    font-size: 1.5em;
    margin-top: 30px;
    margin-bottom: 10px;
}

h3 {
    font-size: 1.2em;
    margin-top: 20px;
    margin-bottom: 10px;
}

p {
    line-height: 1.6;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

th, td {
    padding: 8px;
    text-align: left;
}

th {
}

tr:nth-child(even) {
}

.feature-table {
    overflow-x: auto;
}

.code-block {
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
}

ul {
    list-style-type: disc;
    padding-left: 20px;
}
</style>