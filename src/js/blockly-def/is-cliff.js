Blockly.Blocks['is_cliff'] =  {
    init: function() {
        this.jsonInit({
            "type": "Check",
            "message0": "%1 に すすむと落ちる",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "DIRECTION",
                    "options": [
                        [
                            "右がわ",
                            "RIGHT"
                        ],
                        [
                            "左がわ",
                            "LEFT"
                        ]
                    ]
                }
            ],
            "output": "Boolean",
            "colour": 120,
            "tooltip": "自分の右隣りか左隣りに進もうとすると落ちるかどうか調べます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['is_cliff'] = function(block){
    //崖にいるか調べる
    var direction = block.getFieldValue('DIRECTION');
    var code = 'stageManager.checkNearCliff(player,"'+ direction +'")';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
