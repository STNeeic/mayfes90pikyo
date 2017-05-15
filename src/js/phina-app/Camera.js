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
        const air_threthold = [200, 200];
        if(this.stageManager.checkEarthing(this.player)){
            //1マス分乗っている部分が見えるように
            //1フレームに少しずつずらしていく
            const y_destDiff = this.sceneHeight - (70 + this.player.height / 2 + (this.player.y - this.y));
                this.y += y_destDiff;
            console.log(y_destDiff);
        }

    }
});
