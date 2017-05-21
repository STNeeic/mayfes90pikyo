phina.define('ItemSelector',{
    superClass: 'DisplayElement',
    builder: null,
    state: -1,
    init: function(scene){
        this.superInit();
        RectangleShape({
            x: scene.gridX.center(),
            y: scene.height - 50,
            height: 100,
            width: scene.width,
            fill: 'white'
        }).addChildTo(this);
        this.builder = ItemBuilder();
        this.state = 0;

        let num = 0;
        const coef_x = 100;
        const offs_x = 50;
        for(let i = 1; i < 10000; i++) {
            const item = this.builder.build(i);
            if(item == null) {
                break;
            }
            item.number = i;
            item.setInteractive(true);
            item.position.set(num * coef_x + offs_x, scene.height - 50);
            num++;
            item.on('pointend', () => this.state = item.number);
            item.addChildTo(this);
        }
 
        //set for eraser
        let eraser = Sprite('eraser', 64, 64);
        eraser.position.set((num + 1)* coef_x + offs_x, scene.height - 50);
        eraser.scaleX = eraser.scaleY = 1.5;
        eraser.setInteractive(true);
        eraser.on('pointend', () => this.state = 0);
        eraser.addChildTo(this);
    }
})
