(function(){
  "use strict";

  function AnitopPlugin() {
    this.name = "AnitopPlugin";
  }

  AnitopPlugin.prototype.init = function(){
    console.log("Плагин AnitopPlugin инициализирован!");
  };

  if(window.Lampa && typeof window.Lampa.Plugin.register === "function"){
    try {
      var plugin = new AnitopPlugin();
      Lampa.Plugin.register({ name: "anitop" }, plugin);
      plugin.init();
      console.log("Плагин Anitop успешно зарегистрирован");
    } catch(e){
      console.error("Ошибка при регистрации плагина Anitop:", e);
    }
  } else {
    console.warn("Lampa или метод Lampa.Plugin.register отсутствуют");
  }
})();
