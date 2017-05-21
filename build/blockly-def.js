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
            "message0": "%1 を むく",
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
            "colour": 210,
            "tooltip": "鳥が右か左にむきます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['go_l_or_r'] = function(block){
    var direction = block.getFieldValue('DIRECTION') == 'LEFT' ? '-1' : '1';
    var code = 'player.direction = ' + direction + ';\n';
    return code;
};

 Blockly.Blocks['go'] = {
     init: function() {
         this.jsonInit({
             "message0": 'すすむ',
             "colour": 210,
             "type": "Action",
             "previousStatement": "Action",
             "nextStatement": "Action",
             "tooltip": "鳥があるきます"
         });
     }
 };

Blockly.JavaScript['go'] = function(block){
    //active jump flg
    var code = 'player.is_walk = true;\n';
    return code;
};

Blockly.Blocks['stop'] = {
    init: function() {
        this.jsonInit({
            "message0": 'とまる',
            "colour": 210,
            "type": "Action",
            "previousStatement": "Action",
            "nextStatement": "Action",
            "tooltip": "鳥がとまります"
        });
    }
};

Blockly.JavaScript['stop'] = function(block){
    //active jump flg
    var code = 'player.is_walk = false;\n';
    return code;
};


Blockly.Blocks['go_or_stop'] = {
    init: function() {
        this.jsonInit({
            "type": "Action",
            "message0": "%1",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "FLAGS",
                    "options": [
                        [
                            "すすむ",
                            "GO"
                        ],
                        [
                            "とまる",
                            "STOP"
                        ]
                    ]
                }
            ],
            "previousStatement": "Action",
            "nextStatement": "Action",
            "colour": 210,
            "tooltip": "鳥がすすむかとまります",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['go_or_stop'] = function(block){
    var flag = block.getFieldValue('FLAGS') == 'GO' ? true : false;
    var code = 'player.is_walk = ' + flag + ';\n';
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
            "colour": 120,
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
            "colour": 120,
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


Blockly.Blocks['log_logarea'] = {
    init: function() {
        this.jsonInit({
            "type": "Action",
            "message0": "%1 を がめんにうつす",
            "args0": [
                {
                    "type": "input_value",
                    "name": "INPUT"
                }
            ],
            "previousStatement": "Action",
            "nextStatement": "Action",
            "tooltip": "指定した数や文字を画面に出力します",
            "colour": 160
        });
    }
};

Blockly.JavaScript['log_logarea'] = function(block){
    var input = Blockly.JavaScript.valueToCode(block,"INPUT", Blockly.JavaScript.ORDER_NONE) || "";
    var code = "$(\"#logArea\").removeClass(\"hide\");\n$(\"#logArea > p\").text(" + input + ");\n";
    return code;
};

Blockly.Blocks['is_on_any_marker'] = {
    init: function() {
        this.jsonInit({
            "type": "Check",
            "message0": "マーカーのところにいる",
            "output": "Boolean",
            "colour": 120,
            "tooltip": "自分がマーカーのところにいるかどうか調べます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['is_on_any_marker'] = function(block) {
    var code = 'stageManager.isOnAnyMarker(player)';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['is_on_marker'] = {
    init: function() {
        this.jsonInit({
            "type": "Check",
            "message0": "%1 の マーカーのところにいる",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "COLOR",
                    "options": [
                        [
                            "みず色",
                            "skyblue"
                        ],
                        [
                            "みどり色",
                            "green"
                        ],
                        [
                            "き色",
                            "yellow"
                        ],
                        [
                            "あか色",
                            "red"
                        ],
                        [
                            "むらさき色",
                            "purple"
                        ]
                    ]
                }
            ],
            "output": "Boolean",
            "colour": 120,
            "tooltip": "自分が特定色のマーカーのところにいるかどうかを調べます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['is_on_marker'] = function(block) {
    var color = block.getFieldValue('COLOR');
    var code = 'stageManager.isOnMarker(player,"' + color + '")';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
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
