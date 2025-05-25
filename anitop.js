(function(){
  "use strict";

  // Добавляем перевод для пункта меню
  Lampa.Lang.add({
      anitop_menu: {
          ru: "Anitop",
          en: "Anitop"
      }
  });

  // Функция добавления пункта меню
  function addAnitopMenu(){
      var ico = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle cx="32" cy="32" r="32" fill="#4CAF50"/>' +
                    '<text x="32" y="42" font-size="24" text-anchor="middle" fill="#fff">A</text>' +
                '</svg>';
      var menu_item = $(
          '<li class="menu__item selector" data-action="anitop">' +
              '<div class="menu__ico">' + ico + '</div>' +
              '<div class="menu__text">' + Lampa.Lang.translate("anitop_menu") + '</div>' +
          '</li>'
      );

      // Привязываем обработчик клика
      menu_item.on("hover:enter", function(){
          console.log("Anitop menu activated, opening catalog...");
          Lampa.Activity.push({
              url: '',
              title: 'Anitop',
              component: 'anitop_catalog_component',
              page: 1
          });
      });

      $(".menu .menu__list").eq(1).append(menu_item);
      console.log("Anitop plugin: Menu item added");
  }

  // Ожидание готовности приложения
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

  // Регистрируем компонент каталога
  Lampa.Component.add("anitop_catalog_component", function(object){
      var comp = new Lampa.InteractionCategory(object);

      comp.create = function(){
          console.log("Anitop plugin: Creating catalog...");
          this.activity.loader(true);

          animeParser.loadCatalog((data) => {
              this.build(data);
          }, this.empty.bind(this));

          return this.render();
      };

      return comp;
  });

  // Объект animeParser – отвечает за парсинг каталога
  var animeParser = {
      loadCatalog: function(callback, onError){
          console.log("Anitop plugin: Loading catalog...");
          var catalogUrl = "https://anilib.me/ru/catalog";
          fetch(catalogUrl)
              .then(response => response.text())
              .then(htmlText => {
                  var parser = new DOMParser();
                  var doc = parser.parseFromString(htmlText, "text/html");
                  var cards = doc.querySelectorAll(".anime-card");
                  var items = [];
                  cards.forEach(card => {
                      var linkElem = card.querySelector("a");
                      var titleElem = card.querySelector(".anime-title");
                      var imgElem = card.querySelector("img");
                      if(linkElem && titleElem && imgElem){
                          items.push({
                              title: titleElem.innerText.trim(),
                              url: linkElem.href,
                              image: imgElem.src
                          });
                      }
                  });

                  if (items.length) {
                      callback({ results: items });
                      console.log("Anitop plugin: Catalog loaded successfully");
                  } else {
                      onError();
                      console.error("Anitop plugin: No items found");
                  }
              })
              .catch(error => {
                  console.error("Anitop plugin: Catalog loading failed", error);
                  onError();
              });
      }
  };

  window.animeParser = animeParser;

})();
