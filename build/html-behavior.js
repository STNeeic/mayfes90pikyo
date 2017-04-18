/* 
 * mayfes90pikyo 1.0.0
 * 五月祭のプログラミング教室用のサイト
 * MIT Licensed
 * 
 * Copyright (C) 2017 EEIC, http://eeic.jp
 */


'use strict';

 let blocklyArea = document.getElementById('blocklyArea');
 let blocklyDiv = document.getElementById('blocklyDiv');
 var workspace = Blockly.inject(blocklyDiv ,
				                        {toolbox: document.getElementById('toolbox'),
                                 scrollbar: true,
                                 trashcan: true});

 var toolbox = workspace.toolbox_;


 //初めからstartblockがworkspaceに置いてあるようにする
 Blockly.Xml.domToWorkspace(document.getElementById('startBlock'),
                            workspace);

 let onresize = function(e) {
     //blocklyAreaの位置を計算する
     var element = blocklyArea;
     var x = 0;
     var y = 0;
     do {
         x += element.offsetLeft;
         y += element.offsetTop;
         element = element.offsetParent;
     } while (element);

     // Position blocklyDiv over blocklyArea.
     blocklyDiv.style.left = x + 'px';
     blocklyDiv.style.top = y + 'px';
     blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
     blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';

     const div_w = blocklyArea.offsetWidth;



 };
 let initsvg = function(){
     onresize();
     Blockly.svgResize(workspace);
     let scrollbarDoms = [];
     scrollbarDoms.push.apply(scrollbarDoms, document.getElementsByClassName('blocklyScrollbarVertical'));
     scrollbarDoms.push.apply(scrollbarDoms, document.getElementsByClassName('blocklyScrollbarHorizontal'));
     scrollbarDoms.forEach(dom => dom.setAttribute('display', 'none'));
     scrollbarDoms.forEach(dom => dom.setAttribute('display', 'block'));
     Blockly.svgResize(workspace);
 }
 //resize時に呼ばれるように
 window.addEventListener('resize', onresize, false);
 setTimeout(initsvg, 300);


 $(function(){
     $('a[href^="#"]').click(function(){
         var speed = 300;
         var href= $(this).attr("href");
         var target = $(href == "#" || href == "" ? 'html' : href);
         var position = target.offset().top;
         $("html, body").animate({scrollTop:position}, speed, "swing");
         return false;
     });
 });


 $(function(){
     $('div.menu-trigger').click(function(){
         $('ul.global-nav-list').slideToggle(300);
     });
 });

 $(function(){
     $('a.nav').click(function(){
         $('ul.global-nav-list').slideUp(100);
     });
 });

 $(function(){
     $('a.header-link').click(function(){
         $('ul.global-nav-list').slideUp(100);
     });
 });

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
