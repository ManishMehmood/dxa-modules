var SDL;
(function (SDL) {
    var MediaDelivery;
    (function (MediaDelivery) {
        var Html5PlayerOptions = (function () {
            function Html5PlayerOptions() {
            }
            return Html5PlayerOptions;
        })();
        MediaDelivery.Html5PlayerOptions = Html5PlayerOptions;
        var Quality = (function () {
            function Quality(name, url, resolution) {
                this.name = name;
                this.url = url;
                this.resolution = resolution;
            }
            return Quality;
        })();
        var Html5Player = (function () {
            function Html5Player(container, options) {
                this.container = container;
                this.options = options;
            }
            Html5Player.prototype.render = function () {
                var _this = this;
                $.ajax(this.options.url, {
                    async: true,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        _this.renderView(response, _this.container);
                    }                    
                });
            };
            Html5Player.prototype.renderView = function (distribution, container) {
                var _this = this;
                if (distribution != null) {
                    // Only the first asset in the first asset container gets displayed.
                    if (distribution.assetContainers.length > 0) {
                        var assetContainer = distribution.assetContainers[0];
                        if (assetContainer.assets != null && assetContainer.assets.length > 0) {
                            var id = distribution.id;
                            var asset = distribution.assetContainers[0].assets[0];
                            var qualityName = "";
                            var qualities = new Array();
                            asset.renditionGroups.forEach(function (renditionGroup) {
                                renditionGroup.renditions.forEach(function (rendition) {
                                    switch (rendition.name) {
                                        case 'Mobile 360p mp4':
                                            qualityName = "smartphone";
                                            var quality = new Quality(qualityName, rendition.url, rendition.name);
                                            qualities.push(quality);
                                            break;
                                        case 'Web':
                                            qualityName = "tablet";
                                            var quality = new Quality(qualityName, rendition.url, rendition.name);
                                            qualities.push(quality);
                                            break;
                                        case 'HD 720p webm':
                                            qualityName = "desktop";
                                            var quality = new Quality(qualityName, rendition.url, rendition.name);
                                            qualities.push(quality);
                                            break;
                                        case 'HD 1080p webm':
                                            qualityName = "desktopHD";
                                            var quality = new Quality(qualityName, rendition.url, rendition.name);
                                            qualities.push(quality);
                                            break;
                                        default:
                                            break;
                                    }
                                });
                            });

                            var video = document.createElement("video");
                            video.setAttribute("crossorigin", "anonymous");
                            video.id = id;
                            video.controls = true;
                            if (this.options.autoplay == false) {
                                video.autoplay = false;
                            } else {
                                video.autoplay = true;
                            }
                            video.style.width = "100%";
                            video.style.height = "100%";
                            // Add the source
                            var resolutionAttribute = "data-resolution";
                            var source = document.createElement("source");
                            source.type = "video/mp4";
                            switch (this.options.quality) {
                                case "smartphone":
                                    source.src = qualities[0].url;
                                    video.setAttribute(resolutionAttribute, qualities[0].resolution);
                                    break;
                                case "tablet":
                                    source.src = qualities[1].url;
                                    source.type = "video/webm";
                                    video.setAttribute(resolutionAttribute, qualities[1].resolution);
                                    break;
                                case "desktop":
                                    if (qualities["desktopHD"] != null) {
                                        source.src = qualities[3].url;
                                        video.setAttribute(resolutionAttribute, qualities[3].resolution);
                                    } else {
                                        source.src = qualities[2].url;
                                        video.setAttribute(resolutionAttribute, qualities[2].resolution);
                                    }
                                    break;
                                default:
                                    if (qualities["desktopHD"] != null) {
                                        source.src = qualities[3].url;
                                        video.setAttribute(resolutionAttribute, qualities[3].resolution);
                                    } else {
                                        source.src = qualities[2].url;
                                        video.setAttribute(resolutionAttribute, qualities[2].resolution);
                                    }
                                    break;
                            }
                            video.appendChild(source);
                            // Add the subtitles
                            if (asset.enrichments.subtitles != null) {
                                if (this.options.subtitles) {
                                    asset.enrichments.subtitles.forEach(function (subtitle) {
                                        var subtitleTrack = document.createElement("track");
                                        subtitleTrack.kind = "subtitles";
                                        subtitleTrack.src = subtitle.webVideotextTrackUrl;
                                        subtitleTrack.srclang = subtitle.cultureName.toLowerCase();
                                        subtitleTrack.label = subtitle.cultureName;
                                        video.appendChild(subtitleTrack);
                                    });
                                }
                            }
                            container.appendChild(video);
                        }
                    }
                }
            };
            return Html5Player;
        })();
        MediaDelivery.Html5Player = Html5Player;
    })(MediaDelivery = SDL.MediaDelivery || (SDL.MediaDelivery = {}));
})(SDL || (SDL = {}));
(function ($) {
    sdlmediaHtml5Player = function (options) {
        var $container = options.selector;
        var html5PlayerOptions = new SDL.MediaDelivery.Html5PlayerOptions();
        html5PlayerOptions.url = options.url;
        html5PlayerOptions.subtitles = options.subtitles;
        html5PlayerOptions.autoplay = options.autoplay;
        html5PlayerOptions.quality = options.quality;
        var html5Player = new SDL.MediaDelivery.Html5Player($container.get(0), html5PlayerOptions);
        html5Player.render();
    };

    $(document).ready(function () {        
        $("div[id|='video']").each(function (index, value) {            
            var method = $(this).data("mm-method");
            //console.log("found video with id: " + $(this).attr("id") + " and method: " + method);
            switch(method)
            {
                case "VideoAutoplayOff":                    
                    sdlmediaHtml5Player({ selector: $(this), url: $(this).data('mm-url'), autoplay:false });                                    
                    break;
                case "VideoSubtitlesOff":
                    sdlmediaHtml5Player({ selector: $(this), url: $(this).data('mm-url'), subtitles: false });
                    break;
                case "VideoSubtitlesOn":
                    sdlmediaHtml5Player({ selector: $(this), url: $(this).data('mm-url'), subtitles: true});
                    break;
                case "VideoDesktop":
                    sdlmediaHtml5Player({ selector: $(this), url: $(this).data('mm-url'), quality: "desktop"});
                    break;
                case "VideoSmartphone":
                    sdlmediaHtml5Player({ selector: $(this), url: $(this).data('mm-url'), quality: "smartphone" });
                    break;
                case "VideoTablet":
                    sdlmediaHtml5Player({ selector: $(this), url: $(this).data('mm-url'), quality: "tablet" });
                    break;
                default:
					if($(this).data('mm-url'))
						sdlmediaHtml5Player({ selector: $(this), url: $(this).data('mm-url')});                  
            }
        });    
    });
}(jQuery));