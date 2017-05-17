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
        this.children.forEach(item => {
            item.position = item.startPos.clone();
            if(!!item.retry) {
                item.retry();
            }
        });
        this.player.position = this.player.startPos.clone();
        this.player.setVelocity(0, 0);
        this.goal.firstTime = true;
    }
});

