Blockly.Blocks['log_logarea'] = {
    init: function() {
        this.jsonInit({
            "type": "Action",
            "message0": "%1 を 画面にうつす",
            "args0": [
                {
                    "type": "input_value",
                    "name": "INPUT"
                }
            ],
            "previousStatement": "Action",
            "nextStatement": "Action",
            "tooltip": "指定した数や文字を画面に出力します",
            "colour": 100
        });
    }
};

Blockly.JavaScript['log_logarea'] = function(block){
    var input = Blockly.JavaScript.valueToCode(block,"INPUT", Blockly.JavaScript.ORDER_NONE) || "";
    var code = "$(\"#logArea\").removeClass(\"hide\");\n$(\"#logArea > p\").text(" + input + ");\n";
    return code;
};
