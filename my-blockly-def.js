 Blockly.Blocks['string_length'] = {
     init: function() {
         this.jsonInit({
             "message0": 'length of %1',
             "args0": [
                 {
                     "type": "input_value",
                     "name": "VALUE",
                     "check": "String"
                 }
             ],
             "output": "Number",
             "colour": 160,
             "tooltip": "Returns number of letters in the provided text.",
             "helpUrl": "http://www.w3schools.com/jsref/jsref_length_string.asp"
         });
     }
 };

 Blockly.Blocks['jump'] = {
     init: function() {
         this.jsonInit({
             "message0": 'jump',
             "colour": 200,
             "type": "Action",
             "previousStatement": "Action",
             "nextStatement": "Action"
         });
     }
 };

Blockly.Blocks['go_left'] = {
    init: function() {
        this.jsonInit({
            "message0": 'go_left',
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
            "message0": 'go_right',
            "colour": 200,
            "type": "Action",
            "previousStatement": "Action",
            "nextStatement": "Action"
        });
    }
};

Blockly.Blocks['run_below'] =  {
    init: function() {
        this.jsonInit({
            "message0": 'run_below',
            "colour": 400,
            "type": "Runblock",
            "nextStatement": "Action"
        });
    }
};

 Blockly.JavaScript['string_length'] = function(block){
     //return the length of valiables.
     var word = Blockly.JavaScript.valueToCode(block,"VALUE",Blockly.JavaScript.ORDER_ATOMIC) || '\'\'';
     console.log(block);
     var code = word + ".length\n";
     return [code, Blockly.JavaScript.ORDER_ATOMIC];
 };

 Blockly.JavaScript['jump'] = function(block){
     //active jump flg
     var code = 'jump = true;\n';
     return code;
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

Blockly.JavaScript['run_below'] = function(block){
    //do nothing
    var code = '';
    return code;
};
