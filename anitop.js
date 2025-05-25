(function(){
  "use strict";

  console.log("=== Anitop Plugin: Script loaded ===");

  // Объект плагина
  var AnitopPlugin = {
    name: "anitop",
    init: function(){
      console.log("=== Anitop Plugin: Initializing ===");
      this.addMenuItem();
    },
    // Функция добавления пункта меню
    addMenuItem: function(){
      if(window.Lampa && Lampa.Menu && typeof Lampa.Menu.append === "function"){
        Lampa.Menu.append({
          title: "Anitop",
          icon: "film", // Иконка – можно заменить по желанию
          action: function(){
            console.log("=== Anitop Plugin: Menu item clicked ===");
            alert("Anitop plugin activated – тестовый ответ!");
          }
        });
        console.log("=== Anitop Plugin: Menu item added successfully ===");
      } else {
        console.error("=== Anitop Plugin: Lampa.Menu.append not available! ===");
      }
    }
  };

  // Регистрируем плагин в системе Lampa
  if(window.Lampa && Lampa.Plugin && typeof Lampa.Plugin.register === "function"){
    try {
      Lampa.Plugin.register({ name: "anitop" }, AnitopPlugin);
      console.log("=== Anitop Plugin: Registered successfully ===");
      AnitopPlugin.init();
    } catch(e) {
      console.error("=== Anitop Plugin: Error during registration: ===", e);
    }
  } else {
    console.error("=== Anitop Plugin: Lampa.Plugin.register not found! ===");
  }
})();

