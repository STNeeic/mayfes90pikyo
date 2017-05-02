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
        var left_threthold = 300;
        var right_threthold = 200;

        if(xdiff + left_threthold < 0){
            this.x -= xdiff + left_threthold;
        }
        else if(xdiff - right_threthold > 0) {
            this.x -= xdiff - right_threthold;
        }
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
         this.sprite.frameIndex = 1;



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

        const right_line = 225; //つぎへすすむの「む」の位置に揃うライン

        const board = Sprite('result-board').addChildTo(this);
        const score = Label(scene.score + " てん").addChildTo(this);
        score.setPosition(right_line, 30);
        score.align = 'right';
        const time = this.timeToStr(scene.time);
        const timelabel = Label(time).addChildTo(this);
        timelabel.setPosition(right_line, -35);
        timelabel.align = 'right';

        //当たり判定がずれないようにsceneにaddChildしている
        const l_button = Button({
            text: ""
        }).addChildTo(scene);
        l_button.width = 220;
        l_button.height = 70;
        l_button.setPosition(250,630)
        .on('push', this.retry)
            .on('mouseover', function(e){console.log("L-BUTTON MOUSEOVER");})
            .board = this;
        this.l_button = l_button;

        const r_button = Button({
            text: ""
        }).addChildTo(scene);
        r_button.width = 220;
        r_button.height = 70;
        r_button.setPosition(470,630)
        .on('push', this.next)
            .on('mouseover', function(e){console.log("R-BUTTON MOUSEOVER");})
            .board = this;
        this.r_button = r_button;
           },
    timeToStr: function(time){
        const millsec = Math.floor((time % 1000) / 10);
        let sec = Math.floor((time / 1000) % 60);
        let min = Math.floor(time / 60000);
        min = min > 0 ? min + "ふん" : "";
        return min + sec+ "びょう" + millsec;
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
    checkNearCliff: function(element){
        const dummy_left = Player(element.omitOptions());
        const dummy_right = Player(element.omitOptions());

        const left_offs = Vector2(-64, 64);
        const right_offs = Vector2(64, 64);

        dummy_left.position.add(left_offs);
        dummy_right.position.add(right_offs);

        return this.checkEarthing(element) && (this.getHitItems(dummy_left).length == 0 || this.getHitItems(dummy_right).length == 0);
    },
    checkNearBlock: function(element, direction) {
        //左隣りまたは右隣りに接触可能なブロックがあるかどうかを判定する関数

        const dummy = Player(element.omitOptions());

        const offs = Vector2(64, 0);
        if(direction == "LEFT") offs.negate();

        dummy.position.add(offs);

        return this.getHitItems(dummy).some(item => item.canBeTouched);
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
        //タイトルラベルを作成
        let title = Label("ステージを選んでね").addChildTo(this);
        title.setPosition(this.gridX.center(), 40);

        //カルーセル形式のアイコンを作成
        let carousel = DisplayElement().addChildTo(this);
        this.carousel = carousel;
        STAGE_DATA.forEach((stage, index) => {
            StageViewItem({
                stageData: stage,
                scene: this
            })
                .setPosition(this.gridX.center() + this.width * index , this.gridY.center())
                .addChildTo(carousel);
        });

        //カーソルの設置
        this.cursors = Cursors({
            scene: this,
            direction: "horizontal"
        }).addChildTo(this);


        this.cursors.leftArrow.on('click', () => this.goLeft());
        this.cursors.rightArrow.on('click', () => this.goRight());


        carousel.pos = 0;
        //移動したときに配列の範囲外に出ないか調べる
        carousel.isValidPos = direction => carousel.pos + direction >= 0 && carousel.pos + direction < carousel.children.length;
        carousel.checkPosition = () => {
            if(carousel.isValidPos(-1)){
                this.cursors.leftArrow.show();
            } else {
                this.cursors.leftArrow.hide();
            }

            if(carousel.isValidPos(1)) {
                this.cursors.rightArrow.show();
            } else {
                this.cursors.rightArrow.hide();
            }
        };

        carousel.checkPosition();

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
phina.define('StageViewItem', {
    superClass:'DisplayElement',

    init: function(params) {
        this.superInit(params);
        //枠となる木の画像を設置
        let bg = Sprite('stage-selector').addChildTo(this);
        this.width = bg.width;
        this.height = bg.height;

        let stageData = params.stageData || null;
        let scene = params.scene || null;


        let title = Label(stageData.title + "").addChildTo(this);
        title.setPosition(0, -260);


        let description = LabelArea({
            text: stageData.description + "",
            width: 400,
            height: 100
        }).addChildTo(this);
        description.setPosition(5, 200);


        let img = !!stageData.label ? Sprite(stageData.label).addChildTo(this) : null;
        if(img != null){
            img.setPosition(0, -50);
        }

        this.import = stageData.import != null ? stageData.import : false;
        this.setInteractive(true);
        this.on('pointend',function (e) {
            if(this.import == true) {
                $(".stage-input").removeClass("hide");
                $(".stage-input .button").on('click', () => {
                    $(".stage-input").addClass("hide");
                    try {
                        console.log($(".stage-input textarea").val());
                        let stageData = JSON.parse($(".stage-input textarea").val());
                        scene.exit({stageData: stageData});
                    } catch (e) {
                        console.log(e);
                        scene.exit();
                    }
                });
            } else {
                scene.exit({
                    stageData: stageData
                });
            }
        });
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

      this.backgroundColor = params.backgroundColor;

      this.fromJSON({
        children: {
          titleLabel: {
            className: 'phina.display.Label',
            arguments: {
              text: params.title,
              fill: params.fontColor,
              stroke: false,
              fontSize: 64,
            },
            x: this.gridX.center(),
            y: this.gridY.span(4),
          }
        }
      });

      if (params.exitType === 'touch') {
        this.fromJSON({
          children: {
            touchLabel: {
              className: 'phina.display.Label',
              arguments: {
                text: "TOUCH START",
                fill: params.fontColor,
                stroke: false,
                fontSize: 32,
              },
              x: this.gridX.center(),
              y: this.gridY.span(12),
            },
          },
        });
          this.on('pointend', function() {
              this.exit();
        });
      }
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
    {"blockSize":70,"width":1610,"height":1050,"data":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,3,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,2,1,0,0,0,0,0,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]},
    {"blockSize":70,"width":1610,"height":1050,"data":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,1,1,1,1,3,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,2,1,0,0,0,0,0,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]},
    {
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
         'result-board': './pictures/ResultBoard.png',
         'stage-selector': './pictures/stageselect_bg.png',
         'arrows': './pictures/EditorIcons.png',
         'original-stage': './pictures/stages/original.png'
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
         startLabel: 'title', // メインシーンから開始する
         assets: ASSETS,
         domElement: document.getElementById("phinaCanvas"),
         width:700,
         height:1050,
         scenes:scenes,
         fit: false
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
