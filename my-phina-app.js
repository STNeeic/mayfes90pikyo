// phina.js をグローバル領域に展開
 phina.globalize();

 const ASSETS = {
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

phina.define('ItemBuilder',{
    //stageに配置されるitemを数字に応じて出力するbuilder
    //もっとうまく書けるかもしれない
    init: function(){
    },
    build: function(num){
        switch(num){
        case 0: return null;
        case 1: return Block();
        default: return null;
        }
    }
})

//ステージ上の，ブロックや敵キャラ等を管理するクラス
//ステージ上のアイテムの当たり判定と画像の位置を揃える為に
//このクラスのオブジェクトの位置は*絶対に*(0,0)で固定する．
phina.define('StageManager', {
    superClass: 'DisplayElement',
    init: function(options){
        this.superInit();
        //item全体のずれの初期位置（0になる）
        this._totalx = 0;
        this._totaly = 0;
        //こいつの位置は絶対に(0,0)で固定する（理由は上述）
        this.x = 0;
        this.y = 0;
    },
    addItem: function(v) {
        //子供に登録する際は，最初の位置を覚える必要があるので
        //この関数を用いる．
        v.origX = v.x;
        v.origY = v.y;
        this.addChild(v);
    },
    loadStage: function(stageData) {
        //stageDataを用いて
        const height = stageData.height;
        const width = stageData.width;
        const block_size = stageData.blockSize;
        //データは，data[x][y]という形で入ってる
        const data = stageData.data;

        const x_columns = Math.floor(width / block_size);
        const y_columns = Math.floor(height / block_size);
        //gridについては http://qiita.com/alkn203/items/d176a10d4e38d15e4062 参照のこと
        this.gridX = Grid({
            width: width,
            columns: x_columns,
            offset: Math.ceil(block_size / 2)
        });
        this.gridY = Grid({
            width: height,
            columns: y_columns,
            offset: Math.ceil(block_size / 2)
        });

        const builder = ItemBuilder();
        console.log(x_columns + " " + y_columns);
        //dataに基づいてステージを作成
        for(let y = 0; y < y_columns; y++) {
            for(let x = 0; x < x_columns; x++){
                var item = builder.build(data[x][y]);
                if(item == null) continue;

                item.x = this.gridX.span(x);
                item.y = this.gridY.span(y);
                this.addItem(item);
            }
        }

    },
    _accessor:{
        //子供の位置を全部動かす為のaccesor
        itemX:{
            get:function(){
                return this._totalx;
            },
            set:function(v){
                this._totalx = v;
                this.children.forEach(function(block,index){
                    block.x = block.origX + v;
                });

            }
        },
        itemY:{
            get:function(){
                return this._totalx;
            },
            set:function(v){
                this._totaly = v;
                this.children.forEach(function(block,index){
                    block.y = block.origY + v;
                });

            }
        }
    }
});

const TEST_STAGE = {
    height: 960,
    width: 640,
    blockSize: 64,
    data: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
    ]
};

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

         this.stage = StageManager().addChildTo(this);
         this.stage.loadStage(TEST_STAGE);

         let tomapiko = Player().addChildTo(this);

         //ランダムに星を配置する部分
         const day = new Date();
         this.random = Random(day.getTime());
         const rand = this.random;
         let star = StarShape().addChildTo(this).setPosition(rand.randint(50,this.width - 50),rand.randint(50,this.height - 150));
         this.star = star;

         tomapiko.setPosition(400,400);
         this.player = tomapiko;
         this.player.pastVector = {x:0.0,y:0.0};
         this.score = 0;
     },

     update: function(app) {
         const keyboard = app.keyboard;

         const gravity = 9.8;
         let vector = this.player.pastVector;
         let groundPos = 100;
         vector.y += 9.8;

         let jump = false;

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

         let pos = this.player.position;
         let stage = this.stage;

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
             this.stage.itemX -= vector.x;
         }else {
             this.player.moveBy(vector.x,0);
         }


         let player = this.player;
         this.stage.children.some(function(block){
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
     let app = GameApp({
         startLabel: 'main', // メインシーンから開始する
         assets: ASSETS,
         domElement: document.getElementById("phinaCanvas"),
         width:640,
         height:960,
         fit: false 
     });

     //appをinitした時点でwidthとheightが決まってしまうので書き換える
     //widthとheightを書かない場合default値になってしまう
     let s = app.canvas.domElement.style;
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
