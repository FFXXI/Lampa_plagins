(function(){
  "use strict";

  // 1. Добавляем перевод для пункта меню
  Lampa.Lang.add({
      anitop_menu: {
          ru: "Anitop",
          en: "Anitop"
      }
  });

  // 2. Функция добавления пункта меню
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
      menu_item.on("hover:enter click", function(){
          console.log("Anitop menu: activated");
          animeParser.openCatalog();
      });

      $(".menu .menu__list").eq(1).append(menu_item);
      console.log("Anitop plugin: Menu item added");
  }

  // 3. Ожидание готовности приложения
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

  // 4. Объект animeParser – отвечает за парсинг каталога и деталей
  var animeParser = {
      openCatalog: function(){
          console.log("Anitop plugin: Open catalog");
          if(Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
              var content = '<div style="padding:20px; text-align:center; color:white;">' +
                              'Загрузка каталога...' +
                            '</div>';
              var view = {
                  name: "anitop_catalog_view",
                  component: "view",
                  template: function(){
                      return content;
                  }
              };
              Lampa.Controller.add(view);
              setTimeout(() => {
                  Lampa.Controller.toggle("anitop_catalog_view");
              }, 500);
              console.log("Anitop plugin: Catalog view opened");
              this.loadCatalog();
          } else {
              console.error("Anitop plugin: Lampa.Controller API not available");
          }
      },
      loadCatalog: function(){
          var self = this;
          var catalogUrl = "https://anilib.me/ru/catalog"; // URL каталога
          fetch(catalogUrl)
              .then(response => response.text())
              .then(htmlText => {
                  var parser = new DOMParser();
                  var doc = parser.parseFromString(htmlText, "text/html");
                  var cards = doc.querySelectorAll(".anime-card"); // Найти элементы каталога
                  var items = [];
                  cards.forEach(card => {
                      var linkElem = card.querySelector("a");
                      var titleElem = card.querySelector(".anime-title");
                      var imgElem = card.querySelector("img");
                      if(linkElem && titleElem && imgElem){
                          items.push({
                              title: titleElem.innerText.trim(),
                              link: linkElem.href,
                              image: imgElem.src
                          });
                      }
                  });
                  self.showCatalog(items);
              })
              .catch(error => {
                  console.error("Anitop plugin: Ошибка загрузки каталога", error);
              });
      },
      showCatalog: function(items){
          console.log("Anitop plugin: Showing catalog", items);
          var html = '<div style="display:flex; flex-wrap:wrap; justify-content:center;">';
          items.forEach(item => {
              html += '<div class="anitop-card selector" data-link="' + item.link + '" style="margin:10px; width:150px; cursor:pointer;">' +
                          '<img src="' + item.image + '" alt="' + item.title + '" style="width:100%; border:1px solid #fff;">' +
                          '<div style="text-align:center; margin-top:5px;">' + item.title + '</div>' +
                      '</div>';
          });
          html += '</div>';
          $(".anitop-catalog").html(html);
          $(".anitop-card").on("hover:enter click", function(){
              var link = $(this).data("link");
              animeParser.loadAnimeDetail(link);
          });
      },
      loadAnimeDetail: function(link){
          console.log("Anitop plugin: Loading anime detail for", link);
          fetch(link)
              .then(response => response.text())
              .then(htmlText => {
                  var parser = new DOMParser();
                  var doc = parser.parseFromString(htmlText, "text/html");
                  var titleElem = doc.querySelector(".anime-detail-title");
                  var descElem = doc.querySelector(".anime-detail-desc");
                  var episodeElems = doc.querySelectorAll(".episode-item");
                  var details = {
                      title: titleElem ? titleElem.innerText.trim() : "Название аниме",
                      description: descElem ? descElem.innerText.trim() : "Описание отсутствует",
                      episodes: [],
                      quality: ["480p", "720p", "1080p"],
                      voices: ["Русская озвучка", "Оригинал"]
                  };
                  episodeElems.forEach(ep => {
                      var epLink = ep.dataset.url || "#";
                      var epNumElem = ep.querySelector(".ep-num");
                      var epNum = epNumElem ? epNumElem.innerText.trim() : "?";
                      details.episodes.push({ number: epNum, url: epLink });
                  });
                  animeParser.showAnimeDetail(details);
              })
              .catch(error => {
                  console.error("Anitop plugin: Ошибка загрузки деталей", error);
              });
      },
      showAnimeDetail: function(details){
          console.log("Anitop plugin: Showing anime detail", details);
          var html = '<div style="padding:20px; color:white;">';
          html += '<h2 style="text-align:center;">' + details.title + '</h2>';
          html += '<p>' + details.description + '</p>';
          html += '</div>';
          var view = {
              name: "anitop_detail_view",
              component: "view",
              template: function(){ return '<div class="anitop-detail">' + html + '</div>'; }
          };
          Lampa.Controller.add(view);
          Lampa.Controller.toggle("anitop_detail_view");
      }
  };

  window.animeParser = animeParser;

})();
