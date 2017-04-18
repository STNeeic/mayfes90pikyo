phina.define('Player',{
    //プレイヤーのクラス
    //当たり判定用の四角形が実体で
    //描画されるキャラクター画像を内部に持っている
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
         this.sprite.frameIndex = 1;



         //物理演算もどきをつける
         this.physicalBody = PhysicalBody().attachTo(this);
         this.mass = 1.0;
         this.x = options.x || 0;
         this.y = options.y || 0;
         this.dx = options.dx || 0;
         this.dy = options.dy || 0;

         this.sprite.fa = FrameAnimationWithState().setup(player_ss).attachTo(this.sprite);

     },
    setVelocity: function(x, y){
        //forceがvelocityをセットする関数である
        this.physicalBody.force(x, y);
        return this;
    },
    addForce: function(x, y){
        this.physicalBody.addForce(x/this.mass, y/this.mass);
    },
    setGravity: function(x, y){
        this.physicalBody.setGravity(x, y);
    },
    setVelocityX: function(x){
        var y = this.physicalBody.velocity.y;
        this.physicalBody.force(x, y);
    },
    setVelocityY: function(y){
        var x = this.physicalBody.velocity.x;
        this.physicalBody.force(x, y);
    },
    move: function(){
        this.physicalBody.move();
        //動いてたらその方向に体を向かせる
        if(this.dx < 0){
            this.sprite.scaleX = 2;
        } else if(this.dx > 0) {
            this.sprite.scaleX = -2;
        }


    },
    omitOptions:function(){
        return {
            x: this.x,
            y: this.y,
            dx:this.dx,
            dy:this.dy
        };
    },
    _accessor: {
        dx:{
            get: function(){return this.physicalBody.velocity.x;},
            set: function(v){this.physicalBody.velocity.x = v;}
        },
        dy:{
            get: function(){return this.physicalBody.velocity.y;},
            set: function(v){this.physicalBody.velocity.y = v;}
        }
    }
});
