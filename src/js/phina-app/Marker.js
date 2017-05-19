phina.define('Marker', {
    superClass: 'Sprite',
    init: function(color) {
        this.superInit('marker', 70, 70);
        this.color = color || 'skyblue';
        this.frameIndex = this.getColorId();
        this.setInteractive(true);
    },
    //Spriteのmarkerにおける色の並び順
    colorId: ['skyblue', 'green', 'yellow', 'red', 'purple'],
    getColorId: function() {
        //colorに適切なframeIndexを返す関数
        return this.colorId.indexOf(this.color) * 3;
    },
    reactTo: function(obj, scene) {
        if(!this.hitTestElement(obj)) return;
        if(obj.className != "Player") return;

        this.frameIndex = this.getColorId() + 1;
        this.tweener.play().wait(500)
            .call(() => {
                this.frameIndex = this.getColorId();
                this.tweener.stop();
            });
    },
    update: function(app){
    }
});
