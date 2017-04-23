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
     init: function(options) {
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

         let stageData = TEST_STAGE;
         if( options.stageData != null) {
             stageData = options.stageData;
         }
         this.stageManager.loadStage(stageData);


         this.player = this.stageManager.player;
         this.player.setGravity(0, 5);

         const button = $("#button");

         button.on("click", () => {
             if(button.attr("value") == "running") {
                 this.retry();
             } else {
                 button.attr("value", "running")
                     .text("リセット");
             }
         });

         this.camera = Camera({
             scene:this
         }).addChildTo(this);

         console.log("GAME START");
     },
     retry: function(){
         //ボタンを戻す
         $("#button").attr("value", "stop").text("スタート");
         this.time = 0;
         this.stageManager.retry();
         this.camera.position.set(0,0);
         this.camera.follow();
     },
     update: function(app) {
         const keyboard = app.keyboard;
         const player = this.player;
         const stageManager = this.stageManager;
         const camera = this.camera;


         this.time += app.ticker.deltaTime;

         //initialize （滑ると操作性が悪いので止める）
         player.dx = 0;

         let vector = phina.geom.Vector2(0, 0);
         let jump = false;

         const button = $("#button");

         if(button.attr("value") == "running"){
             const start_block = workspace.getBlockById("START");
             //BlocklyのNameSpaceの初期化
             Blockly.JavaScript.init(workspace);
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
             player.die(); //for debbug
         }

         if(keyboard.getKeyDown('left')){
             camera.x += 70;
         }
         if(keyboard.getKeyDown('right')){
             camera.x += -70;
         }
         if(keyboard.getKeyDown('up')) {
             camera.y += 70;
         }

         if( jump === true){
             if(this.stageManager.checkEarthing(player) == true) {
                 player.dy = -70;
             }
         }

         if(keyboard.getKeyDown('down')){
             camera.y += -70;
         }


         stageManager.move(player);

         if(button.attr("value") == "running") {
             this.camera.follow();
         }
         //ステージの高さより上にいたら死亡する
         if(player.y > stageManager.stageData.height + player.height){
             player.die();
         }
     }
 });

