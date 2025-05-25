(function(){
  "use strict";

  // Конструктор плагина
  function AnitopPlugin(){
    this.name = "anitop";
    this.type = "plugin";
    this.version = "1.0";
    this.author = "FFXXI";
  }

  // Инициализация плагина – вызывается после регистрации
  AnitopPlugin.prototype.init = function(){
    console.log("Anitop: Инициализация плагина.");
    this.renderMenu();
  };

  // Добавляем пункт в меню приложения
  AnitopPlugin.prototype.renderMenu = function(){
    if(window.Lampa && Lampa.Menu && typeof Lampa.Menu.append === "function"){
      // Добавляем пункт меню с текстом, иконкой и обработчиком клика
      Lampa.Menu.append({
        title: "Anitop", // текст пункта меню
        icon: "film",    // используем стандартную иконку, можно изменить
        order: 100,      // порядок, по желанию
        action: this.show.bind(this) // обработчик клика – открывает экран плагина
      });
      console.log("Anitop: Пункт меню добавлен.");
    } else {
      console.error("Anitop: Lampa.Menu.append не найден!");
    }
  };

  // Функция, вызываемая при клике по пункту меню
  AnitopPlugin.prototype.show = function(){
    if(window.Lampa && Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
      // Определяем простую HTML-разметку для экрана плагина
      var html = '<div style="padding:20px; text-align:center; color:white; font-size:24px;">' +
                 'Anitop Plugin Activated!<br>Пример работы плагина.' +
                 '</div>';
      // Создаем объект экрана (view)
      var view = {
        name: "anitop_view",       // имя экрана – должно быть уникальным
        component: "view",         // сообщаем, что это view
        template: function(){
          return html;
        }
      };
      // Регистрируем и показываем новый экран
      Lampa.Controller.add(view);
      Lampa.Controller.toggle("anitop_view");
      console.log("Anitop: Экран плагина открыт.");
    } else {
      console.error("Anitop: Lampa.Controller не доступен!");
    }
  };

  // Регистрируем плагин через систему плагинов Lampa
  if(window.Lampa && Lampa.Plugin && typeof Lampa.Plugin.register === "function"){
    var plugin = new AnitopPlugin();
    Lampa.Plugin.register({ name: plugin.name, type: plugin.type, version: plugin.version, author: plugin.author }, plugin);
    console.log("Anitop: Плагин успешно зарегистрирован.");
    plugin.init();
  } else {
    console.error("Anitop: Lampa.Plugin.register не найден!");
  }

})();
