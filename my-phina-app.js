// phina.js をグローバル領域に展開
 phina.globalize();

 const ASSETS = {
     image: {
         'tomapiko': './phinajs/assets/images/tomapiko_ss.png',
         'tiles': './pictures/Base_pack/Tiles/tiles_spritesheet.png',
         'bg-main': './pictures/Mushroom_expansion/Backgrounds/bg_grasslands.png'
     },
 };

const BLOCK_SIZE = 70;

phina.define('SpriteSheetWithOffset',{
    //SpriteSheetにoffsetが付いていた時用のSprite
    superClass: 'Sprite',
    init: function(image, width, height, offset){
        this.superInit(image, width, height);
        this.offset = offset || 0;
    },
    setFrameIndex: function(index, width, height) {
        var tw  = width || this._width;      // tw
        var th  = height || this._height;    // th
        var row = ~~(this.image.domElement.width / tw);
        var col = ~~(this.image.domElement.height / th);
        var maxIndex = row*col;
        index = index%maxIndex;
        
        var x = index%row;
        var y = ~~(index/row);
        this.srcRect.x = x* (tw + this.offset);
        this.srcRect.y = y* (th + this.offset);

        

        this.srcRect.width  = tw;
        this.srcRect.height = th;

        this._frameIndex = index;

        return this;

    }
});

phina.define('Block', {
    //とりあえずのブロック．
    //いい感じの画像があったら差し替えたい
     superClass: 'SpriteSheetWithOffset',

     init: function() {
         this.superInit('tiles', 70, 70, 2);
         this.frameIndex = 164;

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
    },
    adjustFrameIndex: function(x, y, data) {
        let neighbours = [[],[],[]];
        //周囲のデータを持つ配列neighboursを作る
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                if(x + i - 1 < 0 || y + j - 1 < 0 || x + i  > data.length || y + j > data[x + i - 1].length) {
                    neighbours[i].push(-1);
                    continue;
                }
                neighbours[i].push(data[x + i - 1][y + j - 1]);
            }
        }

        if(neighbours[1][0] == neighbours[1][1]){
            //上にブロックがあったらcenterを使用
            this.frameIndex = this.frameData.center;
        } else if (neighbours[0][1] == neighbours[1][1] && neighbours[2][1] == neighbours[1][1]) {
            //両脇にブロックがあったらtop_centerを使用
            this.frameIndex = this.frameData.top_center;
        } else if(neighbours[0][1] == neighbours[1][1]) {
            //左側にブロックがあったらtop_rightを使用
            this.frameIndex = this.frameData.top_right;
        } else if(neighbours[2][1] == neighbours[1][1]) {
            //右側にブロックがあったらtop_left
            this.frameIndex = this.frameData.top_left;
        } else if(neighbours[1][2] == neighbours[1][1]) {
            //下にブロックがあったらtop_center（いい画像が無いため）
            this.frameIndex = this.frameData.top_center;
        } else {
            //それも無ければdot
            this.frameIndex = this.frameData.dot;
        }
    },
    frameData: {
        center: 164,
        top_center: 111,
        top_left: 111,
        top_right: 111,
        dot: 9
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
             width:  70,
             height: 110,
             fill: 'rgba(0, 0, 0, 0)',
             stroke: null,
             cornerRadius: 0
         });

         this.sprite = Sprite('tomapiko', 64, 64).addChildTo(this);
         this.sprite.scaleX = this.sprite.scaleY = 2;
         this.sprite.frameIndex = 1;

         this.isPlayer = true;


         //物理演算もどきをつける
         this.physicalBody = PhysicalBody().attachTo(this);
         this.mass = 1.0;
         this.x = options.x || 0;
         this.y = options.y || 0;
         this.dx = options.dx || 0;
         this.dy = options.dy || 0;

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
            dy:this.dy
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
        case 3: return Player({});
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
        //dataに基づいてステージを作成
        for(let y = 0; y < y_columns; y++) {
            for(let x = 0; x < x_columns; x++){
                var item = builder.build(data[x][y]);
                if(item == null) continue;

                item.x = this.gridX.span(x);
                item.y = this.gridY.span(y);
                

                //周囲のデータに合わせて画像を変える必要がある場合ここで変える
                if(!!item.adjustFrameIndex){
                    item.adjustFrameIndex( x, y, data);
                }

                if(!!item.isPlayer) {
                    this.player = item;
                } else {
                    this.addItem(item);
                }
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
    checkNearCliff: function(element){
        const dummy_left = Player(element.omitOptions());
        const dummy_right = Player(element.omitOptions());

        const left_offs = Vector2(-64, 64);
        const right_offs = Vector2(64, 64);

        dummy_left.position.add(left_offs);
        dummy_right.position.add(right_offs);

        return this.checkEarthing(element) && (this.getHitItems(dummy_left).length == 0 || this.getHitItems(dummy_right).length == 0);
    },
    calcDistance: function(elem, item){
        //大体マンハッタン距離にしている
        const x = Math.abs(item.x - elem.x) - (item.width / 2 + elem.width / 2);
        //yの方は中心点を少し下にする
        const y = Math.abs(item.y - elem.y + elem.height / 10) - (item.height / 2 + elem.height / 2);
        return x + y;
    },
    move : function(element){
        //あるエレメントを，当たり判定を考慮しながら動かす
        let near_items = this.children.sort((a, b) => {
                  return this.calcDistance(element, a) - this.calcDistance(element, b);
        });
        const reactable_item_num = 4;
        const scene = this.scene;
        element.move();

        for(let i = 0; i < reactable_item_num; i++) {
            near_items[i].reactTo(element, scene);
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
         this.label.y = this.gridY.span(2); // y 座標
         this.label.fill = '#444'; // 塗りつぶし色

         this.stageManager = StageManager({
             scene: this
         });
         this.stageManager.loadStage(TEST_STAGE);


         this.player = this.stageManager.player;
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
         const stageManager = this.stageManager;
         //initialize （滑ると操作性が悪いので止める）
         player.dx = 0;

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
         width:700,
         height:1050,
         fit: false 
     });

     //appをinitした時点でwidthとheightが決まってしまうので書き換える
     //widthとheightを書かない場合default値になってしまう
     let s = app.canvas.domElement.style;
     s.width = "56vh";
     //高さ方向は，アスペクト比を揃える為に，autoを使っている．
     //なんか知らんけどautoを指定すると内在サイズという概念にのっとって
     //アス比一定で大きさが変わるらしい
     //kwsk -> http://www6.plala.or.jp/go_west/nextcss/ref/article/calc_v.htm
     s.height = "auto";
     
     app.enableStats();
     // アプリケーション実行
     app.run();
 });
