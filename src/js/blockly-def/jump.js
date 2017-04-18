 Blockly.Blocks['jump'] = {
     init: function() {
         this.jsonInit({
             "message0": 'ジャンプ',
             "colour": 200,
             "type": "Action",
             "previousStatement": "Action",
             "nextStatement": "Action"
         });
     }
 };

Blockly.JavaScript['jump'] = function(block){
    //active jump flg
    var code = 'jump = true;\n';
    return code;
};

