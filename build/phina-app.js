/* 
 * mayfes90pikyo 1.0.0
 * 五月祭のプログラミング教室用のサイト
 * MIT Licensed
 * 
 * Copyright (C) 2017 EEIC, http://eeic.jp
 */


'use strict';


phina.globalize();
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

        obj.position.sub(obj.physicalBody.velocity);

        // yだけ動かす
        obj.y += obj.dy;

        //当たったら戻してy方向の速度を0にする
        if(this.hitTestElement(obj)){
            if(obj.dy > 0) {
                //top
                obj.y = this.y - this.height / 2 - obj.height / 2;
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
        const left_threthold = 300;
        const right_threthold = 200;

        //x軸
        if(xdiff + left_threthold < 0){
            this.x -= xdiff + left_threthold;
        }
        else if(xdiff - right_threthold > 0) {
            this.x -= xdiff - right_threthold;
        }

        //y軸
        //playerが設置している時は地面が1マス分映るまでずらす
        const y_threthold = [200, 200];
        if(ydiff + y_threthold[0] < 0) {
            this.y -= ydiff + y_threthold[0];
        } else if(ydiff - y_threthold[1] > 0) {
            this.y -= ydiff - y_threthold[1];
        }

        this.holdInGameStage();
    },
    //カメラをゲームステージの中に戻す
    holdInGameStage: function() {
        const stageHeight = this.stageManager.stageData.height;
        const stageWidth = this.stageManager.stageData.width;

        if (this.x > 0) this.x = 0;
        if (this.x + stageWidth < this.sceneWidth) this.x =  this.sceneWidth - stageWidth;
        if (this.y > 0) this.y = 0;
        if (this.y + stageHeight < this.sceneHeight) this.y = this.sceneHeight - stageHeight;
    }
});

phina.define('Cursors',{
    superClass: 'DisplayElement',
    init: function(params){
        this.superInit();
        this.scene = params.scene || null;
        let arrow_num = 4;
        if(params.direction == "horizontal"){
            arrow_num = 2;
        }

        const scene = this.scene;

        for(let i = 0; i < arrow_num; i++) {
            let arrow = Sprite('arrows', 64, 64).addChildTo(this);
            arrow.frameIndex = 1;
            arrow.scaleX = arrow.scaleY = 1.5;
            const OFFS = 32 * arrow.scaleX;
            arrow.setInteractive(true);

            if(i < 2) {
                let offs_x = i == 0 ? OFFS : scene.width - OFFS;
                if(i == 0){
                    arrow.scaleX *= -1;
                    this.leftArrow = arrow;
                } else {
                    this.rightArrow = arrow;
                }
                arrow.setPosition(offs_x , scene.gridY.center());
            } else {
                let offs_y = i == 2 ? OFFS : scene.height - OFFS;
                if(i == 2) {
                    arrow.rotation = 270;
                    this.topArrow = arrow;
                } else {
                    arrow.rotation = 90;
                    this.bottomArrow = arrow;
                }
                arrow.setPosition(scene.gridX.center(), offs_y);
            }
        }
    },
    update: function(app){
        if(app.frame % 10 == 0)
        this.children.forEach(arrow => arrow.frameIndex = (arrow.frameIndex + 3) % 3 + 1);
    }
});

phina.define('FrameAnimationWithState', {
    superClass: 'FrameAnimation',
    init: function(ss){
        this.superInit(ss);
        this._state = "";
        this._prevState = "";
    },
    setup: function(params){
        this.ss = SpriteSheet().setup(params);
        return this;
    },
    _gotoAndPlay: function(string){
        this.gotoAndPlay(string);
        this._state = string;
    },
    update: function() {
        if(this._prevState != this._state) {
            this._gotoAndPlay(this._state);
            this._prevState = this._state;
        }


        if (this.paused) return ;
        if (!this.currentAnimation) return ;

        if (this.finished) {
            this.finished = false;
            this.currentFrameIndex = 0;
            return ;
        }
           ++this.frame;
        if (this.frame%this.currentAnimation.frequency === 0) {
            ++this.currentFrameIndex;
            this._updateFrame();
        }
    },
    _accessor: {
        "state" :{
            get: function(){ return this._state;},
            set: function(v){ this._state = v;}
        }
    }
});

phina.define('Goal',{
    //ゴールとなるアイテム．
    superClass: 'StarShape',
    firstTime: true,
    init: function(){
        this.superInit();
        this.tweener.by({
            rotation: 360
        }, 3000, "swing").setLoop(true);
    },
    reactTo: function(obj, scene){
        if(this.hitTestElement(obj) == true && this.firstTime == true) {
            //ゲームクリア!!
            ResultBoard(scene).addChildTo(scene);
            this.firstTime = false;
        }
    }
});

phina.define('ItemBuilder',{
    //stageに配置されるitemを数字に応じて出力するbuilder
    //もっとうまく書けるかもしれない
    init: function(){
        //MarkerのcolorIdを取得するため
        this.colorId = Marker().colorId;
    },
    build: function(num){
        switch(num){
        case 0: return null;
        case 1: return Block();
        case 2: return Goal();
        case 3: return Player({});
            //for marker
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
            return Marker(this.colorId[num - 4]);
        case 9: return Needle();

        default: return null;
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
             .on('click', () => this.exit());

         console.log("GAME START");
     },
     retry: function(){
         //ボタンを戻す
         $("#button").attr("value", "stop").text("スタート");
         this.time = 0;
         this.stageManager.retry();
         this.camera.position.set(0,0);
         this.camera.follow();
         this.cursors.show();
     },
     next: function() {
         //ボタンを戻す
         $("#button").attr("value", "stop").text("スタート");
         let label = this.stageManager.stageData.label;
         if(!!label) {
             this.exit(
                 {progress:
                  {label: label,
                   result: true}});
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
         player.onMarker = "";

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


phina.define('Marker', {
    superClass: 'Sprite',
    init: function(color) {
        this.superInit('marker', 70, 70);
        this.color = color || 'skyblue';
        this.frameIndex = this.getColorId();
        this.setInteractive(true);
    },
    //Spriteのmarkerにおける色の並び順
    colorId: ['skyblue', 'green', 'yellow', 'red', 'purple'],
    getColorId: function() {
        //colorに適切なframeIndexを返す関数
        return this.colorId.indexOf(this.color) * 3;
    },
    reactTo: function(obj, scene) {
        if(!this.hitTestElement(obj)) return;
        if(obj.className != "Player") return;

        obj.onMarker = this.color;
        this.frameIndex = this.getColorId() + 1;
        this.tweener.play().wait(500)
            .call(() => {
                this.frameIndex = this.getColorId();
                this.tweener.stop();
            });
    },
    update: function(app){
    }
});

phina.define('Needle', {
    //とりあえずのブロック．
    //いい感じの画像があったら差し替えたい
     superClass: 'Sprite',

     init: function() {
         this.superInit('needle');
         //接地可能か
         this.canBeTouched = false;
     },
    reactTo : function(obj, scene){
        //当たってないならすぐ抜ける．
        if(this.hitTestElement(obj) == false) return this;

        //当たると死ぬ
        if(obj.className == "Player") {
            obj.die();
        }

        return this;
    },
    adjustFrameIndex: function(x, y, data) {
        //周りにブロックがあったらブロックと反対側を向くようにしたい
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


        if(neighbours[1][2] == 1){
            //下にブロックがあったら上向きにする
            this.rotation = 0;
        } else if(neighbours[1][0] == 1){
            //上にブロックがあったら下向きにする
            this.rotation = 180;
        } else if(neighbours[0][1] == 1) {
            //左側にブロックがあったら右を向く
            this.rotation = 90;
        } else if(neighbours[2][1] == 1) {
            //右側にブロックがあったら左を向く
            this.rotation = 270;
        }
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
             height: 120,
             fill: 'rgba(0, 0, 0, 0)',
             stroke: null,
             cornerRadius: 0
         });

         this.sprite = Sprite('tomapiko', 64, 64).addChildTo(this);
         this.sprite.scaleX = this.sprite.scaleY = 2;
         //最初右向きにする
         this.sprite.scaleX *= -1;
         this.sprite.frameIndex = 1;

         //bang_balloon
         //なんか理解したっぽい時に出てくる
         this.bang_balloon = Sprite('bang-balloon').addChildTo(this)
             .setInteractive(false)
             .setPosition(60, -60)
             .hide()
             .on('enterframe', () => {
                 let balloon = this.bang_balloon;
                 balloon.scaleX = this.sprite.scaleX < 0 ? 1 : -1;
                 balloon.setPosition(60 * balloon.scaleX, -60);
             });



         //物理演算もどきをつける
         this.physicalBody = PhysicalBody().attachTo(this);
         this.mass = 1.0;
         this.x = options.x || 0;
         this.y = options.y || 0;
         this.dx = options.dx || 0;
         this.dy = options.dy || 0;

         this.sprite.fa = FrameAnimationWithState().setup(player_ss).attachTo(this.sprite);

         this.setInteractive(true);

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
    understood: function(){
        this.bang_balloon.tweener.play()
            .call(() => this.bang_balloon.show())
            .wait(300)
            .call(() => {
                this.bang_balloon.hide();
                this.bang_balloon.tweener.stop();
            });
    }
    ,
    move: function(){
        this.physicalBody.move();
        //動いてたらその方向に体を向かせる
        if(this.dx < 0){
            this.sprite.scaleX = 2;
        } else if(this.dx > 0) {
            this.sprite.scaleX = -2;
        }


    },
    die: function(){
        this.setInteractive(false);
        this.sprite.fa.state = "dying";
        this.setGravity(0,0);
        this.tweener.play()
            .by({y: -800},800, "easeOutCubic")
            .by({y: 800}, 800, "easeInQuad")
            .wait(1000)
            .call(() => {
                this.setInteractive(true);
                this.setGravity(0,5);
                this.parent.parent.retry();
                this.tweener.stop();
            });
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

phina.define('ResultBoard',{
    //結果表示用のボード
    superClass: 'DisplayElement',
    scene: null,
    init: function(scene) {
        this.superInit();
        this.scene = scene;
        this.setPosition(scene.gridX.center(), scene.gridY.center());
        scene.addChild(this);

        const right_line = 160; //次にいくの「く」の位置に揃うライン

        const board = Sprite('result-board').addChildTo(this);
        const score = Label(scene.score + " 点").addChildTo(this);
        score.setPosition(right_line, 0);
        score.align = 'right';
        score.fontSize = 36;
        const time = this.timeToStr(scene.time);
        const timelabel = Label(time).addChildTo(this);
        timelabel.setPosition(right_line, -110);
        timelabel.align = 'right';
        timelabel.fontSize = 36;

        //当たり判定がずれないようにsceneにaddChildしている
        const l_button = Button({
            text: ""
        }).addChildTo(scene);
        l_button.width = 200;
        l_button.height = 140;
        l_button.setPosition(220,710)
        .on('push', this.retry)
            .on('mouseover', function(e){console.log("L-BUTTON MOUSEOVER");})
            .board = this;
        this.l_button = l_button;

        const r_button = Button({
            text: ""
        }).addChildTo(scene);
        r_button.width = 200;
        r_button.height = 140;
        r_button.setPosition(470,710)
        .on('push', this.next)
            .on('mouseover', function(e){console.log("R-BUTTON MOUSEOVER");})
            .board = this;
        this.r_button = r_button;
           },
    timeToStr: function(time){
        const millsec = Math.floor((time % 1000) / 10);
        let sec = Math.floor((time / 1000) % 60);
        let min = Math.floor(time / 60000);
        min = min > 0 ? min + "分" : "";
        return min + sec+ "秒" + millsec;
    },
    retry:function(e) {
        //この時のthisはl_buttonなので注意!!!
        console.log("RESTART");
        this.parent.retry();
        this.board.removeAll();
    },
    removeAll: function(){
        this.l_button.remove();
        this.r_button.remove();
        this.remove();
    },
    next: function(e){
        console.log("GOTO NEXTSTAGE");
        this.parent.next();
    }
});

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

phina.define('StageManager', {
    //ステージ上の，ブロックや敵キャラ等を管理するクラス
    //ステージ上のアイテムの当たり判定と画像の位置を揃える為に
    //このクラスのオブジェクトの位置は*絶対に*(0,0)で固定する．

    superClass: 'DisplayElement',
    player: null,
    goal: null,
    stageData: null,
    init: function(options){
        this.superInit();
        this.scene = options.scene || null;
    },

    addItem: function(v) {
        //子供に登録する際は，最初の位置を覚える必要があるので
        //この関数を用いる．
        v.startPos = v.position.clone();
        this.addChild(v);
    },

    loadStage: function(stageData) {
        this.stageData = stageData;

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

                if(item.className == "Player") {
                    this.player = item;
                    this.player.startPos = this.player.position.clone();
                } else {
                    if(item.className == "Goal"){
                        this.goal = item;
                    }
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
    checkNearCliff: function(element, direction){
        //左側か右側に足場があるか判定する関数
        const dummy = Player(element.omitOptions());

        let offs = Vector2(70, 70);
        if(direction == 'LEFT') offs.x *= -1;

        dummy.position.add(offs);

        if(this.checkEarthing(element) && this.getHitItems(dummy).length == 0){
            if(element.className == "Player") element.understood();
            return true;
        }
        return false;
    },
    checkNearBlock: function(element, direction) {
        //左隣りまたは右隣りに接触可能なブロックがあるかどうかを判定する関数

        const dummy = Player(element.omitOptions());

        const offs = Vector2(70, 0);
        if(direction == "LEFT") offs.negate();

        dummy.position.add(offs);

        if(this.getHitItems(dummy).some(item => item.canBeTouched)){
            if(element.className == "Player") element.understood();
            return true;
        }
        return false;
    },
    //任意の色のマーカー上にいるか
    isOnAnyMarker: function(element) {
        if(element.onMarker != ""){
            if(element.className == "Player") element.understood();
            return true;
        };
        return false;
    },
    //ある特定の色のマーカー上にいるか
    isOnMarker: function(element, color) {
        if(element.onMarker == color) {
            if(element.className == "Player") element.understood();
            return true;
        }
        return false;
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
        if(!element.interactive){
            //動かないもののはずなので抜ける
            return;
        }
        let near_items = this.children.sort((a, b) => {
                  return this.calcDistance(element, a) - this.calcDistance(element, b);
        });
        const reactable_item_num = 4;
        const scene = this.scene;

        element.move();
        if(!!element.fa || !!element.sprite.fa){
            const fa = element.fa || element.sprite.fa;
                if(!this.checkEarthing(element)) {
                    fa.state = "flying";
                } else {
                    if(Math.abs(element.dx) > 0) {
                        fa.state = "walking";
                    } else {
                        fa.state = "stand";
                    }
                }
        }


        for(let i = 0; i < reactable_item_num; i++) {
            near_items[i].reactTo(element, scene);
        }

    },
    retry: function(){
        this.children.forEach(item => item.position = item.startPos.clone());
        this.player.position = this.player.startPos.clone();
        this.goal.firstTime = true;
    }
});




phina.define('StageSelectScene',{
    superClass: 'DisplayScene',

    init: function(params) {
        this.superInit(params);
        //bgを作成
        Sprite('stageselectbg').setPosition(this.gridX.center(), this.gridY.center()).addChildTo(this);

        const offsY = 50;

        //localStorageからクリア状況を取得
        let progress = {};
        if(!localStorage.progress){
            progress = {};
            localStorage.progress = JSON.stringify(progress);
        } else {
            progress = JSON.parse(localStorage.progress);
        }

        if(!!params.progress) {
            progress[params.progress.label] = params.progress.result;
            localStorage.progress = JSON.stringify(progress);
        }

                //カルーセル形式のアイコンを作成
        let carousel = DisplayElement().addChildTo(this);
        this.carousel = carousel;
        STAGE_DATA.forEach((stage, index) => {
            StageViewItem({
                stageData: stage,
                scene: this,
                progress: !!stage.label ? progress[stage.label] : false
            })
                .setPosition(this.gridX.center() + this.width * index , this.gridY.center() + offsY)
                .addChildTo(carousel);
        });

        //カーソルの設置
        this.cursors = Cursors({
            scene: this,
            direction: "horizontal"
        }).addChildTo(this);

        this.cursors.y += offsY;
        this.cursors.leftArrow.on('click', () => this.goLeft());
        this.cursors.rightArrow.on('click', () => this.goRight());


        carousel.pos = 0;
        //移動したときに配列の範囲外に出ないか調べる
        carousel.isValidPos = direction => carousel.pos + direction >= 0 && carousel.pos + direction < carousel.children.length;
        carousel.checkPosition = () => {
            if(carousel.isValidPos(-1)){
                this.cursors.leftArrow.show();
                this.cursors.leftArrow.setInteractive(true);
            } else {
                this.cursors.leftArrow.hide();
                this.cursors.leftArrow.setInteractive(false);
            }

            if(carousel.isValidPos(1)) {
                this.cursors.rightArrow.show();
                this.cursors.rightArrow.setInteractive(true);
            } else {
                this.cursors.rightArrow.hide();
                this.cursors.rightArrow.setInteractive(false);
            }
        };

        carousel.checkPosition();

        //ボタンを押したらその時中央にいたステージのデータを読み込むようにする
        $("#button").off("click");
        $("#button").on("click", () => {
            carousel.children[carousel.pos].exit();
        });

    },
    update: function(app) {
        const keyboard = app.keyboard;
        const carousel = this.carousel;
        if(keyboard.getKeyDown('left')){
            if(carousel.isValidPos(-1)){
                this.goLeft();
            }
       }
        if(keyboard.getKeyDown('right')){
            if(carousel.isValidPos(1)){
                this.goRight();
            }
        }

    },
    goLeft: function() {
        this.carousel.tweener.moveBy(this.width, 0, 500, "easeInOutQuint")
            .play();
        this.carousel.pos -= 1;
        this.carousel.checkPosition();
    },
    goRight: function() {
        this.carousel.tweener.moveBy( -1 * this.width, 0, 500, "easeInOutQuint")
            .play();
        this.carousel.pos += 1;
        this.carousel.checkPosition();
    }
});

phina.define('StageViewItem', {
    superClass:'DisplayElement',

    init: function(params) {
        this.superInit(params);
        //枠となる木の画像を設置
        let bg = Sprite('stage-selector').addChildTo(this);
        this.width = bg.width;
        this.height = bg.height;

        this.stageData = params.stageData || null;
        this.scene = params.scene || null;


        let title = Label(this.stageData.title + "").addChildTo(this);
        title.setPosition(0, -260);


        let description = LabelArea({
            text: this.stageData.description + "",
            width: 400,
            height: 100
        }).addChildTo(this);
        description.setPosition(5, 200);

        //画像（あれば）
        let img = !!this.stageData.label ? Sprite(this.stageData.label).addChildTo(this) : null;
        if(img != null){
            img.setPosition(0, -50);
        }

        //ステージをクリアしていたら星がくるくる回るようにする
        let progress = Goal();
        if(params.progress == true) {
            progress.setPosition(0, -(progress.height + this.height) / 2);
            progress.addChildTo(this);
        }

        //オリジナルのステージをロードするためのステージかどうかのフラグ
        this.import = this.stageData.import != null ? this.stageData.import : false;
        this.setInteractive(true);
        this.on('pointend', () => this.exit());
    },
    //ステージに行く
    exit: function() {
        if(this.import == true) {
                $(".stage-input").removeClass("hide");
                $(".stage-input .button").on('click', () => {
                    $(".stage-input").addClass("hide");
                    try {
                        console.log($(".stage-input textarea").val());
                        const label = this.stageData.label;
                        const stageData = JSON.parse($(".stage-input textarea").val());
                        //ラベルをoriginal-stageに書き換え
                        stageData.label = label;
                        if(this.checkStageValidation(stageData)) {
                            this.scene.exit({stageData: stageData});
                        } else {
                            $("#logArea").removeClass("hide");
                            $("#logArea > p").text("ステージにはゴールとプレイヤーが1つ必要です！");
                            $(".stage-input").addClass("hide");
                        }
                    } catch (e) {
                        console.log(e);
                        $("#logArea").removeClass("hide");
                        $("#logArea > p").text("うまくデータが読み込めませんでした。詳しい原因を知るにはConsoleをみて下さい。");
                        $(".stage-input").addClass("hide");
                    }
                });
            } else {
                this.scene.exit({
                    stageData: this.stageData
                });
            }
    },
 checkStageValidation: function(stageData) {
     let player = false;
     let goal = false;
        for(row of stageData.data) {
            for(data of row) {
                if(data == 2) goal = true;
                if(data == 3) player = true;
            }
        }
        return player && goal;
    }
});

phina.namespace(function() {

  phina.define('TitleScene', {
    superClass: 'DisplayScene',
    /**
     * @constructor
     */
    init: function(params) {
      params = ({}).$safe(params, phina.game.TitleScene.defaults);
        this.superInit(params);

        //背景をタイトルに
        this.bg = Sprite('title')
            .setPosition(this.gridX.center(), this.gridY.center())
            .addChildTo(this);

        //ボタンを追加
        let startButton = Button({
            width: 400,
            height: 180,
            fill : 'transparent',
            text: ''
        }).addChildTo(this.bg)
            .setPosition(0, -30)
        .on('pointend', function(){
            localStorage.progress = '{}';
            this.exit();
        }.bind(this));

        let restartButton = Button({
            width: 400,
            height: 180,
            fill : 'transparent',
            text: ''
        }).addChildTo(this.bg)
            .setPosition(0, 250)
            .on('pointend', function(){
                localStorage.progress = '{}';
                this.exit();
            }.bind(this));

        this.on('pointend', function(){
            this.exit();
        });

        //ボタンを押したら終わるようにする
        $("#button").off("click");
        $("#button").on("click", () => this.exit());
    },

    _static: {
      defaults: {
        title: 'phina.js games',
        message: '',

        fontColor: 'white',
        backgroundColor: 'hsl(200, 80%, 64%)',
        backgroundImage: '',

        exitType: 'touch',
      },
    },

  });

});

const STAGE_DATA = [
    {"blockSize":70,"width":700,"height":1050,"data":[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,3,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,2,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],"title":"始まりのステージ","description":"右に動かしてみよう",label:"original-stage"},
    {"blockSize":70,"width":3290,"height":1050,"data":[[0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,4,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,4,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,4,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],[0,0,0,0,0,4,1,1,1,1,1,1,1,1,1],[0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],[0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,1,0,0,0,0,1,1,1,1,1,1,1,1,1],[1,1,0,0,0,2,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],"title":"マークでジャンプ！","description":"マーカーでジャンプしてみよう！"},
{"blockSize":70,"width":2660,"height":1050,"data":[[0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,4,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,4,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,9,0,0,0,0,0,1,1,1],[0,0,0,0,0,1,9,0,0,0,0,0,1,1,1],[0,0,0,0,0,1,9,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,0,0,0,0,0,4,1,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,8,0,0,0,0,1],[0,8,8,8,8,8,8,8,8,8,8,8,8,2,1],[0,9,9,9,9,9,9,9,9,9,9,9,9,0,1],[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],"title":"トゲに気をつけろ！","description":"マーカーの色を使って、トゲをよけてみよう"}
    ,{
        title:"オリジナルステージ",
        description:"ステージエディターで作ったステージで遊ぼう！",
        import:true,
        label: "original-stage"
    }];
const ASSETS = {
     image: {
         'tomapiko': './phinajs/assets/images/tomapiko_ss.png',
         'tiles': './pictures/Base_pack/Tiles/tiles_spritesheet.png',
         'bg-main': './pictures/Mushroom_expansion/Backgrounds/bg_grasslands.png',
         'result-board': './pictures/Result.png',
         'stage-selector': './pictures/stageselectitem_bg.png',
         'arrows': './pictures/EditorIcons.png',
         'original-stage': './pictures/stages/original.png',
         'title': './pictures/title.png',
         'stageselectbg': './pictures/stageselect_bg.png',
         'marker': "./pictures/marker.png",
         'bang-balloon': "./pictures/bang_balloon.png",
         'exit-icon': "./pictures/exit_icon.png",
         'needle': "./pictures/needle.png"
     },
 };

const player_ss = {
    "animations": {
        "die": {
            "frames": [5],
            "frequency": 5,
            "next": "die"
        },
        "dying": {
            "frames": [4],
            "frequency": 48,
            "next": "dead"
        },
        "flying": {
            "frames": [1,2,3],
            "frequency": 3,
            "next": "flying"
        },
        "stand": {
            "frames": [
                0
            ],
            "frequency": 3,
            "next": "stand"
        },
        "walking": {
            "frames": [12,13,14],
            "frequency": 3,
            "next": "walking"
        },
        "dead": {
            "frames": [5],
            "frequency": 40,
            "next": "stand"
        }
    },
    "frame": {
        "cols": 6,
        "height": 64,
        "rows": 3,
        "width": 64
    }
};

 // メイン処理
 phina.main(function() {
     // アプリケーション生成
     var scenes =[
     {
         className: 'TitleScene',
         label: 'title',
         nextLabel: 'select'
     },
      {
          className: 'StageSelectScene',
          label: 'select',
          nextLabel: 'main'
      },
     {
         className: 'MainScene',
         label: 'main',
         nextLabel: 'select'
     }];
     let app = GameApp({
         startLabel: 'title', 
         assets: ASSETS,
         domElement: document.getElementById("phinaCanvas"),
         width:700,
         height:1050,
         scenes:scenes,
         fit: false,
         lie: true //loadingが出るようになる
     });

     //appをinitした時点でwidthとheightが決まってしまうので書き換える
     //widthとheightを書かない場合default値になってしまう
     let s = app.canvas.domElement.style;
     s.width = "48vh";
     s.height = "auto";

     app.enableStats();
     // アプリケーション実行
     app.run();
 });
