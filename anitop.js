(function(){
  "use strict";

  function AnitopPlugin() {
    this.name = "AnitopPlugin";
  }

  // Инициализация плагина
  AnitopPlugin.prototype.init = function(){
    console.log("✅ Плагин AnitopPlugin инициализирован!");
    this.addMenuItem();
  };

  // Добавление нового пункта в меню
  AnitopPlugin.prototype.addMenuItem = function(){
    if (window.Lampa && Lampa.Menu && typeof Lampa.Menu.append === "function") {
      Lampa.Menu.append({
        title: "Anitop",
        icon: "anime",
        action: () => this.openAnitopScreen()
      });
      console.log("✅ Пункт меню Anitop добавлен!");
    } else {
      console.warn("⚠️ Ошибка: Lampa.Menu не найден!");
    }
  };

  // Открытие экрана плагина
  AnitopPlugin.prototype.openAnitopScreen = function(){
    if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.add === "function") {
      let anitop_page = {
        name: "anitop",
        component: "view",
        layout: "catalog",
        items: [
          { title: "🔥 Аниме №1", image: "https://via.placeholder.com/300" },
          { title: "⚡ Аниме №2", image: "https://via.placeholder.com/300" }
        ]
      };
      
      console.log("✅ Экран Anitop открыт!");
      Lampa.Controller.add(anitop_page);
      Lampa.Controller.toggle("anitop");
    } else {
      console.warn("⚠️ Ошибка: Lampa.Controller не найден!");
    }
  };

  // Регистрация плагина
  if (window.Lampa && typeof window.Lampa.Plugin.register === "function") {
    try {
      let plugin = new AnitopPlugin();
      Lampa.Plugin.register({ name: "anitop" }, plugin);
      plugin.init();
      console.log("✅ Плагин Anitop успешно зарегистрирован!");
    } catch (e) {
      console.error("❌ Ошибка при регистрации плагина Anitop:", e);
    }
  } else {
    console.warn("⚠️ Ошибка: Lampa.Plugin.register не найден!");
  }

})();
