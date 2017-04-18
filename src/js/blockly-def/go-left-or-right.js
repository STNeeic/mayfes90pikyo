Blockly.Blocks['go_left'] = {
    init: function() {
        this.jsonInit({
            "message0": 'ひだりに すすむ',
            "colour": 200,
            "type": "Action",
            "previousStatement": "Action",
            "nextStatement": "Action"
        });
    }
};

Blockly.Blocks['go_right'] = {
    init: function() {
        this.jsonInit({
            "message0": 'みぎに すすむ',
            "colour": 200,
            "type": "Action",
            "previousStatement": "Action",
            "nextStatement": "Action"
        });
    }
};

Blockly.JavaScript['go_left'] = function(block){
    //go left
    var code = 'player.dx = -20;\n';
    return code;
};

Blockly.JavaScript['go_right'] = function(block){
    //go right
    var code = 'player.dx = 20;\n';
    return code;
};
