(function(){
  "use strict";

  // Добавляем языковую поддержку для пункта меню
  Lampa.Lang.add({
    anime_parser: {
      ru: "Аниме парсер",
      en: "Anime Parser",
      uk: "Anime Parser",
      be: "Anime Parser"
    }
  });

  // Конструктор плагина парсера аниме
  function AnimeParser(){
    this.name = "anime_parser";
    this.type = "plugin";
    this.version = "1.0";
    this.author = "ВашеИмя"; // замените на свое имя или ник
  }

  // Инициализация плагина
  AnimeParser.prototype.init = function(){
    console.log("AnimeParser: Инициализация плагина");
    this.addMenuItem();
  };

  // Функция добавления пункта меню в интерфейс Lampa
  AnimeParser.prototype.addMenuItem = function(){
    if (window.Lampa && Lampa.Menu && typeof Lampa.Menu.append === "function"){
      // Пример простой иконки (SVG) с буквой A
      var ico = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
                  '<circle cx="32" cy="32" r="32" fill="#4CAF50"/>' +
                  '<text x="32" y="42" font-size="24" text-anchor="middle" fill="#fff">A</text>' +
                '</svg>';
      var menu_item = $(
        '<li class="menu__item selector" data-action="anime_parser">' +
          '<div class="menu__ico">' + ico + '</div>' +
          '<div class="menu__text">' + Lampa.Lang.translate("anime_parser") + '</div>' +
        '</li>'
      );
      // При клике на пункт меню вызывается обработчик onClick
      menu_item.on("hover:enter", this.onClick.bind(this));
      // Добавляем элемент в меню – во второй список меню, как в известных плагинах
      $(".menu .menu__list").eq(1).append(menu_item);
      console.log("AnimeParser: Пункт меню добавлен");
    } else {
      console.error("AnimeParser: Lampa.Menu.append не найден");
    }
  };

  // Обработчик клика по пункту меню
  AnimeParser.prototype.onClick = function(){
    console.log("AnimeParser: Пункт меню нажат");
    // Запускаем парсинг аниме (в этом примере используется тестовый список)
    this.loadAnime();
  };

  // Функция, выполняющая «парсинг» или загрузку списка аниме
  AnimeParser.prototype.loadAnime = function(){
    console.log("AnimeParser: Начало загрузки аниме");
    // Здесь можно сделать Ajax-запрос к вашему API или распарсить HTML с внешнего ресурса.
    // Для примера создадим тестовый список аниме.
    var animeList = [
      { title: "Naruto", image: "https://via.placeholder.com/300", url: "https://example.com/naruto" },
      { title: "One Piece", image: "https://via.placeholder.com/300", url: "https://example.com/onepiece" },
      { title: "Attack on Titan", image: "https://via.placeholder.com/300", url: "https://example.com/aot" }
    ];
    // После загрузки данных открываем экран с аниме
    this.showAnimeScreen(animeList);
  };

  // Функция отображения экрана с полученным списком аниме
  AnimeParser.prototype.showAnimeScreen = function(animeList){
    console.log("AnimeParser: Открытие экрана аниме");
    if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
      var html = '<div class="anime-parser-list" style="display:flex; flex-wrap:wrap; justify-content:center;">';
      animeList.forEach(function(anime){
        html += '<div class="anime-item" style="margin:10px; border:1px solid #fff; padding:10px; max-width:300px;">' +
                  '<img src="'+anime.image+'" alt="'+anime.title+'" style="width:100%;">' +
                  '<div style="text-align:center; margin-top:5px;">'+ anime.title +'</div>' +
                '</div>';
      });
      html += '</div>';
      
      var view = {
        name: "anime_parser_view",
        component: "view",
        template: function(){
          return '<div style="padding:20px; color:white;">' + html + '</div>';
        }
      };
      Lampa.Controller.add(view);
      Lampa.Controller.toggle("anime_parser_view");
      console.log("AnimeParser: Экран с аниме открыт");
    } else {
      console.error("AnimeParser: Lampa.Controller не доступен");
    }
  };

  // Регистрируем плагин через систему плагинов Lampa
  if(window.Lampa && Lampa.Plugin && typeof Lampa.Plugin.register === "function"){
    var plugin = new AnimeParser();
    Lampa.Plugin.register({ name: plugin.name, type: plugin.type, version: plugin.version, author: plugin.author }, plugin);
    plugin.init();
    console.log("AnimeParser: Плагин успешно зарегистрирован");
  } else {
    console.error("AnimeParser: Lampa.Plugin.register не найден");
  }
  
})();
