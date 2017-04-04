// phina.js をグローバル領域に展開
 phina.globalize();

 const ASSETS = {
     image: {
         'tomapiko': 'http://cdn.rawgit.com/phi-jp/phina.js/v0.1.1/assets/images/tomapiko.png',
     },
 };

 const BLOCK_SIZE = 64;

phina.define('Block', {
    //とりあえずのブロック．
    //いい感じの画像があったら差し替えたい
     superClass: 'RectangleShape',

     init: function() {
         this.superInit({
             width: BLOCK_SIZE,
             height: BLOCK_SIZE,
             fill: 'hsl(100, 80%, 60%)',
             stroke: null,
             cornerRadius: 8
         });

         //接地可能か
         this.canBeTouched = true;
     },
    reactTo : function(obj, scene){
        //ブロックは接触したオブジェクトに対して反発する．
        //現実にはありえない物理挙動であるが，
        //y方向の速度を完全に吸収し，オブジェクトをy軸方向にどかす．
        //y方向の速度を吸収する都合上，ジャンプする時に「ホップ」する
        //必要がある．（地面が粘着している??）

        //当たってないならすぐ抜ける．
        if(this.hitTestElement(obj) == false) return this;

        const gravity_offs = 5;

        obj.position.sub(obj.physicalBody.velocity);

        // yだけ動かす
        obj.y += obj.dy;

        //当たったら戻してy方向の速度を0にする
        if(this.hitTestElement(obj)){
            if(obj.dy > 0) {
                //top
                obj.y = this.y - this.height / 2 - obj.height / 2 -  gravity_offs;
            } else {
                //bottom
                obj.y = this.y + this.height / 2 + obj.height / 2;
            }
            obj.dy = 0;
        }

        //xだけ動かす
        obj.x += obj.dx;
        //当たったら戻してx方向の速度を0にする
        if(this.hitTestElement(obj)){
            if(obj.dx > 0){
                //left
                obj.x = this.x - this.width / 2 - obj.width / 2;
            } else {
                obj.x = this.x + this.width / 2 + obj.width / 2;
            }
            obj.dx = 0;
        }
        return this;
    }
});


phina.define('PhysicalBody',{
    //updateで衝突判定を呼ぶようにしたPhysicalアクセサリ
    superClass: 'phina.accessory.Physical',
    init: function(){
        this.superInit();
    },
    update: function(){
        //何もしないようにする
    },
    move: function(){
        //ここはPhisicalのパクリ
        var t = this.target;

        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;

        this.velocity.x += this.gravity.x;
        this.velocity.y += this.gravity.y;

        t.position.x += this.velocity.x;
        t.position.y += this.velocity.y;
    }
});

phina.define('Player',{
    //プレイヤーのクラス
    //当たり判定用の四角形が実体で
    //描画されるキャラクター画像を内部に持っている
     superClass: 'RectangleShape',
     init: function(options) {
         this.superInit({
             width: 80,
             height: 118,
             fill: 'rgba(0, 0, 0,0)',
             stroke: null,
             cornerRadius: 0
         });

         this.gazo = Sprite('tomapiko').addChildTo(this);
         this.gazo.width = this.gazo.height = 128;


         //物理演算もどきをつける
         this.physicalBody = PhysicalBody().attachTo(this);
         this.mass = 1.0;
         this.x = options.x || 0;
         this.y = options.y || 0;
         this.dx = options.dx || 0;
         this.dy = options.dy || 0;

         this.stageManager = options.stageManager || null;

     },
    setVelocity: function(x, y){
        //forceがvelocityをセットする関数である
        this.physicalBody.force(x, y);
        return this;
    },
    addForce: function(x, y){
        this.physicalBody.addForce(x/this.mass, y/this.mass);
    },
    setGravity: function(x, y){
        this.physicalBody.setGravity(x, y);
    },
    setVelocityX: function(x){
        var y = this.physicalBody.velocity.y;
        this.physicalBody.force(x, y);
    },
    setVelocityY: function(y){
        var x = this.physicalBody.velocity.x;
        this.physicalBody.force(x, y);
    },
    move: function(){
        this.physicalBody.move();
    },
    omitOptions:function(){
        return {
            x: this.x,
            y: this.y,
            dx:this.dx,
            dy:this.dy,
            stageManager: this.stageManager
        };
    },
    _accessor: {
        dx:{
            get: function(){return this.physicalBody.velocity.x;},
            set: function(v){this.physicalBody.velocity.x = v;}
        },
        dy:{
            get: function(){return this.physicalBody.velocity.y;},
            set: function(v){this.physicalBody.velocity.y = v;}
        }
    }
});



phina.define('Camera', {
    //画面上にplayerを納めるようにうまく調整するクラス
    //こいつがstage_managerのitemXとかplayerの位置をいい感じに動かしてくれる．
    superClass: 'DisplayElement',
    init: function(options) {
        this.superInit();

        this.sceneWidth = options.scene.width || options.sceneWidth;
        this.sceneHeight = options.scene.height || options.sceneHeight;
        this.player = options.scene.player || options.player || null;
        this.stageManager = options.scene.stageManager || options.stageManager || null;


        if(this.player == null || this.stageManager == null){
            console.log("ERROR @ Camera: Cannot set player or stageManager");
        }

        this.addChild(this.player);
        this.addChild(this.stageManager);
    },

    follow: function() {
        //画面中央からのズレを見て，
        //一定範囲内に収まるようにずらす
        var xdiff = this.player.x + this.x - this.sceneWidth / 2;
        var ydiff = this.player.y + this.y - this.sceneHeight / 2;

        //スレッショルドをどこで設定するかは未定
        var left_threthold = 200;
        var right_threthold = 300;

        if(xdiff + left_threthold < 0){
            this.x -= xdiff + left_threthold;
        }
        else if(xdiff - right_threthold > 0) {
            this.x -= xdiff - right_threthold;
        }
    }
});

phina.define('Goal',{
    //ゴールとなるアイテム．
    superClass: 'StarShape',
    init: function(){
        this.superInit();
    },
    reactTo: function(obj, scene){
        if(this.hitTestElement(obj) == true) {
            //ゲームクリア!!

 
            scene.exit();
        }
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
        case 2: return Goal();
        default: return null;
        }
    }
});

phina.define('StageManager', {
    //ステージ上の，ブロックや敵キャラ等を管理するクラス
    //ステージ上のアイテムの当たり判定と画像の位置を揃える為に
    //このクラスのオブジェクトの位置は*絶対に*(0,0)で固定する．

    superClass: 'DisplayElement',
    init: function(options){
        this.superInit();
        //item全体のずれの初期位置（0になる）
        this._totalx = 0;
        this._totaly = 0;
        //こいつの位置は絶対に(0,0)で固定する（理由は上述）
        this.x = 0;
        this.y = 0;
        this.scene = options.scene || null;
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
    getHitItems: function(element){
        //接触しているアイテムの配列を取得する
        var out = [];
        this.children.forEach(function(child){
            if(element.hitTestElement(child) == true) {
                out.push(child);
            }
        });
        return out;
    },
    checkEarthing: function(element){
        //そのelementが接地してるか
        const y_offset =  20;
        return this.children.some(function(item){
            element.y += y_offset;
            if(element.hitTestElement(item)){
                element.y -= y_offset;
                return !!item.canBeTouched;
            };
            element.y -= y_offset;
            return false;
        });
    },
    calcDistance: function(elem, item){
        //elem,itemの幅を考慮し，縦横の長い方の値を返す
        const x = Math.abs(item.x - elem.x) - (item.width / 2 + elem.width / 2);
        //yの方は中心点を少し下にする
        const y = Math.abs(item.y - elem.y + elem.height / 10) - (item.height / 2 + elem.height / 2);
        return Math.abs(x) > Math.abs(y) ? x : y;
    },
    getNearestItem: function(element){
        //引数のエレメントの最も近くにあるオブジェクトを返す
        //今のところ自身も含めているけど含めない方が使い勝手が良さそう（こなみ）
        return this.children.reduce((prev, now) => {
            prev.fill = 'green';
            if(this.calcDistance(prev, element) > this.calcDistance(now, element)) {
                return now;
            } else {
                return prev;
            }
        });
    },
    getSecondNearestItem: function(element){
        const nearest = this.getNearestItem(element);
        return this.children.reduce(function(prev, now){
            if(element.position.distance(prev) > element.position.distance(now)) {
                if(now == nearest) return prev;
                return now;
            } else {
                if(prev == nearest) return now;
                return prev;
            }
        });
    }
    ,
    move : function(element){
        //一個一個のアイテムは，他のアイテムのことを知らない．
        const scene = this.scene;
        let dummy = Player(element.omitOptions());
        let diff = {pos: Vector2(0, 0),
                    d: Vector2(0, 0)};

        //近くにあるアイテム2つをチェックする．
        //これは2つあればコーナーとかも見れることによる
        //ただ大量に見ると，位置の修正が連鎖的に進み異常に動く可能性があるので
        //増やすとしても3こまでだと思う
        const target = this.getNearestItem(element);
        const secondtarget = this.getSecondNearestItem(element);

        element.move();

        target.fill = 'red';
        secondtarget.fill = 'blue';
        target.reactTo(element, scene);
        secondtarget.reactTo(element, scene);
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
    width: 960,
    blockSize: 64,
    data: [
        [0,0,0,0,0,0,0,0,1,1,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,1,1,0,0,0,0,1],
        [0,0,0,1,1,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,1,1,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
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

         this.stageManager = StageManager({
             scene: this
         });
         this.stageManager.loadStage(TEST_STAGE);

         let tomapiko = Player({
             stageManager: this.stageManager
         });

         tomapiko.setPosition(400,400);
         this.player = tomapiko;
         this.player.setGravity(0, 5);
         this.score = 0;

         this.camera = Camera({
             scene:this
         }).addChildTo(this);

         console.log("GAME START");
     },

     update: function(app) {
         const keyboard = app.keyboard;
         const player = this.player;

         let vector = phina.geom.Vector2(0, 0);
         let jump = false;

         const button = d3.select("#button");

         if(button.attr("value") == "running"){
             const start_block = workspace.getBlockById("START");
             try {
                 eval(Blockly.JavaScript.blockToCode(start_block));
             } catch(e){
                 console.log(e);
             }
         }

         player.dx = 0;

         if(keyboard.getKey('left')){
             player.dx = -21.1;
         }
         if(keyboard.getKey('right')){
             player.dx = 21.1;
         }
         if(keyboard.getKeyDown('up') || jump === true){

             if(this.stageManager.checkEarthing(player) == true) {
                 //地面と接触してると地面がねっとりしてて（yのベクトルを0にする）
                 //ジャンプできないので
                 //ちょっと「飛ばして」やっている
                 player.y -= 5;
                 player.dy = -70;
             }
         }
         if(keyboard.getKey('down')){
             player.dy += 2;
         }


         const stageManager = this.stageManager;
         stageManager.move(player);
         this.camera.follow();

     }
 });


 // メイン処理
 phina.main(function() {
     // アプリケーション生成
     let app = GameApp({
         startLabel: 'title', // メインシーンから開始する
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
