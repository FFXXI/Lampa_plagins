(function(){
    "use strict";

    function AnitopPlugin() {
        this.name = "AnitopPlugin";
    }

    AnitopPlugin.prototype = {
        init: function() {
            console.log("Плагин AnitopPlugin запущен!");
            this.addMenuItem();
        },

        addMenuItem: function() {
            if (window.Lampa && window.Lampa.Menu) {
                let menu = window.Lampa.Menu;

                // Создаём новый пункт меню
                menu.append({
                    title: "Anitop",
                    icon: "anime", // Иконка (можно изменить)
                    action: () => {
                        this.loadAnimeList();
                    }
                });

                console.log("Категория Anitop добавлена в меню!");
            } else {
                console.warn("Не удалось добавить Anitop в меню.");
            }
        },

        loadAnimeList: function() {
            console.log("Загружаем список аниме...");
            // Здесь должен быть код для парсинга каталога Anilib.me
        }
    };

    if (window.Lampa && typeof window.Lampa.Plugin.register === "function") {
        Lampa.Plugin.register({ name: "anitop_plugin" }, new AnitopPlugin());
    } else {
        console.warn("Ошибка регистрации плагина!");
    }
})();
