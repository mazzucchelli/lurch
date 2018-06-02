import { appendToUrl } from './services/utils';
import Product from './product/';
import Callout from './components/callout';

class cart {

    constructor () {
        this.errorWrapper = $('.cart-error-wrapper');
        this.couponErrorWrapper = $('.coupon-error-wrapper');
    }

    run () {
        this.remove();
        this.shippingMethods();
        this.coupon();
        this.quantity();
    }

    shippingMethods () {
        $('.shippingMethods').change(e => {
            var url = $(e.currentTarget).attr('data-actionUrl');

            var urlParams = {
                methodID: $(e.currentTarget).find(':selected').attr('data-shipping-id')
            };

            // $('.totals').spinner().start();

            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: urlParams,
                success: data => {
                    if (data.error) {
                        window.location.href = data.redirectUrl;
                    } else {
                        $('.coupons-and-promos').empty().append(data.totals.discountsHtml);
                        this.updateCartTotals(data);
                        this.updateApproachingDiscounts(data.approachingDiscounts);
                        this.validateBasket(data);
                    }
                    // $.spinner().stop();
                },
                error: err => {
                    if (err.redirectUrl) {
                        window.location.href = err.redirectUrl;
                    } else {
                        // createErrorNotification(err.responseJSON.errorMessage);
                        // $.spinner().stop();
                    }
                }
            });
        });
    }

    coupon () {
        $('.promo-code-form').submit(e => {
            e.preventDefault();
            // $.spinner().start();

            $('.coupon-missing-error').hide();
            $('.coupon-error-message').empty();

            if (!$('.coupon-code-field').val()) {
                $('.promo-code-form .form-control').addClass('is-invalid');
                $('.coupon-missing-error').show();
                // $.spinner().stop();
                return false;
            }

            var $form = $('.promo-code-form');
            $('.promo-code-form .form-control').removeClass('is-invalid');
            $('.coupon-error-message').empty();
    
            $.ajax({
                url: $form.attr('action'),
                type: 'GET',
                dataType: 'json',
                data: $form.serialize(),
                success: data => {
                    if (data.error) {
                        $('.promo-code-form .form-control').addClass('is-invalid');
                        $('.coupon-error-message').empty().append(data.errorMessage);
                        Callout.error(null, data.errorMessage, this.couponErrorWrapper);
                    } else {
                        $('.coupons-and-promos').empty().append(data.totals.discountsHtml);
                        this.updateCartTotals(data);
                        this.updateApproachingDiscounts(data.approachingDiscounts);
                        this.validateBasket(data);
                    }
                    $('.coupon-code-field').val('');
                    // $.spinner().stop();
                },
                error: err => {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    } else {                        
                        Callout.error(null, err.errorMessage, this.couponErrorWrapper);
                    }
                }
            });
            return false;
        });
    
        $('body').on('click', '.remove-coupon', e => {
            console.log('Remove coupon clicked')
            e.preventDefault();
            
            const actionUrl = $(e.currentTarget).data('action');
            const couponCode = $(e.currentTarget).data('code');
            const uuid = $(e.currentTarget).data('uuid');
            // const $deleteConfirmBtn = $('.delete-coupon-confirmation-btn');
            // const $productToRemoveSpan = $('.coupon-to-remove');
    
            var removePopup = new Foundation.Reveal($(`#removeCouponModal-${uuid}`));
            removePopup.open();

            this.removeCoupon(actionUrl, couponCode, uuid);
        });
    }

    removeCoupon (actionUrl, couponCode, uuid) {
        $(`#removeCouponModal-${uuid} .delete-coupon-confirmation-btn`).on('click', e => {
            e.preventDefault();

            const url = appendToUrl(actionUrl, {
                code: couponCode,
                uuid: uuid
            });
    
            // $('body > .modal-backdrop').remove();
            // $.spinner().start();

            $.ajax({
                url: url,
                type: 'get',
                dataType: 'json',
                success: data => {
                    $('.coupon-uuid-' + uuid).remove();
                    this.updateCartTotals(data);
                    this.updateApproachingDiscounts(data.approachingDiscounts);
                    this.validateBasket(data);
                    // $.spinner().stop();
                },
                error: err => {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    } else {
                        // createErrorNotification(err.responseJSON.errorMessage);
                        // $.spinner().stop();
                    }
                }
            });
        });
    }

    onHold () {
        $('.optional-promo').click(e => {
            e.preventDefault();
            $('.promo-code-form').toggle();
        });

        $('body').on('click', '.cart-page .bonus-product-button', function () {
            $.spinner().start();
            $.ajax({
                url: $(this).data('url'),
                method: 'GET',
                dataType: 'json',
                success: function (data) {
                    Product.methods.editBonusProducts(data);
                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        });

        Product.selectAttribute();
        Product.colorAttribute();
        Product.removeBonusProduct();
        Product.selectBonusProduct();
        Product.enableBonusProductSelection();
        Product.showMoreBonusProducts();
        Product.addBonusProductsToCart();
    }

    quantity () {
        $('body').on('change', '.quantity-form > .quantity', e => {
            console.log('Quantity change');
            const preSelectQty = $(e.currentTarget).data('pre-select-qty');
            const quantity = $(e.currentTarget).val();
            const productID = $(e.currentTarget).data('pid');
            let url = $(e.currentTarget).data('action');
            const uuid = $(e.currentTarget).data('uuid');
    
            var urlParams = {
                pid: productID,
                quantity: quantity,
                uuid: uuid
            };
            url = appendToUrl(url, urlParams);
    
            // $(this).parents('.card').spinner().start();
    
            $.ajax({
                url: url,
                type: 'get',
                context: this,
                dataType: 'json',
                success: data => {
                    $('.quantity[data-uuid="' + uuid + '"]').val(quantity);
                    $('.coupons-and-promos').empty().append(data.totals.discountsHtml);
                    this.updateCartTotals(data);
                    this.updateApproachingDiscounts(data.approachingDiscounts);
                    this.updateAvailability(data, uuid);
                    this.validateBasket(data);
                    $(this).data('pre-select-qty', quantity);
                    // $.spinner().stop();
                    if ($(this).parents('.product-info').hasClass('bonus-product-line-item') && $('.cart-page').length) {
                        location.reload();
                    }
                },
                error: err => {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    } else {
                        // createErrorNotification(err.responseJSON.errorMessage);
                        $(this).val(parseInt(preSelectQty, 10));
                        // $.spinner().stop();
                    }
                }
            });
        });
    }

    remove () {
        $('#cart .remove-cart-product').click(e => {
            e.preventDefault();

            const actionUrl = $(e.currentTarget).data('action');
            const productID = $(e.currentTarget).data('pid');
            const productName = $(e.currentTarget).data('name');
            const uuid = $(e.currentTarget).data('uuid');

            var removePopup = new Foundation.Reveal($(`#removeProductModal-${uuid}`));
            removePopup.open();

            this.removeProduct(actionUrl, productID, productName, uuid);
        });
    }

    removeProduct (actionUrl, productID, productName, uuid) {
        $(`#removeProductModal-${uuid} .cart-delete-confirmation-btn`).on('click', e => {
            e.preventDefault();

            const url = appendToUrl(actionUrl, {
                pid: productID,
                uuid: uuid
            });
    
            //$.spinner().start();

            $.ajax({
                url: url,
                type: 'get',
                dataType: 'json',
                success: data => {
                    if (data.basket.items.length === 0) {
                        $('#empty-cart .empty-cart-wrapper').empty().append(`<div class="cart-empty text-center"><h1>${data.basket.resources.emptyCartMsg}</h1></div>`);
                        $('.number-of-items').empty().append(data.basket.resources.numberOfItems);
                        $('.minicart-quantity').empty().append(data.basket.numItems);
                    } else {
                        if (data.toBeDeletedUUIDs && data.toBeDeletedUUIDs.length > 0) {
                            for (var i = 0; i < data.toBeDeletedUUIDs.length; i++) {
                                $('.uuid-' + data.toBeDeletedUUIDs[i]).remove();
                            }
                        }
                        $('.uuid-' + uuid).remove();
                        if (!data.basket.hasBonusProduct) {
                            $('.bonus-product').remove();
                        }
                        $('.coupons-and-promos').empty().append(data.basket.totals.discountsHtml);

                        this.updateCartTotals(data.basket);
                        this.updateApproachingDiscounts(data.basket.approachingDiscounts);
                        this.validateBasket(data.basket);
                    }
                    // $.spinner().stop();
                },
                error: err => {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    } else {
                        console.log(err.responseJSON.errorMessage);
                        // createErrorNotification(err.responseJSON.errorMessage);
                        Callout.error(null, err.responseJSON.errorMessage, this.errorWrapper);
                        // $.spinner().stop();
                    }
                }
            });
        });
    }

    /**
     * Checks whether the basket is valid. if invalid displays error message and disables
     * checkout button
     * @param {Object} data - AJAX response from the server
     */
    validateBasket (data) {
        if (data.valid.error) {
            if (data.valid.message) {
                var errorHtml = '<div class="alert alert-danger alert-dismissible valid-cart-error ' +
                    'fade show" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                    '<span aria-hidden="true">&times;</span>' +
                    '</button>' + data.valid.message + '</div>';
    
                $('.cart-error').append(errorHtml);
            } else {
                $('.cart').empty().append('<div class="row"> ' +
                    '<div class="col-12 text-center"> ' +
                    '<h1>' + data.resources.emptyCartMsg + '</h1> ' +
                    '</div> ' +
                    '</div>'
                );
                $('.number-of-items').empty().append(data.resources.numberOfItems);
                $('.minicart-quantity').empty().append(data.numItems);
                $('.mini-cart .popover').empty();
                $('.mini-cart .popover').removeClass('show');
            }
    
            $('.checkout-btn').addClass('disabled');
        } else {
            $('.checkout-btn').removeClass('disabled');
        }
    }

    /**
     * re-renders the order totals and the number of items in the cart
     * @param {Object} data - AJAX response from the server
     */
    updateCartTotals (data) {
        $('.number-of-items').empty().append(data.resources.numberOfItems);
        $('.shipping-cost').empty().append(data.totals.totalShippingCost);
        $('.tax-total').empty().append(data.totals.totalTax);
        $('.grand-total').empty().append(data.totals.grandTotal);
        $('.shipping-subtotal').empty().append(data.totals.subTotal);
        $('.minicart-quantity').empty().append(data.numItems);

        if (data.totals.orderLevelDiscountTotal.value > 0) {
            $('.order-discount').removeClass('hide-order-discount');
            $('.order-discount-total').empty().append('- ' + data.totals.orderLevelDiscountTotal.formatted);
        } else {
            $('.order-discount').addClass('hide-order-discount');
        }

        if (data.totals.shippingLevelDiscountTotal.value > 0) {
            $('.shipping-discount').removeClass('hide-shipping-discount');
            $('.shipping-discount-total').empty().append('- ' + data.totals.shippingLevelDiscountTotal.formatted);
        } else {
            $('.shipping-discount').addClass('hide-shipping-discount');
        }

        data.items.forEach(function (item) {
            $('.item-' + item.UUID).empty().append(item.renderedPromotions);
            $('.item-total-' + item.UUID).empty().append(item.priceTotal.renderedPrice);
        });
    }

    /**
     * re-renders the order totals and the number of items in the cart
     * @param {Object} message - Error message to display
     */
    createErrorNotification (message) {
        var errorHtml = '<div class="alert alert-danger alert-dismissible valid-cart-error ' +
            'fade show" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
            '</button>' + message + '</div>';

        $('.cart-error').append(errorHtml);
    }

    /**
     * re-renders the approaching discount messages
     * @param {Object} approachingDiscounts - updated approaching discounts for the cart
     */
    updateApproachingDiscounts (approachingDiscounts) {
        var html = '';
        $('.approaching-discounts').empty();
        if (approachingDiscounts.length > 0) {
            approachingDiscounts.forEach(function (item) {
                html += '<div class="single-approaching-discount text-center">'
                    + item.discountMsg + '</div>';
            });
        }
        $('.approaching-discounts').append(html);
    }

    /**
     * Updates the availability of a product line item
     * @param {Object} data - AJAX response from the server
     * @param {string} uuid - The uuid of the product line item to update
     */
    updateAvailability (data, uuid) {
        var lineItem;
        var messages = '';

        for (var i = 0; i < data.items.length; i++) {
            if (data.items[i].UUID === uuid) {
                lineItem = data.items[i];
                break;
            }
        }

        $('.availability-' + lineItem.UUID).empty();

        if (lineItem.availability) {
            if (lineItem.availability.messages) {
                lineItem.availability.messages.forEach(function (message) {
                    messages += '<p class="line-item-attributes">' + message + '</p>';
                });
            }

            if (lineItem.availability.inStockDate) {
                messages += '<p class="line-item-attributes line-item-instock-date">'
                    + lineItem.availability.inStockDate
                    + '</p>';
            }
        }

        $('.availability-' + lineItem.UUID).html(messages);
    }
}

const Cart = new cart()
Cart.run();
