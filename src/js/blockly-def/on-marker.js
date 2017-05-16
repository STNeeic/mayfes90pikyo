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
                            "水色",
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
            "tooltip": "自分の右隣りか左隣りにブロックがあるか調べます",
            "helpUrl": ""
        });
    }
};

Blockly.JavaScript['is_on_marker'] = function(block) {
    var color = block.getFieldValue('COLOR');
    var code = 'stageManager.isOnMarker(player,"' + color + '")';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
