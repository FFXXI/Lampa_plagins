(function(){
  "use strict";

  // Конструктор плагина
  function AnitopPlugin() {
    this.name = "AnitopPlugin";
  }

  // Инициализация плагина
  AnitopPlugin.prototype.init = function(){
    console.log("Плагин AnitopPlugin инициализирован!");
    this.addMenuItem();
  };

  // Добавление нового пункта в левое меню
  AnitopPlugin.prototype.addMenuItem = function(){
    if (window.Lampa && Lampa.Menu && typeof Lampa.Menu.append === "function") {
      Lampa.Menu.append({
        title: "Anitop",   // Название пункта меню
        icon: "anime",     // Иконка: можно заменить на существующую
        action: this.onMenuItemClick.bind(this) // Действие при нажатии
      });
      console.log("Пункт меню Anitop добавлен");
    } else {
      console.warn("Объект Lampa.Menu не найден или метод append отсутствует");
    }
  };

  // Обработчик нажатия на пункт меню
  AnitopPlugin.prototype.onMenuItemClick = function(){
    console.log("Пункт меню Anitop нажат!");
    // Здесь можно добавить дополнительный функционал:
    // например, загрузку или отображение контента плагина.
    // Для демонстрации просто попробуем поменять окно контроллера Lampa.
    if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.change === "function") {
      // Пытаемся переключить вид в Lampa (например, показать каталог)
      Lampa.Controller.change("catalog", { plugin: "anitop" });
    } else {
      // Если переключить вид не получилось – отображаем уведомление.
      alert("Кнопка Anitop нажата!");
    }
  };

  // Регистрируем плагин в системе Lampa
  if (window.Lampa && typeof window.Lampa.Plugin.register === "function") {
    try {
      var plugin = new AnitopPlugin();
      Lampa.Plugin.register({ name: "anitop" }, plugin);
      // Запускаем инициализацию плагина
      plugin.init();
      console.log("Плагин Anitop успешно зарегистрирован");
    } catch(e){
      console.error("Ошибка при регистрации плагина Anitop:", e);
    }
  } else {
    console.warn("Lampa или метод Lampa.Plugin.register отсутствуют");
  }

})();
