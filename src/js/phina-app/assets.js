const STAGE_DATA = [
    {"blockSize":70,"width":700,"height":1050,"data":[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,3,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,5,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,2,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],"title":"始まりのステージ","description":"右に動かしてみよう",label:"original-stage"},
    {"blockSize":70,"width":1610,"height":1050,"data":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,1,1,1,1,3,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],[0,0,0,0,0,2,1,0,0,0,0,0,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]},

    {
        title:"オリジナルステージ",
        description:"ステージエディターで作ったステージで遊ぼう！",
        import:true,
        label: "original-stage"
    }];
const ASSETS = {
     image: {
         'tomapiko': './phinajs/assets/images/tomapiko_ss.png',
         'tiles': './pictures/Base_pack/Tiles/tiles_spritesheet.png',
         'bg-main': './pictures/Mushroom_expansion/Backgrounds/bg_grasslands.png',
         'result-board': './pictures/Result.png',
         'stage-selector': './pictures/stageselectitem_bg.png',
         'arrows': './pictures/EditorIcons.png',
         'original-stage': './pictures/stages/original.png',
         'title': './pictures/title.png',
         'stageselectbg': './pictures/stageselect_bg.png',
         'marker': "./pictures/marker.png"
     },
 };

const player_ss = {
    "animations": {
        "die": {
            "frames": [5],
            "frequency": 5,
            "next": "die"
        },
        "dying": {
            "frames": [4],
            "frequency": 48,
            "next": "dead"
        },
        "flying": {
            "frames": [1,2,3],
            "frequency": 3,
            "next": "flying"
        },
        "stand": {
            "frames": [
                0
            ],
            "frequency": 3,
            "next": "stand"
        },
        "walking": {
            "frames": [12,13,14],
            "frequency": 3,
            "next": "walking"
        },
        "dead": {
            "frames": [5],
            "frequency": 40,
            "next": "stand"
        }
    },
    "frame": {
        "cols": 6,
        "height": 64,
        "rows": 3,
        "width": 64
    }
};
