 $(function(){
     $('a[href^="#"]').click(function(){
         var speed = 300;
         var href= $(this).attr("href");
         var target = $(href == "#" || href == "" ? 'html' : href);
         var position = target.offset().top;
         $("html, body").animate({scrollTop:position}, speed, "swing");
         return false;
     });
 });


 $(function(){
     $('div.menu-trigger').click(function(){
         $('ul.global-nav-list').slideToggle(300);
     });
 });

 $(function(){
     $('a.nav').click(function(){
         $('ul.global-nav-list').slideUp(100);
     });
 });

 $(function(){
     $('a.header-link').click(function(){
         $('ul.global-nav-list').slideUp(100);
     });
 });
