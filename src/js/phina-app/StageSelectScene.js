

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
