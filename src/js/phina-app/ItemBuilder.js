phina.define('ItemBuilder',{
    //stageに配置されるitemを数字に応じて出力するbuilder
    //もっとうまく書けるかもしれない
    init: function(){
        //MarkerのcolorIdを取得するため
        this.colorId = Marker().colorId;
    },
    build: function(num){
        switch(num){
        case 0: return null;
        case 1: return Block();
        case 2: return Goal();
        case 3: return Player({});
            //for marker
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
            return Marker(this.colorId[num - 4]);
        case 9: return Needle();
        case 10: return Cherry();

        default: return null;
        }
    }
});
