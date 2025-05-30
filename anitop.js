(function(){
  "use strict";

  /* ================================
     1. Манифест и переводы
  ================================ */
  var manifest = {
    type: 'video',
    version: '1.0.0',
    name: 'Anitop',
    description: 'Парсер каталога Anilib.me',
    component: 'anitop_main'
  };
  Lampa.Manifest.plugins = manifest;

  Lampa.Lang.add({
    anitop_menu: {
      ru: "Anitop",
      en: "Anitop"
    },
    anitop_loading: {
      ru: "Загрузка каталога…",
      en: "Loading catalog…"
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
  ================================ */
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
    // При нажатии запускается переход в компонент "anitop_main"
    menu_item.on("hover:enter", function(){
      console.log("Anitop menu activated, opening catalog…");
      Lampa.Activity.push({
        url: '',
        title: manifest.name,
        component: 'anitop_main',
        page: 1
      });
    });
    // Если у вашей сборки меню находится в другом контейнере – при необходимости измените индекс eq(1) (попробуйте eq(0))
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
     3. API для парсинга
  ================================ */
  var AnitopApi = {
    // Загружает HTML каталога и парсит карточки аниме
    loadCatalog: function(callback, onError){
      // Если требуется использовать прокси из-за CORS, раскомментируйте следующую строку:
      // var catalogUrl = "https://corsproxy.io/?https://anilib.me/ru/catalog";
      var catalogUrl = "https://anilib.me/ru/catalog";
      console.log("AnitopApi: Loading catalog from", catalogUrl);
      fetch(catalogUrl)
        .then(function(response){
          return response.text();
        })
        .then(function(htmlText){
          var parser = new DOMParser();
          var doc = parser.parseFromString(htmlText, "text/html");
          // Используем селектор .card-item для карточек
          var cards = doc.querySelectorAll(".card-item");
          var items = [];
          cards.forEach(function(card){
            var linkElem = card.querySelector("a.cover"); // ссылочный элемент с классом cover
            var titleElem = card.querySelector(".card-item-caption__main");
            var imgElem = card.querySelector("img.cover__img"); 
            if(linkElem && titleElem && imgElem){
              var href = linkElem.getAttribute("href") || "";
              // Если ссылка относительная, добавляем базовый URL
              if(href.startsWith("/")){
                href = "https://anilib.me" + href;
              }
              items.push({
                id: href,
                title: titleElem.innerText.trim(),
                image: imgElem.getAttribute("src"),
                url: href
              });
            }
          });
          if(items.length === 0){
            console.warn("AnitopApi: No items found – using dummy data");
            items = [
              { id: "#", title: "Naruto", image: "https://via.placeholder.com/300?text=Naruto", url: "https://anilib.me/ru/anime/naruto" },
              { id: "#", title: "One Piece", image: "https://via.placeholder.com/300?text=One+Piece", url: "https://anilib.me/ru/anime/one-piece" },
              { id: "#", title: "Attack on Titan", image: "https://via.placeholder.com/300?text=AOT", url: "https://anilib.me/ru/anime/aot" }
            ];
          }
          callback({ results: items, page: 1, total_pages: 1 });
          console.log("AnitopApi: Catalog loaded successfully ("+ items.length +" items)");
        })
        .catch(function(error){
          console.error("AnitopApi: Catalog loading failed", error);
          onError && onError();
        });
    },
    // Загружает HTML-страницу деталей аниме и парсит информацию
    loadAnimeDetail: function(url, callback, onError){
      console.log("AnitopApi: Loading anime detail from", url);
      fetch(url)
        .then(function(response){
          return response.text();
        })
        .then(function(htmlText){
          var parser = new DOMParser();
          var doc = parser.parseFromString(htmlText, "text/html");
          // Пример: заголовок детали в элементе с классом .anime-detail-title,
          // описание в .anime-detail-desc; список эпизодов – элементы с классом .episode-item и внутри .ep-num
          var titleElem = doc.querySelector(".anime-detail-title");
          var descElem = doc.querySelector(".anime-detail-desc");
          var episodeElems = doc.querySelectorAll(".episode-item");
          if(!titleElem || !descElem){
            console.warn("AnitopApi: Detail page not parsed – using dummy detail");
            callback({
              title: "Dummy Anime Title",
              description: "Это тестовое описание для демонстрации работы плагина.",
              episodes: [
                { number: "1", url: "https://via.placeholder.com/300?text=Ep+1" },
                { number: "2", url: "https://via.placeholder.com/300?text=Ep+2" }
              ],
              quality: ["480p", "720p", "1080p"],
              voices: ["Русская озвучка", "Оригинал"]
            });
            return;
          }
          var episodes = [];
          episodeElems.forEach(function(ep){
            var epNumElem = ep.querySelector(".ep-num");
            var epNum = epNumElem ? epNumElem.innerText.trim() : "?";
            var epLink = ep.getAttribute("data-url") || "#";
            episodes.push({ number: epNum, url: epLink });
          });
          if(episodes.length === 0){
            console.warn("AnitopApi: No episodes found – using dummy episodes");
            episodes = [
              { number: "1", url: "https://via.placeholder.com/300?text=Ep+1" },
              { number: "2", url: "https://via.placeholder.com/300?text=Ep+2" }
            ];
          }
          var quality = ["480p", "720p", "1080p"];
          var voices  = ["Русская озвучка", "Оригинал"];
          callback({
            title: titleElem.innerText.trim(),
            description: descElem.innerText.trim(),
            episodes: episodes,
            quality: quality,
            voices: voices
          });
        })
        .catch(function(error){
          console.error("AnitopApi: Error loading anime detail", error);
          onError && onError();
        });
    }
  };

  /* ================================
     4. Компоненты Lampa
  ================================ */
  // Компонент главного каталога – вывод карточек аниме
  function componentMain(object){
    var comp = new Lampa.InteractionCategory(object);
    if(!comp.dom || !comp.dom.length){
      comp.dom = $("<div class='anitop-main'></div>");
    }
    comp.create = function(){
      console.log("Anitop component: Creating main catalog…");
      this.activity.loader(true);
      AnitopApi.loadCatalog((data) => {
        this.dom.empty();
        data.results.forEach(function(item){
          var card = $(Lampa.Template.get('anitop_card', item, true));
          card.find('.card__title').text(item.title);
          card.find('.card__img').attr('src', item.image)
            .on("error", function(){ $(this).attr("src", "./img/img_broken.svg"); });
          card.on("hover:enter", function(){
            Lampa.Activity.push({
              url: item.url,
              title: item.title,
              component: 'anitop_detail',
              page: 1
            });
          });
          comp.dom.append(card);
        });
        this.activity.loader(false);
      }, this.empty.bind(this));
      return this.render();
    };
    return comp;
  }
  Lampa.Component.add("anitop_main", componentMain);

  // Компонент страницы деталей аниме
  function componentDetail(object){
    var comp = new Lampa.InteractionCategory(object);
    if(!comp.dom || !comp.dom.length){
      comp.dom = $("<div class='anitop-detail-container'></div>");
    }
    comp.create = function(){
      console.log("Anitop component: Creating detail view…");
      this.activity.loader(true);
      AnitopApi.loadAnimeDetail(object.url, (data) => {
        var tpl = Lampa.Template.get('anitop_detail', data, true);
        comp.dom.html(tpl);
        setTimeout(function(){
          renderDetail(data, comp.dom);
        }, 100);
        this.activity.loader(false);
      }, this.empty.bind(this));
      return this.render();
    };
    return comp;
  }
  Lampa.Component.add("anitop_detail", componentDetail);

  /* ================================
     5. Шаблоны
  ================================ */
  // Шаблон карточки каталога
  Lampa.Template.add('anitop_card',
    "<div class='card anitop-card selector'>" +
      "<div class='card__view'>" +
        "<img class='card__img' src='./img/img_load.svg'>" +
      "</div>" +
      "<div class='card__title'></div>" +
    "</div>"
  );
  // Шаблон страницы деталей
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
     6. Отрисовка и обработка деталей
  ================================ */
  function attachDetailHandlers(container){
    container.find(".anitop-quality-option").on("hover:enter", function(){
      container.find(".anitop-quality-option").removeClass("active");
      $(this).addClass("active");
      console.log("Selected quality:", $(this).data("quality"));
    });
    container.find(".anitop-voice-option").on("hover:enter", function(){
      container.find(".anitop-voice-option").removeClass("active");
      $(this).addClass("active");
      console.log("Selected voice:", $(this).data("voice"));
    });
    container.find(".anitop-episode").on("hover:enter", function(){
      var epNumber = $(this).data("episode"),
          videoUrl = $(this).data("url");
      console.log("Selected episode:", epNumber, videoUrl);
      Lampa.Activity.push({
        url: videoUrl,
        title: container.find(".anitop-detail-title").text() + " - Эп." + epNumber
      });
    });
  }
  function renderDetail(data, container){
    var tpl = Lampa.Template.get('anitop_detail', data, true);
    container.html(tpl);
    var qualityHtml = "";
    data.quality.forEach(function(q){
      qualityHtml += "<span class='anitop-quality-option selector' data-quality='" + q + "' style='margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;'>" + q + "</span>";
    });
    container.find(".anitop-quality-options").append(qualityHtml);
    var voiceHtml = "";
    data.voices.forEach(function(v){
      voiceHtml += "<span class='anitop-voice-option selector' data-voice='" + v + "' style='margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;'>" + v + "</span>";
    });
    container.find(".anitop-voice-options").append(voiceHtml);
    var episodesHtml = "";
    data.episodes.forEach(function(ep){
      episodesHtml += "<span class='anitop-episode selector' data-episode='" + ep.number + "' data-url='" + ep.url + "' style='margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;'>Эп." + ep.number + "</span>";
    });
    container.find(".anitop-episodes").append(episodesHtml);
    attachDetailHandlers(container);
  }

  /* ================================
     7. Альтернативная регистрация меню
  ================================ */
  function addMenuButton(){
    var button = $(
      "<li class='menu__item selector'>" +
         "<div class='menu__ico'>" +
           "<svg width='191' height='239' viewBox='0 0 191 239' fill='none' xmlns='http://www.w3.org/2000/svg'>" +
             "<path d='M35.3438 35.3414V26.7477C35.3438 19.9156 38.0594 13.3543 42.8934 8.51604C47.7297 3.68251 54.2874 0.967027 61.125 0.966431H164.25C171.086 0.966431 177.643 3.68206 182.482 8.51604C187.315 13.3524 190.031 19.91 190.031 26.7477V186.471C190.031 189.87 189.022 193.192 187.133 196.018C185.245 198.844 182.561 201.046 179.421 202.347C176.28 203.647 172.825 203.988 169.492 203.325C166.158 202.662 163.096 201.026 160.692 198.623L155.656 193.587V220.846C155.656 224.245 154.647 227.567 152.758 230.393C150.87 233.219 148.186 235.421 145.046 236.722C141.905 238.022 138.45 238.363 135.117 237.7C131.783 237.037 128.721 235.401 126.317 232.998L78.3125 184.993L30.3078 232.998C27.9041 235.401 24.8419 237.037 21.5084 237.7C18.1748 238.363 14.7195 238.022 11.5794 236.722C8.43922 235.421 5.75517 233.219 3.86654 230.393C1.9779 227.567 0.969476 224.245 0.96875 220.846V61.1227C0.96875 54.2906 3.68437 47.7293 8.51836 42.891C13.3547 38.0575 19.9124 35.342 26.75 35.3414H35.3438ZM138.469 220.846V61.1227C138.469 58.8435 137.563 56.6576 135.952 55.046C134.34 53.4343 132.154 52.5289 129.875 52.5289H26.75C24.4708 52.5289 22.2849 53.4343 20.6733 55.046C19.0617 56.6576 18.1562 58.8435 18.1562 61.1227V220.846L66.1609 172.841C69.3841 169.619 73.755 167.809 78.3125 167.809C82.87 167.809 87.2409 169.619 90.4641 172.841L138.469 220.846ZM155.656 169.284L172.844 186.471V26.7477C172.844 24.4685 171.938 22.2826 170.327 20.671C168.715 19.0593 166.529 18.1539 164.25 18.1539H61.125C58.8458 18.1539 56.6599 19.0593 55.0483 20.671C53.4367 22.2826 52.5312 24.4685 52.5312 26.7477V35.3414H129.875C136.711 35.3414 143.268 38.0571 148.107 42.891C152.94 47.7274 155.656 54.285 155.656 61.1227V169.284Z' fill='currentColor'></path>" +
           "</svg>" +
         "</div>" +
         "<div class='menu__text'>" + manifest.name + "</div>" +
      "</li>"
    );
    button.on('hover:enter', function(){
      Lampa.Activity.push({
        url: '',
        title: manifest.name,
        component: 'anitop_main',
        page: 1
      });
    });
    $('.menu .menu__list').eq(0).append(button);
  }
  if(window.appready)
    addMenuButton();
  else {
    Lampa.Listener.follow('app', function(e){
      if(e.type === 'ready') addMenuButton();
    });
  }

  /* ================================
     7. Запуск плагина
  ================================ */
  function startPlugin(){
    if(!window.anitop_ready && Lampa.Manifest.app_digital >= 242){
      window.anitop_ready = true;
      startPlugin = null;
    }
  }
  if(!window.anitop_ready) startPlugin();

  console.log("Anitop plugin: loaded");

})();
