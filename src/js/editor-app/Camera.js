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
    },
    move: function(x, y) {
        this.position.add(Vector2(x * 70, y * 70));
    }

    });
