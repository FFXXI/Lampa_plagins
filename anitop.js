(function(){
    "use strict";

    // Добавляем переводы для плагина
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

    // Компонент-пустышка. Он нужен для регистрации, как в рабочем exit-плагине
    function anitop_component(){
        this.create  = function(){};
        this.build   = function(){};
        this.start   = function(){};
        this.pause   = function(){};
        this.stop    = function(){};
        this.render  = function(){};
        this.destroy = function(){};
    }

    // Функция добавления пункта меню. Если меню ещё не готово, добавляем при событии "ready".
    function addAnitopMenu(){
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
        // При выборе пункта меню открываем каталог
        menu_item.on("hover:enter", function(){
            animeParser.openCatalog();
        });
        // Если пункт не добавляется через eq(1), попробуйте изменить индекс, например, eq(0)
        $(".menu .menu__list").eq(1).append(menu_item);
        console.log("Anitop Plugin: Пункт меню добавлен");
    }

    function createAnitopMenu(){
        window.plugin_anitop_ready = true;
        Lampa.Component.add("anitop", anitop_component);
        if(window.appready)
            addAnitopMenu();
        else {
            Lampa.Listener.follow("app", function(e){
                if(e.type == "ready")
                    addAnitopMenu();
            });
        }
    }

    if(!window.plugin_anitop_ready) createAnitopMenu();

    // Объект-парсер для работы с каталогом и деталями
    var animeParser = {
        openCatalog: function(){
            console.log("Anitop Plugin: Открытие каталога");
            if(Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
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
                // Загружаем каталог (пока с dummy-данными)
                this.loadCatalog();
            } else {
                console.error("Anitop Plugin: Lampa.Controller API недоступен");
            }
        },
        loadCatalog: function(){
            var self = this;
            // Здесь можно добавить запрос к сайту anilib.me через fetch с использованием прокси для обхода CORS
            // Пока используем тестовые данные:
            var dummy = [
                { title: "Naruto", link: "https://anilib.me/ru/anime/naruto", image: "https://via.placeholder.com/300?text=Naruto" },
                { title: "One Piece", link: "https://anilib.me/ru/anime/one-piece", image: "https://via.placeholder.com/300?text=One+Piece" },
                { title: "Attack on Titan", link: "https://anilib.me/ru/anime/aot", image: "https://via.placeholder.com/300?text=AOT" }
            ];
            self.showCatalog(dummy);
        },
        showCatalog: function(items){
            console.log("Anitop Plugin: Каталог получен", items);
            var html = '<div style="display:flex; flex-wrap:wrap; justify-content:center;">';
            items.forEach(function(item){
                html += '<div class="anitop-card selector" data-link="' + item.link + '" style="margin:10px; width:150px; cursor:pointer;">' +
                          '<img src="' + item.image + '" alt="' + item.title + '" style="width:100%; border:1px solid #fff;">' +
                          '<div style="text-align:center; margin-top:5px;">' + item.title + '</div>' +
                        '</div>';
            });
            html += '</div>';
            $(".anitop-catalog").html(html);
            $(".anitop-card").on("hover:enter", function(){
                var link = $(this).data("link");
                animeParser.loadAnimeDetail(link);
            });
        },
        loadAnimeDetail: function(link){
            console.log("Anitop Plugin: loadAnimeDetail, link =", link);
            // Здесь можно делать fetch страницы с деталями. Сейчас используем тестовые данные.
            var details = {
                title: "Тестовое аниме",
                description: "Описание тестового аниме.",
                episodes: [
                    { number: "1", url: "https://via.placeholder.com/300?text=Ep+1" },
                    { number: "2", url: "https://via.placeholder.com/300?text=Ep+2" }
                ],
                quality: ["480p", "720p", "1080p"],
                voices: ["Русская озвучка", "Оригинал"]
            };
            this.showAnimeDetail(details);
        },
        showAnimeDetail: function(details){
            console.log("Anitop Plugin: Показ деталей аниме", details);
            var html = '<div style="padding:20px; color:white;">';
            html += '<h2 style="text-align:center;">' + details.title + '</h2>';
            html += '<p>' + details.description + '</p>';
            // Блок выбора качества
            html += '<div style="margin-top:20px;"><strong>' + Lampa.Lang.translate("quality_label") + '</strong> ';
            details.quality.forEach(function(q){
                html += '<span class="anitop-quality selector" data-quality="' + q + '" style="margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;">' + q + '</span>';
            });
            html += '</div>';
            // Блок выбора озвучки
            html += '<div style="margin-top:20px;"><strong>' + Lampa.Lang.translate("voice_label") + '</strong> ';
            details.voices.forEach(function(v){
                html += '<span class="anitop-voice selector" data-voice="' + v + '" style="margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;">' + v + '</span>';
            });
            html += '</div>';
            // Список эпизодов
            html += '<div style="margin-top:20px;"><strong>' + Lampa.Lang.translate("episodes_label") + '</strong><br>';
            details.episodes.forEach(function(ep){
                html += '<span class="anitop-episode selector" data-episode="' + ep.number + '" data-url="' + ep.url + '" style="margin-right:10px; padding:5px; border:1px solid #fff; cursor:pointer;">Эп.' + ep.number + '</span>';
            });
            html += '</div></div>';

            if(Lampa.Controller && typeof Lampa.Controller.add === "function" && typeof Lampa.Controller.toggle === "function"){
                var view = {
                    name: "anitop_detail_view",
                    component: "view",
                    template: function(){ return '<div class="anitop-detail">' + html + '</div>'; }
                };
                Lampa.Controller.add(view);
                Lampa.Controller.toggle("anitop_detail_view");
                // Навешиваем обработчики для выбора
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
                $(".anitop-episode").on("hover:enter", function(){
                    var ep = $(this).data("episode"),
                        url = $(this).data("url");
                    console.log("Выбрана серия:", ep, url);
                    Lampa.Activity.push({ url: url, title: details.title + " - Эп." + ep });
                });
            } else {
                console.error("Anitop Plugin: Lampa.Controller API недоступен для деталей");
            }
        }
    };

})();
