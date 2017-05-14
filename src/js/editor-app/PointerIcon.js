phina.define('PointerIcon', {
    superClass: "DisplayElement",
    init: function(options) {
        this.superInit();
        this.scene = options.scene;
        this.icon = Sprite('eraser', 64, 64).addChildTo(this);
        this.setInteractive(true);
        this.on('pointstart', () => {
            //ドラッグ中はアイコンを隠す
            this.hide();
        });
        this.on('pointend', () => {
            //ドラッグ後はアイコンを見せる
            this.show();
        });

                },
    update: function(app) {
        //corsorのstyleの選択権をInteractiveから奪う
        if(!this.firstTime) {
        app.interactive.check = function(root) {
            if (!this._enable || !this.app.pointers) return ;
            this._checkElement(root);
        };
            this.firstTime = true;
        }



        const pos = app.pointer.position.clone();
        this.position = pos; //this.scene.alignPosFrom(pos);
        this.icon.remove();
        //iconの更新
        if(this.scene.selector.state > 0) {
            this.icon = this.scene.builder.build(this.scene.selector.state);
        } else {
            this.icon = Sprite('eraser', 64, 64);
        }

        this.addChild(this.icon);

        //マウスカーソルを描画するかどうかの更新
        if(this.scene.checkValidPos(app) ){
            app.domElement.style.cursor = "none";
        } else {
            app.domElement.style.cursor = "auto";
        }

    }
});
