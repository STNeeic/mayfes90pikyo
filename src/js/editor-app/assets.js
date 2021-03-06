 const ASSETS = {
     image: {
         'tomapiko': './phinajs/assets/images/tomapiko_ss.png',
         'tiles': './pictures/Base_pack/Tiles/tiles_spritesheet.png',
         'bg-main': './pictures/Mushroom_expansion/Backgrounds/bg_grasslands.png',
         'result-board': './pictures/ResultBoard.png',
         'eraser': './pictures/EditorIcons.png',
         'arrows': './pictures/EditorIcons.png',
         'marker': "./pictures/marker.png",
         'needle': './pictures/needle.png',
         'cherry': "./pictures/Candy_expansion/Tiles/cherry.png"
     }
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
