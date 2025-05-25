(function(){
  "use strict";

  // 1. Добавляем перевод для названия меню
  Lampa.Lang.add({
      anitop_menu: {
          ru: "Anitop",
          en: "Anitop"
      }
  });

  // 2. Функция добавления пункта меню в левую панель
  function addAnitopMenu(){
      // Простейшая SVG-иконка с буквой "A"
      var ico = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle cx="32" cy="32" r="32" fill="#4CAF50"/>' +
                    '<text x="32" y="42" font-size="24" text-anchor="middle" fill="#fff">A</text>' +
                '</svg>';
      
      // Формируем HTML для пункта меню
      var menu_item = $(
          '<li class="menu__item selector" data-action="anitop">' +
              '<div class="menu__ico">' + ico + '</div>' +
              '<div class="menu__text">' + Lampa.Lang.translate("anitop_menu") + '</div>' +
          '</li>'
      );

      // При нажатии (hover:enter) запускается функция открытия каталога
      menu_item.on("hover:enter", function(){
          animeParser.openCatalog();
      });

      // Добавляем пункт меню. Возможно, в вашей сборке контейнер меню имеет другой индекс.
      $(".menu .menu__list").eq(1).append(menu_item);
      console.log("Anitop plugin: Menu item added");
  }

  // 3. Если приложение уже готово, добавляем пункт меню сразу. Если нет – ждём событие "ready".
  function createAnitopMenu(){
      window.plugin_anitop_ready = true;
      Lampa.Component.add("anitop", function(){});
      if(window.appready){
          addAnitopMenu();
      } else {
          Lampa.Listener.follow("app", function(e){
              if(e.type === "ready")
                  addAnitopMenu();
          });
      }
  }
  
  if(!window.plugin_anitop_ready) createAnitopMenu();

  // 4. Объект-парсер, который отвечает за открытие экрана каталога
  var animeParser = {
      openCatalog: function(){
          console.log("Anitop plugin: Open catalog");
          if(Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
              // Контент тестового экрана каталога
              var content = '<div style="padding:20px; text-align:center; color:white;">' +
                                'Test: Anitop catalog content' +
                            '</div>';
              // Формируем объект view для экрана
              var view = {
                  name: "anitop_catalog_view",
                  component: "view",
                  template: function(){
                      return content;
                  }
              };
              Lampa.Controller.add(view);
              Lampa.Controller.toggle("anitop_catalog_view");
              console.log("Anitop plugin: Catalog view opened");
          } else {
              console.error("Anitop plugin: Lampa.Controller API not available");
          }
      }
  };

})();
