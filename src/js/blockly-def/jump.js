 Blockly.Blocks['jump'] = {
     init: function() {
         this.jsonInit({
             "message0": 'ジャンプする',
             "colour": 210,
             "type": "Action",
             "previousStatement": "Action",
             "nextStatement": "Action",
             "tooltip": "鳥がジャンプします"
         });
     }
 };

Blockly.JavaScript['jump'] = function(block){
    //active jump flg
    var code = 'jump = true;\n';
    return code;
};

