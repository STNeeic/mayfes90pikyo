phina.define('ResultBoard',{
    //結果表示用のボード
    superClass: 'DisplayElement',
    scene: null,
    init: function(scene) {
        this.superInit();
        this.scene = scene;
        this.setPosition(scene.gridX.center(), scene.gridY.center());
        scene.addChild(this);

        const right_line = 160; //次にいくの「く」の位置に揃うライン

        const board = Sprite('result-board').addChildTo(this);
        const score = DisplayElement({
            width:420,
            height:70
        }).addChildTo(this);
        score.setPosition(right_line - 20, 0);
        for(let i = 0; i < scene.score; i++){
            Cherry().addChildTo(score).setPosition(-i * 70,0);
        }
        const time = this.timeToStr(scene.time);
        const timelabel = Label(time).addChildTo(this);
        timelabel.setPosition(right_line, -110);
        timelabel.align = 'right';
        timelabel.fontSize = 36;

        //当たり判定がずれないようにsceneにaddChildしている
        const l_button = Button({
            text: ""
        }).addChildTo(scene);
        l_button.width = 200;
        l_button.height = 140;
        l_button.setPosition(220,710)
        .on('push', this.retry)
            .on('mouseover', function(e){console.log("L-BUTTON MOUSEOVER");})
            .board = this;
        this.l_button = l_button;

        const r_button = Button({
            text: ""
        }).addChildTo(scene);
        r_button.width = 200;
        r_button.height = 140;
        r_button.setPosition(470,710)
        .on('push', this.next)
            .on('mouseover', function(e){console.log("R-BUTTON MOUSEOVER");})
            .board = this;
        this.r_button = r_button;
           },
    timeToStr: function(time){
        const millsec = Math.floor((time % 1000) / 10);
        let sec = Math.floor((time / 1000) % 60);
        let min = Math.floor(time / 60000);
        min = min > 0 ? min + "分" : "";
        return min + sec+ "秒" + millsec;
    },
    retry:function(e) {
        //この時のthisはl_buttonなので注意!!!
        console.log("RESTART");
        this.parent.retry();
        this.board.removeAll();
    },
    removeAll: function(){
        this.l_button.remove();
        this.r_button.remove();
        this.children.forEach((e) => e.remove());
        this.remove();
    },
    next: function(e){
        console.log("GOTO NEXTSTAGE");
        this.parent.next();
    }
});
