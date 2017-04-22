

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

         //アイテム選択用の部分を作成
         this.selector = ItemSelector(this).addChildTo(this);

         this.builder = ItemBuilder();

         //cameraを作成
         this.camera = Camera({
             scene:this,
             stageManager: this.stageManager
         }).addChildTo(this);

         this.setInteractive(true);
         this.on("pointstart", this.pointstart);
         this.on("pointmove", this.pointmove);
         this.on("pointend", this.pointend);

         $("#import").on("click" ,() => {
             try {
                 this.stageData = JSON.parse($("#JSONarea").val());
             } catch (e){
                 window.alert(e);
                 console.warn(e);
             }
         });

         $("#export").on("click", () => {
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

         if(this.selector.state > 0){
             this.tmpRect = DisplayElement().addChildTo(this);
             this.tmpRect.position = this.startPos.clone();
             this.tmpRect.addChild(this.builder.build(this.selector.state));
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
                 const item = this.builder.build(this.selector.state);
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

