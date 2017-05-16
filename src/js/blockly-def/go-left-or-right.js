Blockly.Blocks['go_l_or_r'] = {
    init: function() {
        this.jsonInit({
            "type": "Action",
            "message0": "%1 に すすむ",
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
            "previousStatement": "Action",
            "nextStatement": "Action",
            "colour": 210,
            "tooltip": "鳥が右か左にうごきます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['go_l_or_r'] = function(block){
    var direction = block.getFieldValue('DIRECTION') == 'LEFT' ? '-20' : '20';
    var code = 'player.dx = ' + direction + ';\n';
    return code;
};
