(function(){
  "use strict";

  // 1. Добавляем переводы для плагина
  Lampa.Lang.add({
      anitop_menu: {
          ru: "Anitop",
          en: "Anitop"
      },
      anitop_loading: {
          ru: "Загрузка каталога...",
          en: "Loading catalog..."
      },
      quality_label: {
          ru: "Качество:",
          en: "Quality:"
      },
      voice_label: {
          ru: "Озвучка:",
          en: "Voice:"
      },
      episodes_label: {
          ru: "Серии:",
          en: "Episodes:"
      }
  });

  // 2. Функция для добавления пункта меню в левую колонку.
  function addAnitopMenu(){
    // Простая SVG-иконка с буквой "A"
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
    // Для уверенности в срабатывании привязаны оба события: hover:enter и click
    menu_item.on("hover:enter click", function(){
        console.log("Anitop menu: activated");
        animeParser.openCatalog();
    });
    // Если в вашей сборке Lampa контейнер меню отличается, попробуйте изменить индекс (например, eq(0) вместо eq(1))
    $(".menu .menu__list").eq(1).append(menu_item);
    console.log("Anitop plugin: Menu item added");
  }

  // 3. Ждём готовности приложения и добавляем пункт меню
  function createAnitopMenu(){
      window.plugin_anitop_ready = true;
      // Регистрируем пустой компонент, аналогично рабочему exit-плагину
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

  // 4. Объект animeParser – отвечает за открытие каталога и деталей
  var animeParser = {
      openCatalog: function(){
          console.log("Anitop plugin: Open catalog");
          // Проверяем доступность API Lampa.Controller
          if(Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
              var content = '<div style="padding:20px; text-align:center; color:white;">' +
                              'Test: Anitop catalog content' +
                            '</div>';
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
              // Для тестирования показываем dummy-данные
              this.loadCatalog();
          } else {
              console.error("Anitop plugin: Lampa.Controller API not available");
          }
      },
      loadCatalog: function(){
          var self = this;
          // Для теста используем dummy-данные; здесь вам нужно будет делать fetch и парсинг HTML
          var dummy = [
              { title: "Naruto", link: "https://anilib.me/ru/anime/naruto", image: "https://via.placeholder.com/300?text=Naruto" },
              { title: "One Piece", link: "https://anilib.me/ru/anime/one-piece", image: "https://via.placeholder.com/300?text=One+Piece" },
              { title: "Attack on Titan", link: "https://anilib.me/ru/anime/aot", image: "https://via.placeholder.com/300?text=AOT" }
          ];
          self.showCatalog(dummy);
      },
      showCatalog: function(items){
          console.log("Anitop plugin: Showing catalog", items);
          var html = '<div style="display:flex; flex-wrap:wrap; justify-content:center;">';
          items.forEach(function(item){
              html += '<div class="anitop-card selector" data-link="' + item.link + '" style="margin:10px; width:150px; cursor:pointer;">' +
                          '<img src="' + item.image + '" alt="' + item.title + '" style="width:100%; border:1px solid #fff;">' +
                          '<div style="text-align:center; margin-top:5px;">' + item.title + '</div>' +
                      '</div>';
          });
          html += '</div>';
          $(".anitop-catalog").html(html);
          // Привязываем событие выбора карточки на оба типа событий
          $(".anitop-card").on("hover:enter click", function(){
              var link = $(this).data("link");
              animeParser.loadAnimeDetail(link);
          });
      },
      loadAnimeDetail: function(link){
          console.log("Anitop plugin: Loading anime detail for", link);
          // Пока используем dummy-данные для деталей
          var details = {
              title: "Тестовое аниме",
              description: "Описание тестового аниме.",
              episodes: [
                  { number: "1", url: "https://via.placeholder.com/300?text=Ep+1" },
                  { number: "2", url: "https://via.placeholder.com/300?text=Ep+2" }
              ],
              quality: ["480p", "720p", "1080p"],
              voices: ["Русская озвучка", "Оригинал"]
          };
          this.showAnimeDetail(details);
      },
      showAnimeDetail: function(details){
          console.log("Anitop plugin: Showing anime detail", details);
          var html = '<div style="padding:20px; color:white;">';
          html += '<h2 style="text-align:center;">' + details.title + '</h2>';
          html += '<p>' + details.description + '</p>';
          // Блок выбора качества
          html += '<div style="margin-top:20px;"><strong>' + Lampa.Lang.translate("quality_label") + '</strong> ';
          details.quality.forEach(function(q){
              html += '<span class="anitop-quality selector" data-quality="' + q + '" style="margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;">' + q + '</span>';
          });
          html += '</div>';
          // Блок выбора озвучки
          html += '<div style="margin-top:20px;"><strong>' + Lampa.Lang.translate("voice_label") + '</strong> ';
          details.voices.forEach(function(v){
              html += '<span class="anitop-voice selector" data-voice="' + v + '" style="margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;">' + v + '</span>';
          });
          html += '</div>';
          // Список эпизодов
          html += '<div style="margin-top:20px;"><strong>' + Lampa.Lang.translate("episodes_label") + '</strong><br>';
          details.episodes.forEach(function(ep){
              html += '<span class="anitop-episode selector" data-episode="' + ep.number + '" data-url="' + ep.url + '" style="margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;">Эп.' + ep.number + '</span>';
          });
          html += '</div></div>';

          if(Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
              var view = {
                  name: "anitop_detail_view",
                  component: "view",
                  template: function(){ return '<div class="anitop-detail">' + html + '</div>'; }
              };
              Lampa.Controller.add(view);
              Lampa.Controller.toggle("anitop_detail_view");

              // Обработчики для выбора качества, озвучки и сериальных пунктов 
              $(".anitop-quality").on("hover:enter click", function(){
                  $(".anitop-quality").removeClass("active");
                  $(this).addClass("active");
                  console.log("Selected quality:", $(this).data("quality"));
              });
              $(".anitop-voice").on("hover:enter click", function(){
                  $(".anitop-voice").removeClass("active");
                  $(this).addClass("active");
                  console.log("Selected voice:", $(this).data("voice"));
              });
              $(".anitop-episode").on("hover:enter click", function(){
                  var ep = $(this).data("episode"),
                      url = $(this).data("url");
                  console.log("Selected episode:", ep, url);
                  Lampa.Activity.push({ url: url, title: details.title + " - Эп." + ep });
              });
          } else {
              console.error("Anitop plugin: Lampa.Controller API not available for details");
          }
      }
  };

  // Экспортируем объект для глобального доступа (если потребуется)
  window.animeParser = animeParser;

})();
