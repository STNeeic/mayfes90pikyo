phina.define('Player',{
    //プレイヤーのクラス
    //当たり判定用の四角形が実体で
    //描画されるキャラクター画像を内部に持っている

    //editorでは見た目しかいらないので簡素になった
     superClass: 'RectangleShape',
     init: function(options) {
         this.superInit({
             width:  70,
             height: 120,
             fill: 'rgba(0, 0, 0, 0)',
             stroke: null,
             cornerRadius: 0
         });

         this.sprite = Sprite('tomapiko', 64, 64).addChildTo(this);
         this.sprite.scaleX = this.sprite.scaleY = 2;
         this.sprite.scaleX *= -1;
         this.sprite.frameIndex = 1;



         //物理演算もどきをつける
         this.x = options.x || 0;
         this.y = options.y || 0;


     },

    omitOptions:function(){
        return {
            x: this.x,
            y: this.y
        };
    }
});
