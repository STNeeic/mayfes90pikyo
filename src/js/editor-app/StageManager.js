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
            //一番下にblockを敷いておく
            data: Array.apply(null, new Array(10)).map(() => Array.apply(null, new Array(15)).map((a,i) => {if(i == 14){return 1;} else return 0;}))
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

