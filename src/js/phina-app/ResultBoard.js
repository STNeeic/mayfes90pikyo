phina.define('ResultBoard',{
    //結果表示用のボード
    superClass: 'DisplayElement',
    scene: null,
    init: function(scene) {
        this.superInit();
        this.scene = scene;
        this.setPosition(scene.gridX.center(), scene.gridY.center());
        scene.addChild(this);

        const right_line = 225; //つぎへすすむの「む」の位置に揃うライン

        const board = Sprite('result-board').addChildTo(this);
        const score = Label(scene.score + " てん").addChildTo(this);
        score.setPosition(right_line, 30);
        score.align = 'right';
        const time = this.timeToStr(scene.time);
        const timelabel = Label(time).addChildTo(this);
        timelabel.setPosition(right_line, -35);
        timelabel.align = 'right';

        //当たり判定がずれないようにsceneにaddChildしている
        const l_button = Button({
            text: ""
        }).addChildTo(scene);
        l_button.width = 220;
        l_button.height = 70;
        l_button.setPosition(250,630)
        .on('push', this.retry)
            .on('mouseover', function(e){console.log("L-BUTTON MOUSEOVER");})
            .board = this;
        this.l_button = l_button;

        const r_button = Button({
            text: ""
        }).addChildTo(scene);
        r_button.width = 220;
        r_button.height = 70;
        r_button.setPosition(470,630)
        .on('push', this.next)
            .on('mouseover', function(e){console.log("R-BUTTON MOUSEOVER");})
            .board = this;
        this.r_button = r_button;
           },
    timeToStr: function(time){
        const millsec = Math.floor((time % 1000) / 10);
        let sec = Math.floor((time / 1000) % 60);
        let min = Math.floor(time / 60000);
        min = min > 0 ? min + "ふん" : "";
        return min + sec+ "びょう" + millsec;
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
        this.remove();
    },
    next: function(e){
        console.log("GOTO NEXTSTAGE");
    }
});
