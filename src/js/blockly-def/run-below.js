Blockly.Blocks['run_below'] =  {
    init: function() {
        this.jsonInit({
            "message0": 'ずっとつづける',
            "colour": 400,
            "type": "Runblock",
            "nextStatement": "Action"
        });
    }
};

Blockly.JavaScript['run_below'] = function(block){
    //do nothing
    var code = '';
    return code;
};

Blockly.Blocks['run_while'] =  {
    init: function() {
        this.jsonInit({
            "type": "block_type",
            "message0": "ずっとつづける %1",
            "args0": [
                {
                    "type": "input_statement",
                    "name": "RUNS"
                }
            ],
            "colour": 20,
            "tooltip": "下にあるブロックをずっと続けます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['run_while'] = function(block){
    var input = Blockly.JavaScript.statementToCode(block, "RUNS") || "";
    var code = input;
    return code;
};
