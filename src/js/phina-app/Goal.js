phina.define('Goal',{
    //ゴールとなるアイテム．
    superClass: 'StarShape',
    firstTime: true,
    init: function(){
        this.superInit();
        this.tweener.by({
            rotation: 360
        }, 3000, "swing").setLoop(true);
    },
    reactTo: function(obj, scene){
        if(this.hitTestElement(obj) == true && this.firstTime == true) {
            //ゲームクリア!!
            ResultBoard(scene).addChildTo(scene);
            this.firstTime = false;
            this.hide();
        }
    },
    retry: function() {
        this.show();
    }
});
