// phina.js をグローバル領域に展開
 phina.globalize();

 var ASSETS = {
     image: {
         'tomapiko': 'http://cdn.rawgit.com/phi-jp/phina.js/v0.1.1/assets/images/tomapiko.png',
     },
 };

 const BLOCK_SIZE = 64;

 phina.define('Block', {
     superClass: 'RectangleShape',

     init: function() {
         this.superInit({
             width: BLOCK_SIZE,
             height: BLOCK_SIZE,
             fill: 'hsl(100, 80%, 60%)',
             stroke: null,
             cornerRadius: 8,
         });
     },
 });

 phina.define('Player',{
     superClass: 'RectangleShape',
     init: function() {
         this.superInit({
             width: 80,
             height: 100,
             fill: 'rgba(0, 0, 0,0)',
             stroke: null,
             cornerRadius: 0,
         });
         this.gazo = Sprite('tomapiko').addChildTo(this);
         this.gazo.width = this.gazo.height = 128;
     }
 });

 phina.define('BlockManager',{
     superClass: 'DisplayElement',
     init: function(){
         this.superInit();
         this._totalx = 0;
     },
     _accessor:{
         totalx:{
             get:function(){
                 return this._totalx;
             },
             set:function(v){
                 this._totalx = v;
                 var po = this._totalx;
                 this.children.forEach(function(block,index){
                     block.x = block.x + po;
                 });

             }
         }
     }
 });

 // MainScene クラスを定義
 phina.define('MainScene', {
     superClass: 'DisplayScene',
     init: function() {
         this.superInit({
             width:640,
             height:960
         });
         // 背景色を指定
         this.backgroundColor = '#444';
         // ラベルを生成
         this.label = Label('Hello, phina.js!').addChildTo(this);
         this.label.x = this.gridX.center(); // x 座標
         this.label.y = this.gridY.center(); // y 座標
         this.label.fill = 'white'; // 塗りつぶし色

         this.group = BlockManager().addChildTo(this);
         console.log(this.group.totalx);
         var block = Block().addChildTo(this.group);
         block.setPosition(400,700);
         Block().addChildTo(this.group).setPosition(300,200);

         var tomapiko = Player().addChildTo(this);

         var day = new Date();
         this.random = Random(day.getTime());
         var rand = this.random;
         var star = StarShape().addChildTo(this).setPosition(rand.randint(50,this.width - 50),rand.randint(50,this.height - 150));
         this.star = star;

         tomapiko.setPosition(400,400);
         this.player = tomapiko;
         this.player.pastVector = {x:0.0,y:0.0};
         this.score = 0;
     },

     update: function(app) {
         var keyboard = app.keyboard;

         var gravity = 9.8;
         var vector = this.player.pastVector;
         var groundPos = 100;
         vector.y += 9.8;

         var jump = false;

         if(app.frame % 5 === 0) {
             eval(Blockly.JavaScript.workspaceToCode(workspace));
         }


         if(keyboard.getKey('left')){
             vector.x -= 8;
         }
         if(keyboard.getKey('right')){
             vector.x += 8;
         }
         if(keyboard.getKeyDown('up') || jump === true){
             vector.y = -100;
         }
         if(keyboard.getKey('down')){
             vector.y += 8;
         }

         var pos = this.player.position;
         var group = this.group;

         vector.x /= 1.3;

         var totalmove = false;
         if(pos.x + vector.x < 100) {
             totalmove = true;
         }
         else if(pos.x + vector.x > this.width - 100){
             totalmove = true;
         }

         if(pos.y + vector.y > this.height - groundPos) {
             vector.y = this.height - groundPos - pos.y;
         }

         this.player.moveBy(0,vector.y);
         if(totalmove === true){
             this.group.totalx = -vector.x;
         }else {
             this.player.moveBy(vector.x,0);
         }
         var player = this.player;
         this.group.children.some(function(block){
             let flg = false;
             while(player.hitTestElement(block)){
                 flg = true;
                 player.moveBy(0,-0.01 * vector.y);
             }
             if(flg){
                 vector.y = 0;
             }
         });
         this.player.pastVector = vector;
         if(this.player.hitTestElement(this.star)){
             this.star.setPosition(this.random.randint(50,this.width - 50),this.random.randint(50,this.height - 150));
             this.score += 1;
             this.label.text = "score is: " + this.score + "\n";
         }

     }
 });


 // メイン処理
 phina.main(function() {
     // アプリケーション生成
     var app = GameApp({
         startLabel: 'main', // メインシーンから開始する
         assets: ASSETS,
         domElement: document.getElementById("phinaCanvas"),
         width:640,
         height:960,
         fit: false 
     });

     //appをinitした時点でwidthとheightが決まってしまうので書き換える
     //widthとheightを書かない場合default値になってしまう
     var s = app.canvas.domElement.style;
     s.width = "100%";
     //高さ方向は，アスペクト比を揃える為に，autoを使っている．
     //なんか知らんけどautoを指定すると内在サイズという概念にのっとって
     //アス比一定で大きさが変わるらしい
     //kwsk -> http://www6.plala.or.jp/go_west/nextcss/ref/article/calc_v.htm
     s.height = "auto";
     
     app.enableStats();
     // アプリケーション実行
     app.run();
 });
