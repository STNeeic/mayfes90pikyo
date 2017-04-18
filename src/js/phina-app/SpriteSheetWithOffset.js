phina.define('SpriteSheetWithOffset',{
    //SpriteSheetにoffsetが付いていた時用のSprite
    superClass: 'Sprite',
    init: function(image, width, height, offset){
        this.superInit(image, width, height);
        this.offset = offset || 0;
    },
    setFrameIndex: function(index, width, height) {
        var tw  = width || this._width;      // tw
        var th  = height || this._height;    // th
        var row = ~~(this.image.domElement.width / tw);
        var col = ~~(this.image.domElement.height / th);
        var maxIndex = row*col;
        index = index%maxIndex;
        
        var x = index%row;
        var y = ~~(index/row);
        this.srcRect.x = x* (tw + this.offset);
        this.srcRect.y = y* (th + this.offset);

        

        this.srcRect.width  = tw;
        this.srcRect.height = th;

        this._frameIndex = index;

        return this;

    }
});
