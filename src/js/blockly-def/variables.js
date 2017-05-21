Blockly.Blocks['myvariable_get'] = {
    init: function() {
        this.jsonInit({
            "type": "Action",
            "message0": "おぼえていたもの",
            "colour": 330,
            "tooltip": "覚えていたもの（数やBoolean）を 出力します",
            "helpUrl": ""
        });
        this.setOutput(true);
    }
};

Blockly.JavaScript['myvariable_get'] = function(block){
    var code = 'player.variable';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


Blockly.Blocks['myvariable_set'] = {
    init : function() {
        this.jsonInit({
            "type": "Check",
            "message0": "%1 を おぼえる",
            "args0": [
                {
                    "type": "input_value",
                    "name": "VALUE"
                }
            ],
            "colour": 330,
            "previousStatement": "Action",
            "nextStatement": "Action",
            "tooltip": "指定されたもの（数やBooleanなど）を覚えます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['myvariable_set'] = function(block){
    var input = Blockly.JavaScript.valueToCode(block, "VALUE", Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
    console.log(input);
    var code = 'player.variable = ' + input + ";\n";
    return code;
};
