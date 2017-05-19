 Blockly.Blocks['go'] = {
     init: function() {
         this.jsonInit({
             "message0": 'すすむ',
             "colour": 210,
             "type": "Action",
             "previousStatement": "Action",
             "nextStatement": "Action",
             "tooltip": "鳥があるきます"
         });
     }
 };

Blockly.JavaScript['go'] = function(block){
    //active jump flg
    var code = 'player.is_walk = true;\n';
    return code;
};

Blockly.Blocks['stop'] = {
    init: function() {
        this.jsonInit({
            "message0": 'とまる',
            "colour": 210,
            "type": "Action",
            "previousStatement": "Action",
            "nextStatement": "Action",
            "tooltip": "鳥がとまります"
        });
    }
};

Blockly.JavaScript['stop'] = function(block){
    //active jump flg
    var code = 'player.is_walk = false;\n';
    return code;
};


Blockly.Blocks['go_or_stop'] = {
    init: function() {
        this.jsonInit({
            "type": "Action",
            "message0": "%1",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "FLAGS",
                    "options": [
                        [
                            "すすむ",
                            "GO"
                        ],
                        [
                            "とまる",
                            "STOP"
                        ]
                    ]
                }
            ],
            "previousStatement": "Action",
            "nextStatement": "Action",
            "colour": 210,
            "tooltip": "鳥がすすむかとまります",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['go_or_stop'] = function(block){
    var flag = block.getFieldValue('FLAGS') == 'GO' ? true : false;
    var code = 'player.is_walk = ' + flag + ';\n';
    return code;
};
