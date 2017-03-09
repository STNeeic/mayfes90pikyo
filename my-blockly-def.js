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
 Blockly.JavaScript['string_length'] = function(block){
     //return the length of valiables.
     var word = Blockly.JavaScript.valueToCode(block,"VALUE",Blockly.JavaScript.ORDER_ATOMIC) || '\'\'';
     console.log(block);
     var code = word + ".length\n";
     return [code, Blockly.JavaScript.ORDER_ATOMIC];
 };

 Blockly.JavaScript['jump'] = function(block){
     //Call jump()
     var code = 'jump = true;\n';
     return code;
 };

