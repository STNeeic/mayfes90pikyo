/* 
 * mayfes90pikyo 1.0.0
 * 五月祭のプログラミング教室用のサイト
 * MIT Licensed
 * 
 * Copyright (C) 2017 EEIC, http://eeic.jp
 */


'use strict';

Blockly.Blocks['go_l_or_r'] = {
    init: function() {
        this.jsonInit({
            "type": "Action",
            "message0": "%1 に すすむ",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "DIRECTION",
                    "options": [
                        [
                            "右",
                            "RIGHT"
                        ],
                        [
                            "左",
                            "LEFT"
                        ]
                    ]
                }
            ],
            "previousStatement": "Action",
            "nextStatement": "Action",
            "colour": 230,
            "tooltip": "鳥が右か左にうごきます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['go_l_or_r'] = function(block){
    var direction = block.getFieldValue('DIRECTION') == 'LEFT' ? '-20' : '20';
    var code = 'player.dx = ' + direction + ';\n';
    return code;
};

Blockly.Blocks['is_block'] = {
    init: function() {
        this.jsonInit({
            "type": "Check",
            "message0": "%1 に ブロックがある",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "DIRECTION",
                    "options": [
                        [
                            "右",
                            "RIGHT"
                        ],
                        [
                            "左",
                            "LEFT"
                        ]
                    ]
                }
            ],
            "output": "Boolean",
            "colour": 100,
            "tooltip": "自分の右隣りか左隣りにブロックがあるか調べます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['is_block'] = function(block) {
    var direction = block.getFieldValue('DIRECTION');
    var code = 'stageManager.checkNearBlock(player,"' + direction + '")';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['is_cliff'] =  {
    init: function() {
        this.jsonInit({
            "type": "Check",
            "message0": "%1 に すすむと落ちる",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "DIRECTION",
                    "options": [
                        [
                            "右がわ",
                            "RIGHT"
                        ],
                        [
                            "左がわ",
                            "LEFT"
                        ]
                    ]
                }
            ],
            "output": "Boolean",
            "colour": 100,
            "tooltip": "自分の右隣りか左隣りに進もうとすると落ちるかどうか調べます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['is_cliff'] = function(block){
    //崖にいるか調べる
    var direction = block.getFieldValue('DIRECTION');
    var code = 'stageManager.checkNearCliff(player,"'+ direction +'")';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

 Blockly.Blocks['jump'] = {
     init: function() {
         this.jsonInit({
             "message0": 'ジャンプする',
             "colour": 200,
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

Blockly.Blocks['myvariable_get'] = {
    init: function() {
        this.jsonInit({
            "type": "Action",
            "message0": "おぼえていた数",
            "colour": 330,
            "output" : "Number",
            "tooltip": "覚えていたもの（数やBoolean）を 出力します",
            "helpUrl": ""
        });

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
                    "name": "VAR"
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
    var input = Blockly.JavaScript.valueToCode(block, "VAR", Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
    console.log(input);
    var code = 'player.variable = ' + input + ";\n";
    return code;
};
