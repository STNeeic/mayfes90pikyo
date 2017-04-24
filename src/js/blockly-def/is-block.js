Blockly.Blocks['is_block'] = {
    init: function() {
        this.jsonInit({
            "type": "Check",
            "message0": "%1 に ブロックがある",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "DIRECTION",
                    "options": [
                        [
                            "右",
                            "RIGHT"
                        ],
                        [
                            "左",
                            "LEFT"
                        ]
                    ]
                }
            ],
            "output": "Boolean",
            "colour": 100,
            "tooltip": "自分の右隣りか左隣りにブロックがあるか調べます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['is_block'] = function(block) {
    var direction = block.getFieldValue('DIRECTION');
    var code = 'stageManager.checkNearBlock(player,"' + direction + '")';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
