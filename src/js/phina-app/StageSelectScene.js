

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
                        this.scene.exit({stageData: stageData});
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
    }
});
