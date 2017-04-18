Blockly.Blocks['is_cliff'] =  {
    init: function() {
        this.jsonInit({
            "message0": 'がけか しらべる',
            "colour": 100,
            "type": "Check",
            "output": "Boolean"
        });
    }
};

Blockly.JavaScript['is_cliff'] = function(block){
    //崖にいるか調べる
    var code = 'stageManager.checkNearCliff(player)';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
