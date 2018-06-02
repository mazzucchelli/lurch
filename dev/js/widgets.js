class widgets {

    constructor () {
        $(document).ready(() => {
            this.shopTheLook();
            this.customerCare();
            this.threeColSlider();
            this.circles();
            this.videoBox();
            this.productSlotSlider();
            this.rellax();
        });
    }

    shopTheLook () {
        $('.slides').owlCarousel({
            loop: true,
            nav: true,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 3
                }
            }
        });
    }

    customerCare () {
        if (Foundation.MediaQuery.current === 'small') {
            $('.widget-customer-care').owlCarousel({
                items: 2,
                center: true,
                margin: 10,
                autoWidth: true
            });
        }
    }

    threeColSlider () {
        const $widget = $('.widget-3-col-img-txt-img-slider');

        if (['small', 'medium'].indexOf(Foundation.MediaQuery.current) > -1) {
            const images = $widget.find('.image-left img');
            const texts = $widget.find('.text .inner');

            const boxes = [];
            images.each((i, el) => {
                boxes.push($('<div class="box" />').append(el).append(texts[i]));
            });
            $widget.empty().append(boxes);

            $widget.owlCarousel({
                items: 2,
                center: true,
                autoWidth: true,
                responsive: {
                    480: {
                        margin: 40
                    }
                }
            });
        } else {
            const count = $widget.find('.image-left .wrap img').length;
            $widget.find('.widget-total').text(count);
            $widget.find('.image-left .wrap, .image-right .wrap').css('width', (count * 100 + '%'));
            let current = 0;

            $widget.find('.text .inner').each((i, el) => {
                if (i) $(el).hide();
                $(el).addClass('text-' + i);
            });

            var move = () => {
                $widget.find('.widget-current').text(current + 1);
                $widget.find('.image-right .wrap, .image-left .wrap').css({left: (-(current * 100) + '%')});

                $widget.find('.text .inner').hide();
                $widget.find('.text-' + current).fadeIn(1000);
            };

            $widget.find('.widget-next').click(() => {
                if (current + 1 >= count) return;
                current++;
                console.log('Next', current);
                move();
            });

            $widget.find('.widget-prev').click(() => {
                if (current - 1 < 0) return;
                current--;
                console.log('Prev', current);
                move();
            });
        }
    }

    circles () {
        if (Foundation.MediaQuery.current !== 'small') return;

        $('.widget-circles .items').owlCarousel({
            loop: false,
            nav: false,
            autoWidth: true,
            items: 3
        });
    }

    videoBox () {
        if (!$('[data-video]').length) return;

        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/player_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        const players = {};
        window.onYouTubePlayerAPIReady = () => {
            $('[data-video]').each((i, el) => {
                const videoID = $(el).data('video');
                $(el).append('<button class="play-btn">Play</button>');
                $(el).append('<div class="video-wrapper" id="'+ videoID +'"></div>');

                $(el).find('.play-btn').click({videoID, el}, e => {
                    if (typeof players[e.data.videoID] === 'undefined') {
                        players[e.data.videoID] = new YT.Player(videoID, {
                            height: $(el).height(),
                            width: $(el).width(),
                            videoId: videoID,
                            playerVars: {
                                controls: 0,
                                disablekb: 1,
                                modestbranding: 1,
                                showinfo: 0,
                                autoplay: 1,
                                rel: 0
                            },
                            events: {
                                onStateChange: state => {
                                    if (state.data == YT.PlayerState.PLAYING) {
                                        $(e.data.el).addClass('video-playing');
                                    } else {
                                        $(e.data.el).removeClass('video-playing');
                                    }
                                }
                            }
                        });
                    } else players[e.data.videoID].playVideo();
                });
            });
        };
    }

    productSlotSlider () {
        const $widget = $('.products-slot-slider');
        $widget.find('.widget-total').text($('.products-slot-slider .slider > div').length);

        const slider = $widget.find('.slider').owlCarousel({
            items: 1,
            loop: false,
            nav: false,
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 4,
                    margin: 15
                },
                1000: {
                    items: 1
                }
            }
        });

        slider.on('changed.owl.carousel', e => {
            $widget.find('.widget-current').text(e.page.index + 1);
        });

        $widget.find('.widget-ctrl .widget-next').click(e => {
            slider.trigger('next.owl.carousel');
        });
        $widget.find('.widget-ctrl .widget-prev').click(e => {
            slider.trigger('prev.owl.carousel');
        });
    }

    rellax () {
        if (!$('[data-rellax]').length || ['small', 'medium'].indexOf(Foundation.MediaQuery.current) > -1) return;
        $('[data-rellax]').each((i, el) => {
            setTimeout(() => {
                const rellax = new Rellax(el, {
                    center: $(el).data('rellax-center')
                });
            });
        });
    }
}

const Widgets = new widgets();
export default Widgets;
