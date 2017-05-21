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
         this.player.direction = 1;
         this.player.is_walk = false;

         const button = $("#button");

         //onの二度づけ禁止
         button.off("click");
         button.on("click", () => {
             if(button.attr("value") == "running") {
                 this.retry();
             } else {
                 button.attr("value", "running")
                     .text("リセット");
                 //BlocklyのNameSpaceの初期化
                 Blockly.JavaScript.init(workspace);
                 //変数の初期化
                 this.player.variable = 0;
                 this.cursors.hide();
                 this.time = 0;
                 this.score = 0;
                 this.player.is_walk = false;
             }
         });


         this.camera = Camera({
             scene:this
         }).addChildTo(this);

         //uiはここから描画する
         //childrenにいる順に下から描画されるので最後の方がレイヤー的に上の方になる

         this.cursors = Cursors({
             scene:this
         }).addChildTo(this);
         this.cursors.leftArrow.on('click',() => this.cameraMove(1, 0));
         this.cursors.rightArrow.on('click',() => this.cameraMove(-1, 0));
         this.cursors.topArrow.on('click',() => this.cameraMove(0, 1));
         this.cursors.bottomArrow.on('click',() => this.cameraMove(0, -1));

         //脱出ボタンを設置
         this.exitButton = Sprite('exit-icon')
             .setPosition(this.gridX.span(2), this.gridY.span(1))
             .addChildTo(this)
             .setInteractive(true)
             .on('click', () => {
                 this.retry();
                 this.exit();});

         console.log("GAME START");

         //ボタンなどの初期化のため
         this.retry();
     },
     retry: function(){
         //ボタンを戻す
         $("#button").attr("value", "stop").text("スタート");
         this.time = 0;
         this.stageManager.retry();
         this.camera.position.set(0,0);
         this.camera.follow();
         this.cursors.show();
         this.player.is_walk = false;
         this.player.direction = 1;
         this.player.sprite.scaleX = -2;
     },
     next: function() {
         //ボタンを戻す
         $("#button").attr("value", "stop").text("スタート");
         let label = this.stageManager.stageData.label;
         if(!!label) {
             this.exit(
                 {progress:
                  {label: label,
                   result: true}
                  ,score: this.score});
         }
         else {
             this.exit();
         }
     },
     cameraMove: function(x, y) {
         if(this.isValidPos(x, y)) {
             this.camera.position.add(Vector2(x * 70, y * 70));
         }
     },
     isValidPos: function(x, y){
         //block_sizeを基準にして、x,y方向にこのマス分動いたらoutというのを判定する
         let campos = this.camera.position.clone();
         campos.add(Vector2(x * 70, y * 70));
         //動いたときに描画領域がステージ画面の中に収まっているか判定
         return campos.x <= 0 && campos.x + this.stageManager.stageData.width >= this.width
             && campos.y <= 0 && campos.y + this.stageManager.stageData.height >= this.height;
     },
     checkCursors: function(){
         //動けないようならカーソルを消す
         //動けるならカーソルを付けるやつ
         if(this.isValidPos(1, 0)) {
             this.cursors.leftArrow.show();
             this.cursors.leftArrow.setInteractive(true);
         } else {
             this.cursors.leftArrow.hide();
             this.cursors.leftArrow.setInteractive(false);
         }

         if(this.isValidPos(-1, 0)) {
             this.cursors.rightArrow.show();
             this.cursors.rightArrow.setInteractive(true);
         } else {
             this.cursors.rightArrow.hide();
             this.cursors.rightArrow.setInteractive(false);
         }

         if(this.isValidPos(0, 1)) {
             this.cursors.topArrow.show();
             this.cursors.topArrow.setInteractive(true);
         } else {
             this.cursors.topArrow.hide();
             this.cursors.topArrow.setInteractive(false);
         }

         if(this.isValidPos(0, -1)) {
             this.cursors.bottomArrow.show();
             this.cursors.bottomArrow.setInteractive(true);
         } else {
             this.cursors.bottomArrow.hide();
             this.cursors.bottomArrow.setInteractive(false);
         }
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
             let code = "";
             try {
                 code = Blockly.JavaScript.blockToCode(start_block);
                 eval(code);
             } catch(e){
                 console.log(e);
                 $("#logArea").removeClass("hide");
                 $("#logArea > p").text(e.name + ":" + e.message);
             }
         }

         //markerの初期化処理
         player.onMarker = [false, false, false, false, false];

         if(keyboard.getKeyDown('left')){
             this.cameraMove(1, 0);
         }
         if(keyboard.getKeyDown('right')){
             this.cameraMove(-1, 0);
         }
         if(keyboard.getKeyDown('up')) {
             this.cameraMove(0, 1);
         }
         if(keyboard.getKeyDown('down')){
             this.cameraMove(0, -1);
         }

         if( jump === true){
             if(this.stageManager.checkEarthing(player) == true) {
                 player.dy = -70;
             }
         }
         if(player.is_walk == true) {
             player.dx = 20 * player.direction;
         }


         stageManager.move(player);

         if(button.attr("value") == "running") {
             this.camera.follow();
         } else {
             this.checkCursors();
         }
         //ステージの高さより上にいたら死亡する
         if(player.y > stageManager.stageData.height + player.height){
             player.die();
         }
     }
 });
