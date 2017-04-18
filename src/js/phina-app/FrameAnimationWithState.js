phina.define('FrameAnimationWithState', {
    superClass: 'FrameAnimation',
    init: function(ss){
        this.superInit(ss);
        this._state = "";
        this._prevState = "";
    },
    setup: function(params){
        this.ss = SpriteSheet().setup(params);
        return this;
    },
    _gotoAndPlay: function(string){
        this.gotoAndPlay(string);
        this._state = string;
    },
    update: function() {
        if(this._prevState != this._state) {
            this._gotoAndPlay(this._state);
            this._prevState = this._state;
        }


        if (this.paused) return ;
        if (!this.currentAnimation) return ;

        if (this.finished) {
            this.finished = false;
            this.currentFrameIndex = 0;
            return ;
        }
           ++this.frame;
        if (this.frame%this.currentAnimation.frequency === 0) {
            ++this.currentFrameIndex;
            this._updateFrame();
        }
    },
    _accessor: {
        "state" :{
            get: function(){ return this._state;},
            set: function(v){ this._state = v;}
        }
    }
});
