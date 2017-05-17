phina.define('Apple',{
    //ゴールとなるアイテム．
    superClass: 'Sprite',
    firstTime: true,
    init: function(){
        this.superInit('cherry');
        
    },
    reactTo: function(obj, scene){
        if(this.hitTestElement(obj) == true && this.firstTime == true) {
            scene.score += 1;
            this.firstTime = false;
        }
    }
});
