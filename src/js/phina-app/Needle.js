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
