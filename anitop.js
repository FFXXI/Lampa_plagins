(function(){
  "use strict";
  
  // Конструктор плагина
  function AnitopPlugin(){
    this.name = "anitop";
    this.type = "plugin";
    this.version = "1.0";
  }

  // Метод инициализации плагина. Вызывается после регистрации.
  AnitopPlugin.prototype.init = function(){
    console.log("AnitopPlugin: Инициализация плагина");
    // Добавляем пункт меню, если API Lampa доступно
    if(window.Lampa && Lampa.Menu && typeof Lampa.Menu.append === "function"){
      Lampa.Menu.append({
        title: "Anitop",  // Текст пункта меню
        icon: "film",     // Иконка (можно заменить на любую подходящую)
        order: 100,       // Порядок следования в меню (необязательно)
        action: this.action.bind(this) // Обработчик клика по этому пункту
      });
      console.log("AnitopPlugin: Пункт меню добавлен");
    } else {
      console.error("AnitopPlugin: Lampa.Menu.append не найден");
    }
  };

  // Метод, вызываемый при нажатии на пункт меню
  AnitopPlugin.prototype.action = function(){
    console.log("AnitopPlugin: Выполнено действие пункта меню");
    // Создаём новый экран (view) с тестовым содержимым
    if(window.Lampa && Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
      var screen = {
        name: "anitop_view",
        component: "view",
        template: function(){
          return '<div style="padding:20px; color:white; text-align:center;">Anitop Plugin Activated!</div>';
        }
      };
      Lampa.Controller.add(screen);
      Lampa.Controller.toggle("anitop_view");
      console.log("AnitopPlugin: Экран активирован");
    } else {
      console.error("AnitopPlugin: Lampa.Controller не доступен");
    }
  };

  // Регистрируем плагин через API Lampa
  if(window.Lampa && Lampa.Plugin && typeof Lampa.Plugin.register === "function"){
    var plugin = new AnitopPlugin();
    Lampa.Plugin.register({ name: "anitop", type: "plugin", version: "1.0" }, plugin);
    plugin.init();
    console.log("AnitopPlugin: Плагин успешно зарегистрирован");
  } else {
    console.error("AnitopPlugin: Lampa.Plugin.register не найден");
  }
})();
