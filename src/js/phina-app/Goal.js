phina.define('Goal',{
    //ゴールとなるアイテム．
    superClass: 'StarShape',
    firstTime: true,
    init: function(){
        this.superInit();
    },
    reactTo: function(obj, scene){
        if(this.hitTestElement(obj) == true && this.firstTime == true) {
            //ゲームクリア!!
            ResultBoard(scene).addChildTo(scene);
            this.firstTime = false;
        }
    }
});
