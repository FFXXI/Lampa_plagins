(function(){
  "use strict";

  // 1. Добавляем переводы для элементов плагина
  Lampa.Lang.add({
    anitop_menu: {
      ru: "Anitop (Аниме парсер)",
      en: "Anitop (Anime Parser)",
      uk: "Anitop (Anime Parser)",
      be: "Anitop (Anime Parser)"
    },
    anitop_loading: {
      ru: "Загрузка каталога...",
      en: "Loading catalog...",
      uk: "Loading catalog...",
      be: "Loading catalog..."
    },
    quality_label: {
      ru: "Качество:",
      en: "Quality:",
      uk: "Quality:",
      be: "Quality:"
    },
    voice_label: {
      ru: "Озвучка:",
      en: "Voice:",
      uk: "Voice:",
      be: "Voice:"
    },
    episodes_label: {
      ru: "Серии:",
      en: "Episodes:",
      uk: "Episodes:",
      be: "Episodes:"
    }
  });

  // 2. Конструктор плагина
  function AnimeParserPlugin(){
    this.name = "anitop";
    this.type = "plugin";
    this.version = "1.0";
    this.author = "ВашеИмя"; // замените своим именем
  }

  // 3. Инициализация плагина
  AnimeParserPlugin.prototype.init = function(){
    console.log("Anitop Plugin: Инициализация плагина");
    this.addMenuItem();
  };

  // 4. Добавление пункта меню в левую колонку Lampa
  AnimeParserPlugin.prototype.addMenuItem = function(){
    if(Lampa && Lampa.Menu && typeof Lampa.Menu.append === "function"){
      // Простая SVG иконка с буквой "A"
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
      menu_item.on("hover:enter", this.openCatalog.bind(this));
      // Добавляем элемент во 2-ой список меню (аналогично рабочим плагинам)
      $(".menu .menu__list").eq(1).append(menu_item);
      console.log("Anitop Plugin: Пункт меню добавлен");
    } else {
      console.error("Anitop Plugin: Lampa.Menu.append не найден");
    }
  };

  // 5. Открытие каталога – создаем экран, показываем сообщение о загрузке,
  //    затем запускаем функцию загрузки каталога
  AnimeParserPlugin.prototype.openCatalog = function(){
    console.log("Anitop Plugin: Открытие каталога");
    if(Lampa && Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
      var loadingHtml = '<div style="padding:20px; text-align:center; color:white;">' +
                          Lampa.Lang.translate("anitop_loading") + '</div>';
      var view = {
        name: "anitop_catalog_view",
        component: "view",
        template: function(){
          return '<div class="anitop-catalog" style="padding:10px; color:white;">' + loadingHtml + '</div>';
        }
      };
      Lampa.Controller.add(view);
      Lampa.Controller.toggle("anitop_catalog_view");
      // Далее загружаем каталог
      this.loadCatalog();
    } else {
      console.error("Anitop Plugin: Lampa.Controller API недоступен");
    }
  };

  // 6. Загрузка каталога. Здесь пример запроса к URL каталога.
  //    Замените URL на подходящий с сайта anilib.me. Если CORS блокирует запрос – используйте прокси.
  AnimeParserPlugin.prototype.loadCatalog = function(){
    var self = this;
    var catalogUrl = "https://anilib.me/ru/catalog"; // пример; обновите если нужно
    fetch(catalogUrl)
      .then(function(response){
        return response.text();
      })
      .then(function(htmlText){
        // Парсим HTML-строку
        var parser = new DOMParser();
        var doc = parser.parseFromString(htmlText, "text/html");
        // Здесь выбираем элементы каталога.
        // Например, пусть каждый тайтл находится в элементе с классом ".anime-card"
        var cards = doc.querySelectorAll(".anime-card");
        var items = [];
        cards.forEach(function(card){
          // Предположим, что:
          // - Заголовок находится в элементе с классом ".anime-title"
          // - Обложка – в теге <img>, а ссылка – в родительском <a>
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
        // Если парсинг не дал результатов – использовать тестовые данные
        if(!items.length){
          items = [
            { title: "Naruto", link: "https://anilib.me/ru/anime/naruto", image: "https://via.placeholder.com/300?text=Naruto" },
            { title: "One Piece", link: "https://anilib.me/ru/anime/one-piece", image: "https://via.placeholder.com/300?text=One+Piece" },
            { title: "Attack on Titan", link: "https://anilib.me/ru/anime/aot", image: "https://via.placeholder.com/300?text=AOT" }
          ];
        }
        self.showCatalog(items);
      })
      .catch(function(error){
        console.error("Anitop Plugin: Ошибка загрузки каталога", error);
        // В случае ошибки использовать тестовые данные
        var dummy = [
          { title: "Naruto", link: "https://anilib.me/ru/anime/naruto", image: "https://via.placeholder.com/300?text=Naruto" },
          { title: "One Piece", link: "https://anilib.me/ru/anime/one-piece", image: "https://via.placeholder.com/300?text=One+Piece" },
          { title: "Attack on Titan", link: "https://anilib.me/ru/anime/aot", image: "https://via.placeholder.com/300?text=AOT" }
        ];
        self.showCatalog(dummy);
      });
  };

  // 7. Отображение страницы каталога – вывод карточек аниме
  AnimeParserPlugin.prototype.showCatalog = function(items){
    console.log("Anitop Plugin: Каталог получен", items);
    var html = '<div style="display:flex; flex-wrap:wrap; justify-content:center;">';
    items.forEach(function(item){
      html += '<div class="anitop-card selector" data-link="'+ item.link +'" style="margin:10px; width:150px; cursor:pointer;">' +
                '<img src="'+ item.image +'" alt="'+ item.title +'" style="width:100%; border:1px solid #fff;">' +
                '<div style="text-align:center; margin-top:5px;">'+ item.title +'</div>' +
              '</div>';
    });
    html += '</div>';
    $(".anitop-catalog").html(html);
    // Навешиваем обработчик клика на карточки
    $(".anitop-card").on("hover:enter", function(){
      var link = $(this).data("link");
      // Переходим к загрузке деталей выбранного аниме
      animeParser.loadAnimeDetail(link);
    });
  };

  // 8. Загрузка деталей аниме по ссылке
  AnimeParserPlugin.prototype.loadAnimeDetail = function(detailUrl){
    var self = this;
    console.log("Anitop Plugin: Загрузка деталей по ссылке ", detailUrl);
    fetch(detailUrl)
      .then(function(response){ return response.text(); })
      .then(function(htmlText){
        var parser = new DOMParser();
        var doc = parser.parseFromString(htmlText, "text/html");
        // Здесь вы должны найти нужные элементы на странице деталей.
        // Например, пусть:
        // - Заголовок в элементе с классом ".anime-detail-title"
        // - Описание в ".anime-detail-desc"
        // - Список эпизодов – в контейнере ".episode-list" с элементами ".episode-item"
        var titleElem = doc.querySelector(".anime-detail-title");
        var descElem = doc.querySelector(".anime-detail-desc");
        var episodeElems = doc.querySelectorAll(".episode-item");
        // Качество и озвучка можно задать, если они указаны на странице, или использовать тестовые значения.
        var details = {
          title: titleElem ? titleElem.innerText.trim() : "Название аниме",
          description: descElem ? descElem.innerText.trim() : "Описание отсутствует",
          episodes: [],
          quality: ["480p", "720p", "1080p"],
          voices: ["Русская озвучка", "Оригинал"]
        };
        episodeElems.forEach(function(ep){
          // Допустим, ссылка на серию хранится в data-url, а номер серии – в элементе с классом ".ep-num"
          var epLink = ep.dataset.url || "#";
          var epNumElem = ep.querySelector(".ep-num");
          var epNum = epNumElem ? epNumElem.innerText.trim() : "?";
          details.episodes.push({ number: epNum, url: epLink });
        });
        // Если не нашлось эпизодов, используем тестовые данные
        if(details.episodes.length === 0){
          details.episodes = [
            { number: "1", url: "https://via.placeholder.com/300?text=Ep+1" },
            { number: "2", url: "https://via.placeholder.com/300?text=Ep+2" },
            { number: "3", url: "https://via.placeholder.com/300?text=Ep+3" }
          ];
        }
        self.showAnimeDetail(details);
      })
      .catch(function(error){
        console.error("Anitop Plugin: Ошибка загрузки деталей", error);
        // Тестовый вариант
        self.showAnimeDetail({
          title: "Тестовое аниме",
          description: "Описание тестового аниме.",
          episodes: [
            { number: "1", url: "https://via.placeholder.com/300?text=Ep+1" },
            { number: "2", url: "https://via.placeholder.com/300?text=Ep+2" }
          ],
          quality: ["480p", "720p", "1080p"],
          voices: ["Русская озвучка", "Оригинал"]
        });
      });
  };

  // 9. Отображение экрана деталей аниме с выбором качества, озвучки и серий
  AnimeParserPlugin.prototype.showAnimeDetail = function(details){
    console.log("Anitop Plugin: Показ деталей аниме", details);
    var html = '<div style="padding:20px; color:white;">';
    html += '<h2 style="text-align:center;">'+ details.title +'</h2>';
    html += '<p>'+ details.description +'</p>';
    
    // Выбор качества видео
    html += '<div style="margin-top:20px;"><strong>'+ Lampa.Lang.translate("quality_label") +'</strong> ';
    details.quality.forEach(function(q){
      html += '<span class="anitop-quality selector" data-quality="'+ q +'" style="margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;">'+ q +'</span>';
    });
    html += '</div>';
    
    // Выбор озвучки
    html += '<div style="margin-top:20px;"><strong>'+ Lampa.Lang.translate("voice_label") +'</strong> ';
    details.voices.forEach(function(v){
      html += '<span class="anitop-voice selector" data-voice="'+ v +'" style="margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;">'+ v +'</span>';
    });
    html += '</div>';
    
    // Список эпизодов
    html += '<div style="margin-top:20px;"><strong>'+ Lampa.Lang.translate("episodes_label") +'</strong><br>';
    details.episodes.forEach(function(ep){
      html += '<span class="anitop-episode selector" data-episode="'+ ep.number +'" data-url="'+ ep.url +'" style="margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;">Эп.'+ ep.number +'</span>';
    });
    html += '</div>';
    
    html += '</div>';

    if(Lampa && Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
      var view = {
        name: "anitop_detail_view",
        component: "view",
        template: function(){
          return '<div class="anitop-detail">'+ html +'</div>';
        }
      };
      Lampa.Controller.add(view);
      Lampa.Controller.toggle("anitop_detail_view");

      // Обработчики выбора качества и озвучки
      $(".anitop-quality").on("hover:enter", function(){
        $(".anitop-quality").removeClass("active");
        $(this).addClass("active");
        console.log("Выбрано качество:", $(this).data("quality"));
      });
      $(".anitop-voice").on("hover:enter", function(){
        $(".anitop-voice").removeClass("active");
        $(this).addClass("active");
        console.log("Выбрана озвучка:", $(this).data("voice"));
      });
      // Обработка клика по серии – запуск плеера через Lampa.Activity.push
      $(".anitop-episode").on("hover:enter", function(){
        var ep = $(this).data("episode"),
            videoUrl = $(this).data("url");
        console.log("Выбрана серия:", ep, videoUrl);
        // Здесь можно дополнительно передать выбранные параметры качества и озвучки,
        // если они нужны плееру.
        Lampa.Activity.push({ url: videoUrl, title: details.title + " - Эп." + ep });
      });
      console.log("Anitop Plugin: Детали аниме отображены");
    } else {
      console.error("Anitop Plugin: Lampa.Controller API недоступен для деталей");
    }
  };

  // 10. Регистрация плагина в системе Lampa
  if(window.Lampa && Lampa.Plugin && typeof Lampa.Plugin.register === "function"){
    var plugin = new AnimeParserPlugin();
    Lampa.Plugin.register({ name: plugin.name, type: plugin.type, version: plugin.version, author: plugin.author }, plugin);
    plugin.init();
    console.log("Anitop Plugin: Плагин успешно зарегистрирован");
  } else {
    console.error("Anitop Plugin: Lampa.Plugin.register не доступен");
  }

  // Для удобного доступа из обработчиков
  var animeParser = new AnimeParserPlugin();
})();
