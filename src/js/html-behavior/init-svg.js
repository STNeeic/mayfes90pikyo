 let blocklyArea = document.getElementById('blocklyArea');
 let blocklyDiv = document.getElementById('blocklyDiv');
 var workspace = Blockly.inject(blocklyDiv ,
				                        {toolbox: document.getElementById('toolbox'),
                                 scrollbar: true,
                                 trashcan: true});

 var toolbox = workspace.toolbox_;


//localStorageにworkspaceのセーブデータが置いてあったらそれを用いる
if(localStorage.workspace != null) {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(localStorage.workspace), workspace);
} else {
    //初めからstartblockがworkspaceに置いてあるようにする
    Blockly.Xml.domToWorkspace(document.getElementById('startBlock'),
                            workspace);
}

let onchange = function(e) {
    //STARTに繋がってないブロックは透明にしたい
    let all_blocks = workspace.getAllBlocks();
    all_blocks.forEach(b => b.setDisabled(true));

    let blk = workspace.getBlockById("START");

    //STARTに繋がっているブロックを網羅するgenerator
    let blkgen = function* (){
        let b = blk;
        while(b != null){
            yield b;
            let child = b.getChildren();
            if(child.length > 0) yield* child;
            b = b.getNextBlock();
        }
    };
    let gen = blkgen();
    for (let v of gen) {
        v.setDisabled(false);
    }

    //現在のworkspaceをlocalStorageに保存
    localStorage.workspace = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
}

workspace.addChangeListener(onchange);

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
 };

 //resize時に呼ばれるように
 window.addEventListener('resize', onresize, false);
 setTimeout(initsvg, 300);

