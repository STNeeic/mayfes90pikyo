 // メイン処理
 phina.main(function() {
     // アプリケーション生成
     let app = GameApp({
         startLabel: 'main', // メインシーンから開始する
         assets: ASSETS,
         domElement: document.getElementById("phinaCanvas"),
         width: 2100,
         height:1150,
         fit: false
     });

     //appをinitした時点でwidthとheightが決まってしまうので書き換える
     //widthとheightを書かない場合default値になってしまう
     let s = app.canvas.domElement.style;
     s.width = "70vw";
     s.height = "auto";
     //app.enableStats();
     // アプリケーション実行
     app.run();

 });
