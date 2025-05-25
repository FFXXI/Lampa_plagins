(function(){
  "use strict";

  /* ================================
     1. Манифест и переводы
  ================================== */

  // Регистрируем плагин в манифесте Lampa
  var manifest = {
      type: 'video',
      version: '1.0',
      name: 'Anitop',
      description: 'Парсер сайта Anilib.me',
      component: 'anitop_main'
  };
  Lampa.Manifest.plugins = manifest;

  // Добавляем переводы для названия меню
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

  /* ================================
     2. Добавление пункта меню в боковую панель
  ================================== */
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
      // При нажатии запускаем переход через Lampa.Activity.push – открывается компонент "anitop_main"
      menu_item.on("hover:enter", function(){
          console.log("Anitop menu activated, opening catalog...");
          Lampa.Activity.push({
              url: '',
              title: manifest.name,
              component: 'anitop_main',
              page: 1
          });
      });
      // Если в вашей сборке контейнер меню имеет другой индекс, можно попробовать eq(0)
      $(".menu .menu__list").eq(1).append(menu_item);
      console.log("Anitop plugin: Menu item added");
  }
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

  /* ================================
     3. API для парсинга страниц с Anilib.me
  ================================== */
  var AnitopApi = {
      // Загружает и парсит каталог аниме (страница каталога)
      loadCatalog: function(callback, onError){
          console.log("AnitopApi: Loading catalog from anilib.me...");
          var catalogUrl = "https://anilib.me/ru/catalog";
          fetch(catalogUrl)
              .then(response => response.text())
              .then(htmlText => {
                  var parser = new DOMParser();
                  var doc = parser.parseFromString(htmlText, "text/html");
                  // Предполагаем, что карточки аниме имеют класс ".anime-card"
                  var cards = doc.querySelectorAll(".anime-card");
                  var items = [];
                  cards.forEach(card => {
                      // Предполагаем, что ссылка хранится в тегах <a>, заголовок в элементе с классом ".anime-title",
                      // а изображение – в теге <img>
                      var linkElem = card.querySelector("a");
                      var titleElem = card.querySelector(".anime-title");
                      var imgElem = card.querySelector("img");
                      if(linkElem && titleElem && imgElem){
                          items.push({
                              id: linkElem.href,
                              title: titleElem.innerText.trim(),
                              image: imgElem.src,
                              url: linkElem.href
                          });
                      }
                  });
                  if(items.length){
                      // возвращаем объект в виде структуры Lampa (results, page, total_pages)
                      callback({ results: items, page: 1, total_pages: 1 });
                      console.log("AnitopApi: Catalog loaded successfully ("+items.length+" items)");
                  } else {
                      console.error("AnitopApi: No items found in catalog");
                      onError && onError();
                  }
              })
              .catch(error => {
                  console.error("AnitopApi: Catalog loading failed", error);
                  onError && onError();
              });
      },
      // Загружает страницу деталей конкретного аниме и парсит её
      loadAnimeDetail: function(url, callback, onError){
          console.log("AnitopApi: Loading anime detail from:", url);
          fetch(url)
              .then(response => response.text())
              .then(htmlText => {
                  var parser = new DOMParser();
                  var doc = parser.parseFromString(htmlText, "text/html");
                  // Предположим, что заголовок аниме находится в элементе с классом ".anime-detail-title"
                  // и описание в элементе с классом ".anime-detail-desc"
                  var titleElem = doc.querySelector(".anime-detail-title");
                  var descElem = doc.querySelector(".anime-detail-desc");
                  // Серии: предположим, что они лежат в контейнере с классом ".episode-list" и каждому элементу присвоен класс ".episode-item"
                  var episodeElems = doc.querySelectorAll(".episode-item");
                  var episodes = [];
                  episodeElems.forEach(ep => {
                      // Допустим, номер серии находится в элементе с классом ".ep-num"
                      var epNumElem = ep.querySelector(".ep-num");
                      // А ссылка на видео передается в атрибуте data-url у "episode-item"
                      var epLink = ep.getAttribute("data-url") || "#";
                      episodes.push({
                          number: epNumElem ? epNumElem.innerText.trim() : "?",
                          url: epLink
                      });
                  });
                  // Если список эпизодов пуст – использовать тестовые данные
                  if(episodes.length === 0){
                      episodes = [
                          { number: "1", url: "#" },
                          { number: "2", url: "#" }
                      ];
                  }
                  // Если на странице не указаны конкретные опции качества и озвучки – используем дефолтные варианты
                  var quality = ["480p", "720p", "1080p"];
                  var voices  = ["Русская озвучка", "Оригинал"];
                  callback({
                      title: titleElem ? titleElem.innerText.trim() : "Название аниме",
                      description: descElem ? descElem.innerText.trim() : "Описание отсутствует",
                      episodes: episodes,
                      quality: quality,
                      voices: voices
                  });
              })
              .catch(error => {
                  console.error("AnitopApi: Error loading anime detail", error);
                  onError && onError();
              });
      }
  };

  /* ================================
     4. Компонент главного каталога (анимэ список)
  ================================== */
  function componentMain(object){
      var comp = new Lampa.InteractionCategory(object);
      comp.create = function(){
          console.log("Anitop component: Creating main catalog...");
          this.activity.loader(true);
          AnitopApi.loadCatalog((data) => {
              this.build(data);
          }, this.empty.bind(this));
          return this.render();
      };
      comp.nextPageReuest = function(object, resolve, reject){
          // – Если понадобится поддержка пагинации, реализуйте здесь.
          // Пока используем dummy-данные.
          AnitopApi.loadCatalog(object, resolve.bind(comp), reject.bind(comp));
      };
      comp.cardRender = function(object, element, card){
          // Устанавливаем обработчик на нажатие карточки,
          // чтобы открыть детальный экран с выбором качества, озвучки и серий.
          card.onEnter = function(){
              Lampa.Activity.push({
                  url: element.url,  // ссылка на страницу деталей
                  title: element.title,
                  component: 'anitop_detail',
                  page: 1
              });
          };
      };
      return comp;
  }
  Lampa.Component.add("anitop_main", componentMain);

  /* ================================
     5. Компонент страницы деталей аниме
  ================================== */
  function componentDetail(object){
      var comp = new Lampa.InteractionCategory(object);
      comp.create = function(){
          console.log("Anitop component: Creating detail view...");
          this.activity.loader(true);
          AnitopApi.loadAnimeDetail(object.url, (data) => {
              this.build(data);
          }, this.empty.bind(this));
          return this.render();
      };
      return comp;
  }
  Lampa.Component.add("anitop_detail", componentDetail);

  /* ================================
     6. Шаблоны для карточек каталога и деталей (упрощённо)
     Можно расширять по необходимости
  ================================== */
  // Пример шаблона для карточки аниме в каталоге
  Lampa.Template.add('anitop_card', 
      "<div class='card anitop-card selector'>" +
          "<div class='card__view'>" +
              "<img class='card__img' src='./img/img_load.svg'>" +
          "</div>" +
          "<div class='card__title'></div>" +
      "</div>"
  );

  // Пример шаблона для экрана деталей
  Lampa.Template.add('anitop_detail', 
      "<div class='anitop-detail-view' style='padding:20px; color:white;'>" +
         "<h2 class='anitop-detail-title'></h2>" +
         "<div class='anitop-detail-desc' style='margin:10px 0;'></div>" +
         "<div class='anitop-detail-options'>" +
            "<div class='anitop-quality-options'><strong>" + Lampa.Lang.translate("quality_label") + "</strong></div>" +
            "<div class='anitop-voice-options'><strong>" + Lampa.Lang.translate("voice_label") + "</strong></div>" +
         "</div>" +
         "<div class='anitop-episodes'><strong>" + Lampa.Lang.translate("episodes_label") + "</strong></div>" +
      "</div>"
  );

  /* ================================
     7. Глобальный объект для доступа (если понадобится)
  ================================== */
  window.AnitopApi = AnitopApi;

  /* ================================
     8. Отладка – выводим информацию в консоль
  ================================== */
  console.log("Anitop plugin: loaded");

})();
