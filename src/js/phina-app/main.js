 // メイン処理
 phina.main(function() {
     // アプリケーション生成
     var scenes =[
     {
         className: 'TitleScene',
         label: 'title',
         nextLabel: 'select'
     },
      {
          className: 'StageSelectScene',
          label: 'select',
          nextLabel: 'main'
      },
     {
         className: 'MainScene',
         label: 'main',
         nextLabel: 'select'
     }];
     let app = GameApp({
         startLabel: 'title', // メインシーンから開始する
         assets: ASSETS,
         domElement: document.getElementById("phinaCanvas"),
         width:700,
         height:1050,
         scenes:scenes,
         fit: false
     });

     //appをinitした時点でwidthとheightが決まってしまうので書き換える
     //widthとheightを書かない場合default値になってしまう
     let s = app.canvas.domElement.style;
     s.width = "48vh";
     s.height = "auto";
     
     app.enableStats();
     // アプリケーション実行
     app.run();
 });
