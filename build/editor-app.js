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
        this.stageManager = options.scene.stageManager || options.stageManager || null;


        if(this.stageManager == null){
            console.warn("ERROR @ Camera: Cannot set stageManager");
            console.log(this.stageManager);
            return;
        }

        this.addChild(this.stageManager);
    }

    });

phina.define('Goal',{
    //ゴールとなるアイテム．
    superClass: 'StarShape',
    firstTime: true,
    init: function(){
        this.superInit();
    }
});

phina.define('ItemBuilder',{
    //stageに配置されるitemを数字に応じて出力するbuilder
    //もっとうまく書けるかもしれない
    init: function(){
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
        default: return null;
        }
    }
});

phina.define('ItemSelector',{
    superClass: 'DisplayElement',
    builder: null,
    state: -1,
    init: function(scene){
        this.superInit();
        RectangleShape({
            x: scene.gridX.center(),
            y: scene.height - 50,
            height: 100,
            width: scene.width,
            fill: 'white'
        }).addChildTo(this);
        this.builder = ItemBuilder();
        this.state = 0;

        let num = 0;
        const coef_x = 100;
        const offs_x = 50;
        for(let i = 1; i < 10000; i++) {
            const item = this.builder.build(i);
            if(item == null) {
                break;
            }
            item.number = i;
            item.setInteractive(true);
            item.position.set(num * coef_x + offs_x, scene.height - 50);
            num++;
            item.on('pointend', () => this.state = item.number);
            item.addChildTo(this);
        }
 
        //set for eraser
        let eraser = Sprite('eraser', 64, 64);
        eraser.position.set(num * coef_x + offs_x, scene.height - 50);
        eraser.scaleX = eraser.scaleY = 1.5;
        eraser.setInteractive(true);
        eraser.on('pointend', () => this.state = 0);
        eraser.addChildTo(this);
    }
})



// MainScene クラスを定義
 phina.define('MainScene', {
     superClass: 'DisplayScene',
     stageData: null,
     init: function() {
         this.superInit({
             width:2100,
             height:1150
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

         this.stageData = this.stageManager.stageData;
         this.stageManager.loadStage(this.stageData);
         //cameraを作成
         this.camera = Camera({
             scene:this,
             stageManager: this.stageManager
         }).addChildTo(this);

         //ここからUIのレンダリング
         //アイテム選択用の部分を作成
         this.selector = ItemSelector(this).addChildTo(this);

         this.builder = ItemBuilder();

         this.setInteractive(true);
         this.on("pointstart", this.pointstart);
         this.on("pointmove", this.pointmove);
         this.on("pointend", this.pointend);

         $("#import").on("click" ,() => {
             try {
                 this.stageData = JSON.parse($("#JSONarea").val());

                 if(!!this.stageData.title) {
                     $("#title").val(this.stageData.title);
                 }
                 if(!!this.stageData.label) {
                     $("#label").val(this.stageData.label);
                 }
                 if(!!this.stageData.description) {
                     $("#description").val(this.stageData.description);
                 }

             } catch (e){
                 window.alert(e);
                 console.warn(e);
             }
         });

         $("#export").on("click", () => {
             if($("#title").val() != "") {
                 this.stageData.title = $("#title").val();
             }
             if($("#label").val() != "") {
                 this.stageData.label = $("#label").val();
             }
             if ($("#description").val() != "") {
                 this.stageData.description = $("#description").val();
             }
             $("#JSONarea").val(JSON.stringify(this.stageData));
         });

         console.log("GAME START");
     },
     update: function(app) {
         const keyboard = app.keyboard;
         const stageManager = this.stageManager;



         let v = Vector2(0,0);

         if(keyboard.getKey('left')){
             v.x -= 70;
         }
         if(keyboard.getKey('right')){
             v.x += 70;
         }
         if(keyboard.getKeyDown('up')){
             v.y -= 70;
         }
         if(keyboard.getKey('down')){
             v.y += 70;
         }

         this.camera.position.add(v);

         this.stageManager.loadStage(this.stageData);
         //console.log(this.camera.position.x + " " + this.camera.position.y); //for debug

     },
     alignPosFrom: function(v){
         const x = Math.floor(v.x / 70) * 70 + 35;
         const y = Math.floor(v.y / 70) * 70 + 35;
         return Vector2(x, y);
     },
     pointstart: function(e){
         this.startPos = this.alignPosFrom(e.pointer.position);
         if(e.pointer.position.y > 1050) return;

             this.tmpRect = DisplayElement().addChildTo(this);
             this.tmpRect.position = this.startPos.clone();
         if(this.selector.state > 0){
             this.tmpRect.addChild(this.builder.build(this.selector.state));
         }
         else {
             this.tmpRect.addChild(Sprite('eraser', 64, 64));
         }
     },
     pointmove: function(e){
         if(e.pointer.position.y > 1050) return;
         this.nowPos = this.alignPosFrom(e.pointer.position);
         this.tmpRect.children.forEach(item => item.remove());
         const v = Vector2.sub(this.startPos, this.nowPos);
         const u = Vector2(70,70);
         u.x *= v.x < 0 ? 1 : -1;
         u.y *= v.y < 0 ? 1 : -1;

         for(let i = 0; i * 70 <= Math.abs(v.x); i++) {
             for(let j = 0; j * 70 <= Math.abs(v.y); j++) {
                 let item = Sprite('eraser', 64, 64);
                 if(this.selector.state > 0) {
                     item = this.builder.build(this.selector.state);
                 }
                 item.position.set(i * u.x, j * u.y);
                 this.tmpRect.addChild(item);
             }
         }
     },
     pointend: function(e){
         if(e.pointer.position.y > 1050) return;
         this.tmpRect.remove();
         this.nowPos = this.alignPosFrom(e.pointer.position);

         //画面上の始点と終点を計算する
         const [start, end] = [Vector2.min(this.nowPos, this.startPos), Vector2.max(this.nowPos, this.startPos)];
         //矩形はitemの左上と右下に始点と終点がいくようにする
         //どちらの点も矩形の中心にあるのでオフセットをつける
         //また、カメラの位置に左右されずに位置を表すためにカメラの位置を引く
         start.sub(Vector2(35, 35)).sub(this.camera.position);
         end.add(Vector2(35, 35)).sub(this.camera.position);

         //ステージの矩形と計算した矩形を覆う四角形を求める
         //それを新たなステージの矩形とする
         //もしも始点が(0,0)よりも左にあるなら(0,0)をずらす必要がある
         let stageData_offs = Vector2.min(Vector2(0, 0), start).negate();

         //元々のサイズと新たな矩形に基づくサイズのどちらが大きいかを計算する
         //新たな矩形に基づくサイズは、endをitemのoffs分(35,35)足した奴からカメラの座標を引いた奴
         const old_size = Vector2(this.stageData.width, this.stageData.height);
         const size = Vector2.max(old_size, end).add(stageData_offs);


         const old_maxPos = old_size.clone().add(stageData_offs);

         const [start_newPos, end_newPos] = [start.add(stageData_offs), end.add(stageData_offs)];
         //stageDataを作成する
         let data = [];

         for(let i = 0; i < size.x / 70; i++) {
             data.push(new Array(Math.floor(size.y / 70)));
             for(let j = 0; j < size.y / 70; j++) {
                 data[i][j] = 0;

                 //posはi,jから判断される位置。
                 let pos = Vector2(i * 70 + 35, j * 70 + 35);

                 //d_posが選択した範囲に入っていたら
                 if(Vector2.min(start_newPos, pos).equals(start_newPos) && Vector2.max(end_newPos, pos).equals(end_newPos)) {
                     data[i][j] = this.selector.state;

                 //posが元のstageDataの矩形の内部だったら
                 } else if(Vector2.min(pos, stageData_offs).equals(stageData_offs) && Vector2.max(pos, old_maxPos).equals(old_maxPos)) {
                     data[i][j] = this.stageData.data[i - Math.floor(stageData_offs.x / 70)][j - Math.floor(stageData_offs.y / 70)];
                 }
             }
         }

         //データの更新
         this.stageData = {
             blockSize: 70,
             width: size.x,
             height: size.y,
             data: data
         };

         //実際に画面上に描画する
         this.stageManager.loadStage(this.stageData);
         this.camera.position.sub(stageData_offs);
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
    }
});

phina.define('Player',{
    //プレイヤーのクラス
    //当たり判定用の四角形が実体で
    //描画されるキャラクター画像を内部に持っている

    //editorでは見た目しかいらないので簡素になった
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
         this.sprite.scaleX *= -1;
         this.sprite.frameIndex = 1;



         //物理演算もどきをつける
         this.x = options.x || 0;
         this.y = options.y || 0;


     },

    omitOptions:function(){
        return {
            x: this.x,
            y: this.y
        };
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
        this.stageData = {
            width: 700,
            height: 1050,
            blockSize: 70,
            data: Array.apply(null, new Array(70)).map(() => Array.apply(null, new Array(70)).map(() => 0))
        };
    },

    addItem: function(v) {
        //子供に登録する際は，最初の位置を覚える必要があるので
        //この関数を用いる．
        v.startPos = v.position.clone();
        this.addChild(v);
    },

    loadStage: function(stageData) {
        //一旦全部のitemを消す
        this.children.forEach(item => item.remove());

        //データを保存
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

                if(item.className == "Goal"){
                    this.goal = item;
                }
                this.addItem(item);
            }
        }


    }

});


 const ASSETS = {
     image: {
         'tomapiko': './phinajs/assets/images/tomapiko_ss.png',
         'tiles': './pictures/Base_pack/Tiles/tiles_spritesheet.png',
         'bg-main': './pictures/Mushroom_expansion/Backgrounds/bg_grasslands.png',
         'result-board': './pictures/ResultBoard.png',
         'eraser': './pictures/EditorIcons.png',
         'arrows': './pictures/EditorIcons.png',
         'marker': "./pictures/marker.png"
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
     let app = GameApp({
         startLabel: 'main', // メインシーンから開始する
         assets: ASSETS,
         domElement: document.getElementById("phinaCanvas"),
         width: 2100,
         height:1150,
         fit: false
     });

     //appをinitした時点でwidthとheightが決まってしまうので書き換える
     //widthとheightを書かない場合default値になってしまう
     let s = app.canvas.domElement.style;
     s.width = "90vw";
     s.height = "auto";
     //app.enableStats();
     // アプリケーション実行
     app.run();

 });
