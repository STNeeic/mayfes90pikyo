//ボタンを押したらBlocklyでゲームを動かすかどうかを切り替える
var button = d3.select("#button");

button.on("click", function(e) {
    if(button.attr("value") === "running") {
        button.attr("value", "stop")
            .text("スタート");
    } else {
        button.attr("value", "running")
            .text("リセット");
    }
});
