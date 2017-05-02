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
