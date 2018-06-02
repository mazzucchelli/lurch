import { appendToUrl } from '../services/utils';
import Callout from './callout';

class minicart {
    constructor () {
        this.miniCart = $('.mini-cart');
        this.miniCartContent = $('.mini-cart-content');
        this.miniCartSpinner = $('.mini-cart-spinner');
        this.miniCartQty = $('.minicart-quantity');
    }

    run () {
        $('.mini-cart').on('count:update', (event, count) => {
            if (count && $.isNumeric(count.quantityTotal)) {
                this.updateCount(count.quantityTotal);
            }
        });

        if (['small', 'medium'].indexOf(Foundation.MediaQuery.current) === -1) this.toggleMinicart();
    }

    toggleMinicart () {
        $('.mini-cart .mini-cart-link').on('mouseenter focusin touchstart', () => {
            const count = parseInt(this.miniCartQty.text(), 10);

            if (count !== 0) {
                this.loadMiniCart();
            }
        });
    }

    loadMiniCart () {
        const count = parseInt(this.miniCartQty.text(), 10);
        const url = this.miniCart.data('action-url');
        this.miniCartSpinner.show();

        $.get(url, data => {
            this.miniCartContent.empty().append(data);
            this.miniCartSpinner.hide();

            this.updateCount(count);

            $('.mini-cart-content .remove-line-item a').click(e => {
                const actionUrl = $(e.currentTarget).data('action');
                const productID = $(e.currentTarget).data('pid');
                const productName = $(e.currentTarget).data('name');
                const uuid = $(e.currentTarget).data('uuid');

                var removePopup = new Foundation.Reveal($(`#removeProductModal-${uuid}`));
                removePopup.open();

                $(document).on('closed.zf.reveal', e => {
                    $(e.target).foundation('_destroy');
                    setTimeout(() => {
                        this.miniCart.removeClass('popup-open');
                    }, 2000);
                });

                this.miniCart.addClass('popup-open');

                this.removeProduct(actionUrl, productID, productName, uuid);
            });
        });
    }

    removeProduct (actionUrl, productID, productName, uuid) {
        $(`#removeProductModal-${uuid} .cart-delete-confirmation-btn`).on('click', e => {
            e.preventDefault();

            const url = appendToUrl(actionUrl, {
                pid: productID,
                uuid: uuid
            });

            this.miniCartSpinner.show();

            $.ajax({
                url: url,
                type: 'get',
                dataType: 'json',
                success: data => {
                    this.updateCount(data.basket.numItems);
                    this.miniCartSpinner.hide();
                    this.loadMiniCart();

                    setTimeout(() => {
                        this.miniCart.removeClass('popup-open');
                    }, 2000);  
                },
                error: err => {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    } else {
                        Callout.error('', err.responseJSON.errorMessage, this.miniCartContent);
                        this.miniCartSpinner.hide();
                    }

                    setTimeout(() => {
                        this.miniCart.removeClass('popup-open');
                    }, 2000);
                }
            });
        });
    }

    updateCount (count) {
        $('.minicart-quantity').text(count);
    }
}
const Minicart = new minicart();
export default Minicart;
