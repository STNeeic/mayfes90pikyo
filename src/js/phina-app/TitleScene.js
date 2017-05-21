phina.namespace(function() {

  phina.define('TitleScene', {
    superClass: 'DisplayScene',
    /**
     * @constructor
     */
    init: function(params) {
      params = ({}).$safe(params, phina.game.TitleScene.defaults);
        this.superInit(params);

        //背景をタイトルに
        this.bg = Sprite('title')
            .setPosition(this.gridX.center(), this.gridY.center())
            .addChildTo(this);

        //ボタンを追加
        let startButton = Button({
            width: 400,
            height: 180,
            fill : 'transparent',
            text: ''
        }).addChildTo(this.bg)
            .setPosition(0, -30)
        .on('pointend', function(){
            localStorage.progress = '{}';
            localStorage.score = '{}';

            //workspaceを綺麗にする
            workspace.clear();
            Blockly.Xml.domToWorkspace(document.getElementById('startBlock'), workspace);
            this.exit();
        }.bind(this));

        let restartButton = Button({
            width: 400,
            height: 180,
            fill : 'transparent',
            text: ''
        }).addChildTo(this.bg)
            .setPosition(0, 250)
            .on('pointend', function(){
                this.exit();
            }.bind(this));

        this.on('pointend', function(){
            this.exit();
        });

        //ボタンを押したら終わるようにする
        $("#button").off("click");
        $("#button").on("click", () => this.exit());
    },

    _static: {
      defaults: {
        title: 'phina.js games',
        message: '',

        fontColor: 'white',
        backgroundColor: 'hsl(200, 80%, 64%)',
        backgroundImage: '',

        exitType: 'touch',
      },
    },

  });

});
