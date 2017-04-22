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
