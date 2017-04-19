const TEST_STAGE = {
    height: 1050,
    width: 1050,
    blockSize: 68,
    data: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,1,1,0,0,0,1,1],
        [0,0,0,1,1,0,0,0,0,0,0,0,3,1,1],
        [0,0,0,1,1,0,0,0,0,0,0,0,0,1,1],
        [0,0,0,0,0,0,0,0,1,0,0,0,0,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
        [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,2,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
};

// MainScene クラスを定義
 phina.define('MainScene', {
     superClass: 'DisplayScene',
     //得点（敵が倒せるようにならない場合は削除される）
     score: 0,
     //ボタンを押してからの経過時間になる予定
     time: 0,
     init: function() {
         this.superInit({
             width:700,
             height:1050
         });
         // 背景色を指定
         this.backgroundColor = 'transparent';

         const bg = Sprite('bg-main').setPosition(this.width / 2, this.height / 2).addChildTo(this);
         const bg_aspect = bg.height / bg.width;
         bg.height = this.height;
         bg.width = bg.height / bg_aspect;

         // ラベルを生成

         this.label = Label('かかったじかん：').addChildTo(this);
         this.label.align = 'right';
         this.label.x = this.gridX.span(15); // x 座標
         this.label.y = this.gridY.span(1); // y 座標
         this.label.fill = '#444'; // 塗りつぶし色

         this.stageManager = StageManager({
             scene: this
         });
         this.stageManager.loadStage(TEST_STAGE);


         this.player = this.stageManager.player;
         this.player.setGravity(0, 5);
         

         this.camera = Camera({
             scene:this
         }).addChildTo(this);

         console.log("GAME START");
     },
     retry: function(){
         this.time = 0;
         this.stageManager.retry();
     },
     update: function(app) {
         const keyboard = app.keyboard;
         const player = this.player;
         const stageManager = this.stageManager;


         this.time += app.ticker.deltaTime;

         //initialize （滑ると操作性が悪いので止める）
         player.dx = 0;

         let vector = phina.geom.Vector2(0, 0);
         let jump = false;

         const button = d3.select("#button");

         if(button.attr("value") == "running"){
             const start_block = workspace.getBlockById("START");
             //BlocklyのNameSpaceの初期化
             //Blockly.JavaScript.init(workspace);
             let code = "";
             try {
                 code = Blockly.JavaScript.blockToCode(start_block);
                 eval(code);
             } catch(e){
                 console.log(e);
                 $("#logArea > p").text(e.name + ":" + e.message);
             }
         }

         if(keyboard.getKey('d')){
             player.dead(); //for debbug
         }

         if(keyboard.getKey('left')){
             player.dx = -20;
         }
         if(keyboard.getKey('right')){
             player.dx = 20;
         }
         if(keyboard.getKeyDown('up') || jump === true){

             if(this.stageManager.checkEarthing(player) == true) {
                 player.dy = -70;
             }
         }
         if(keyboard.getKey('down')){
             player.dy += 2;
         }


         stageManager.move(player);
         this.camera.follow();

     }
 });

