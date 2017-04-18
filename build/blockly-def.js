/* 
 * mayfes90pikyo 1.0.0
 * 五月祭のプログラミング教室用のサイト
 * MIT Licensed
 * 
 * Copyright (C) 2017 EEIC, http://eeic.jp
 */


'use strict';

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
