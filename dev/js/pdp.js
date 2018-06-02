import Product from './product';

class detail {
    constructor () {
        Product.colorValue();
        Product.colorAttribute();
        Product.selectAttribute();
        Product.availability();
        Product.addToCart();

        this.updateAttribute();
        this.updateAddToCart();
        this.sizeChart();
    }

    updateAttributesAndDetails () {
        $('body').on('product:statusUpdate', (e, data) => {
            var $productContainer = $('.product-detail[data-pid="' + data.id + '"]');

            if (data.shortDescription) {
                $productContainer.find('.primary-image-description').empty().html(`<p>${data.shortDescription}</p>`);
            }
        });
    }

    updateAttribute () {
        $('body').on('product:afterAttributeSelect', (e, response) => {
            if ($('.product-detail > .bundle-items').length) {
                response.container.data('pid', response.data.product.id);
                response.container.find('.product-id').text(response.data.product.id);
            } else if ($('.product-set-detail').eq(0)) {
                response.container.data('pid', response.data.product.id);
                response.container.find('.product-id').text(response.data.product.id);
            } else {
                $('.product-id').text(response.data.product.id);
                $('.product-detail:not(".bundle-item")').data('pid', response.data.product.id);
            }
        });
    }

    updateAddToCart () {
        $('body').on('product:updateAddToCart', (e, response) => {
            $('button.add-to-cart', response.$productContainer).attr('disabled', (!response.product.readyToOrder || !response.product.available));

            var enable = $('.product-availability').toArray().every(function (item) {
                return $(item).data('available') && $(item).data('ready-to-order');
            });
            $('button.add-to-cart-global').attr('disabled', !enable);
        });
    }

    updateAvailability () {
        $('body').on('product:updateAvailability',  (e, response) => {
            $('div.availability', response.$productContainer).data('ready-to-order', response.product.readyToOrder).data('available', response.product.available);

            $('.availability-msg', response.$productContainer).empty().html(response.message);

            if ($('.global-availability').length) {
                var allAvailable = $('.product-availability').toArray().every(function (item) {
                    return $(item).data('available');
                });

                var allReady = $('.product-availability').toArray().every(function (item) {
                    return $(item).data('ready-to-order');
                });

                $('.global-availability').data('ready-to-order', allReady).data('available', allAvailable);

                $('.global-availability .availability-msg').empty().html(allReady ? response.message : response.resources.info_selectforstock);
            }
        });
    }

    sizeChart () {
        var $sizeChart = $('.size-chart-collapsible');

        $('.size-chart a').on('click', e => {
            e.preventDefault();

            var url = $(this).attr('href');

            if ($sizeChart.is(':empty')) {
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'json',
                    success: data => {
                        $sizeChart.append(data.content);
                    }
                });
            }

            $sizeChart.toggleClass('active');
        });

        $('body').on('click', e => {
            if ($('.size-chart').has(e.target).length <= 0) {
                $sizeChart.removeClass('active');
            }
        });
    }
};

const ProductDetail = new detail();
