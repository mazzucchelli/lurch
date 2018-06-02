'use strict';

var addressHelpers = require('./address');
var formHelpers = require('./formErrors');
var ShippingState = require('./shippingState');

var shippingState;

/**
 * updates the shipping address selector within shipping forms
 * @param {Object} productLineItem - the productLineItem model
 * @param {Object} shipping - the shipping (shipment model) model
 * @param {Object} order - the order model
 * @param {Object} customer - the customer model
 */
function updateShippingAddressSelector(productLineItem, shipping, order, customer) {
    var uuidEl = $('input[value=' + productLineItem.UUID + ']');
    var shippings = order.shipping;

    var form;
    var $shippingAddressSelector;
    var hasSelectedAddress = false;

    if (uuidEl && uuidEl.length > 0) {
        form = uuidEl[0].form;
        $shippingAddressSelector = $('.addressSelector', form);
    }

    if ($shippingAddressSelector && $shippingAddressSelector.length === 1) {
        $shippingAddressSelector.empty();
        // Add New Address option
        $shippingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
            null,
            false,
            order));
        // Separator -
        $shippingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
            order.resources.shippingAddresses, false, order, { className: 'multi-shipping' }
        ));
        shippings.forEach(function (aShipping) {
            var isSelected = shipping.UUID === aShipping.UUID;
            hasSelectedAddress = hasSelectedAddress || isSelected;
            $shippingAddressSelector.append(
                addressHelpers.methods.optionValueForAddress(aShipping, isSelected, order,
                    { className: 'multi-shipping' }
                )
            );
        });
        if (customer.addresses && customer.addresses.length > 0) {
            $shippingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
                order.resources.accountAddresses, false, order));
            customer.addresses.forEach(function (address) {
                var isSelected = shipping.matchingAddressId === address.ID;
                $shippingAddressSelector.append(
                    addressHelpers.methods.optionValueForAddress({
                        UUID: 'ab_' + address.ID,
                        shippingAddress: address
                    }, isSelected, order)
                );
            });
        }
    }

    if (!hasSelectedAddress) {
        // show
        $(form).addClass('hide-details');
    } else {
        $(form).removeClass('hide-details');
    }
}

/**
 * updates the shipping address form values within shipping forms
 * @param {Object} shipping - the shipping (shipment model) model
 */
function updateShippingAddressFormValues(shipping) {
    if (!shipping.shippingAddress) return;

    $('input[value=' + shipping.UUID + ']').each(function (formIndex, el) {
        var form = el.form;
        if (!form) return;
        var countryCode = shipping.shippingAddress.countryCode;

        $('input[name$=_firstName]', form).val(shipping.shippingAddress.firstName);
        $('input[name$=_lastName]', form).val(shipping.shippingAddress.lastName);
        $('input[name$=_address1]', form).val(shipping.shippingAddress.address1);
        $('input[name$=_address2]', form).val(shipping.shippingAddress.address2);
        $('input[name$=_city]', form).val(shipping.shippingAddress.city);
        $('input[name$=_postalCode]', form).val(shipping.shippingAddress.postalCode);
        $('select[name$=_stateCode],input[name$=_stateCode]', form)
            .val(shipping.shippingAddress.stateCode);

        if (countryCode && typeof countryCode === 'object') {
            $('select[name$=_country]', form).val(shipping.shippingAddress.countryCode.value);
        } else {
            $('select[name$=_country]', form).val(shipping.shippingAddress.countryCode);
        }

        $('input[name$=_phone]', form).val(shipping.shippingAddress.phone);

        shippingState.changeState({ deliveryAddress: shipping.shippingAddress }, shipping.UUID, shipping);
    });
}

/**
 * updates the shipping method radio buttons within shipping forms
 * @param {Object} shipping - the shipping (shipment model) model
 */
function updateShippingMethods(shipping) {
    var uuidEl = $('input[value=' + shipping.UUID + ']');
    if (uuidEl && uuidEl.length > 0) {
        $.each(uuidEl, function (shipmentIndex, el) {
            var form = el.form;
            if (!form) return;

            var $shippingMethodList = $('.shipping-method-list', form);

            if (shipping.shippingAddress && shipping.shippingAddress.stateCode && shipping.shippingAddress.stateCode !== '') {
                if ($shippingMethodList && $shippingMethodList.length > 0) {
                    $shippingMethodList.empty();
                    var shippingMethods = shipping.applicableShippingMethods;
                    var selected = shipping.selectedShippingMethod || {};
                    var shippingMethodFormID = form.name + '_shippingAddress_shippingMethodID';
                    //
                    // Create the new rows for each shipping method
                    //
                    $.each(shippingMethods, function (methodIndex, shippingMethod) {
                        var tmpl = $('#shipping-method-template').clone();
                        // set input
                        $('input', tmpl)
                            .prop('id', 'shippingMethod-' + shippingMethod.ID)
                            .prop('name', shippingMethodFormID)
                            .prop('value', shippingMethod.ID)
                            .attr('checked', shippingMethod.ID === selected.ID)
                            .attr('data-pickup', shippingMethod.storePickupEnabled);

                        $('label', tmpl)
                            .prop('for', 'shippingMethod-' + shippingMethod.ID);
                        // set shipping method name
                        $('.display-name', tmpl).text(shippingMethod.displayName);
                        // set or hide arrival time
                        if (shippingMethod.estimatedArrivalTime) {
                            $('.arrival-time', tmpl)
                                .text('(' + shippingMethod.estimatedArrivalTime + ')')
                                .show();
                        }
                        // set shipping cost
                        $('.shipping-cost', tmpl).text(shippingMethod.shippingCost);
                        $shippingMethodList.append(tmpl.html());
                    });
                }
            }
        });
    }
}

/**
 * Update list of available shipping methods whenever user modifies shipping address details.
 * @param {jQuery} $shippingForm - current shipping form
 */
function updateShippingMethodList($shippingForm) {
    // delay for autocomplete!
    setTimeout(function () {
        var $shippingMethodList = $shippingForm.find('.shipping-method-list');
        var urlParams = addressHelpers.methods.getAddressFieldsFromUI($shippingForm);
        var shipmentUUID = $shippingForm.find('[name=shipmentUUID]').val();
        var url = $shippingMethodList.data('actionUrl');
        urlParams.shipmentUUID = shipmentUUID;

        $shippingMethodList.spinner().start();
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: urlParams,
            success: function (data) {
                if (data.error) {
                    window.location.href = data.redirectUrl;
                } else {
                    $('body').trigger('checkout:updateCheckoutView',
                        {
                            order: data.order,
                            customer: data.customer,
                            options: { keepOpen: true }
                        });

                    $shippingMethodList.spinner().stop();
                }
            }
        });
    }, 300);
}

/**
 * updates the order shipping summary for an order shipment model
 * @param {Object} shipping - the shipping (shipment model) model
 * @param {Object} order - the order model
 */
function updateShippingSummaryInformation(shipping, order) {
    $('[data-shipment-summary=' + shipping.UUID + ']').each(function (i, el) {
        var $container = $(el);
        var $shippingAddressLabel = $container.find('.shipping-addr-label');
        var $addressContainer = $container.find('.address-summary');
        var $shippingPhone = $container.find('.shipping-phone');
        var $methodTitle = $container.find('.shipping-method-title');
        var $methodArrivalTime = $container.find('.shipping-method-arrival-time');
        var $methodPrice = $container.find('.shipping-method-price');
        var $shippingSummaryLabel = $container.find('.shipping-method-label');
        var $summaryDetails = $container.find('.row.summary-details');

        var address = shipping.shippingAddress;
        var selectedShippingMethod = shipping.selectedShippingMethod;

        addressHelpers.methods.populateAddressSummary($addressContainer, address);

        if (address && address.phone) {
            $shippingPhone.text(address.phone);
        } else {
            $shippingPhone.empty();
        }

        if (selectedShippingMethod) {
            $shippingAddressLabel.text(order.resources.shippingAddress);
            $shippingSummaryLabel.show();
            $summaryDetails.show();
            $methodTitle.text(selectedShippingMethod.displayName);
            if (selectedShippingMethod.estimatedArrivalTime) {
                $methodArrivalTime.text(
                    '( ' + selectedShippingMethod.estimatedArrivalTime + ' )'
                );
            } else {
                $methodArrivalTime.empty();
            }
            $methodPrice.text(selectedShippingMethod.shippingCost);
        }
    });
}

/**
 * Update the read-only portion of the shipment display (per PLI)
 * @param {Object} productLineItem - the productLineItem model
 * @param {Object} shipping - the shipping (shipment model) model
 * @param {Object} order - the order model
 * @param {Object} [options] - options for updating PLI summary info
 * @param {Object} [options.keepOpen] - if true, prevent changing PLI view mode to 'view'
 */
function updatePLIShippingSummaryInformation(productLineItem, shipping, order, options) {
    var keepOpen = options && options.keepOpen;

    var $pli = $('input[value=' + productLineItem.UUID + ']');
    var form = $pli && $pli.length > 0 ? $pli[0].form : null;

    if (!form) return;

    var $viewBlock = $('.view-address-block', form);

    var hasAddress = !!shipping.shippingAddress;
    var address = shipping.shippingAddress || {};
    var selectedMethod = shipping.selectedShippingMethod;

    var nameLine = address.firstName ? address.firstName + ' ' : '';
    if (address.lastName) nameLine += address.lastName;

    var address1Line = address.address1;
    var address2Line = address.address2;

    var phoneLine = address.phone;

    var shippingCost = selectedMethod ? selectedMethod.shippingCost : '';
    var methodNameLine = selectedMethod ? selectedMethod.displayName : '';
    var methodArrivalTime = selectedMethod && selectedMethod.estimatedArrivalTime
        ? '(' + selectedMethod.estimatedArrivalTime + ')'
        : '';

    var tmpl = $('#pli-shipping-summary-template').clone();

    $('.ship-to-name', tmpl).text(nameLine);
    $('.ship-to-address1', tmpl).text(address1Line);
    $('.ship-to-address2', tmpl).text(address2Line);
    $('.ship-to-city', tmpl).text(address.city);
    if (address.stateCode) {
        $('.ship-to-st', tmpl).text(address.stateCode);
    }
    $('.ship-to-zip', tmpl).text(address.postalCode);
    $('.ship-to-phone', tmpl).text(phoneLine);

    if (!address2Line) {
        $('.ship-to-address2', tmpl).hide();
    }

    if (!phoneLine) {
        $('.ship-to-phone', tmpl).hide();
    }

    if (shipping.selectedShippingMethod) {
        $('.display-name', tmpl).text(methodNameLine);
        $('.arrival-time', tmpl).text(methodArrivalTime);
        $('.price', tmpl).text(shippingCost);
    }

    $viewBlock.html(tmpl.html());

    if (!keepOpen) {
        if (hasAddress) {
            $viewBlock.parents('[data-view-mode]').attr('data-view-mode', 'view');
        } else {
            $viewBlock.parents('[data-view-mode]').attr('data-view-mode', 'enter');
        }
    }
}

/**
 * Update the hidden form values that associate shipping info with product line items
 * @param {Object} productLineItem - the productLineItem model
 * @param {Object} shipping - the shipping (shipment model) model
 */
function updateProductLineItemShipmentUUIDs(productLineItem, shipping) {
    $('input[value=' + productLineItem.UUID + ']').each(function (key, pli) {
        var form = pli.form;
        $('[name=shipmentUUID]', form).val(shipping.UUID);
        $('[name=originalShipmentUUID]', form).val(shipping.UUID);
    });
}

/**
 * Update the shipping UI for a single shipping info (shipment model)
 * @param {Object} shipping - the shipping (shipment model) model
 * @param {Object} order - the order/basket model
 * @param {Object} customer - the customer model
 * @param {Object} [options] - options for updating PLI summary info
 * @param {Object} [options.keepOpen] - if true, prevent changing PLI view mode to 'view'
 */
function updateShippingInformation(shipping, order, customer, options) {
    // First copy over shipmentUUIDs from response, to each PLI form
    order.shipping.forEach(function (aShipping) {
        aShipping.productLineItems.items.forEach(function (productLineItem) {
            updateProductLineItemShipmentUUIDs(productLineItem, aShipping);
        });
    });

    // Now update shipping information, based on those associations
    updateShippingMethods(shipping);
    updateShippingAddressFormValues(shipping);
    updateShippingSummaryInformation(shipping, order);

    // And update the PLI-based summary information as well
    shipping.productLineItems.items.forEach(function (productLineItem) {
        updateShippingAddressSelector(productLineItem, shipping, order, customer);
        updatePLIShippingSummaryInformation(productLineItem, shipping, order, options);
    });
}

/**
 * Update the checkout state (single vs. multi-ship) via Session.privacy cache
 * @param {Object} order - checkout model to use as basis of new truth
 */
function updateMultiShipInformation(order) {
    var $checkoutMain = $('#checkout-main');
    var $checkbox = $('[name=usingMultiShipping]');
    var $submitShippingBtn = $('button.submit-shipping');

    if (order.usingMultiShipping) {
        shippingState.changeState({ multiship: order.usingMultiShipping, collapsed: true });
        $checkoutMain.addClass('multi-ship');
        $checkbox.prop('checked', true);
    } else {
        $checkoutMain.removeClass('multi-ship');
        $checkbox.prop('checked', null);
        $submitShippingBtn.prop('disabled', null);
        shippingState.changeState({ collapsed: true });
    }
}

/**
 * Handle response from the server for valid or invalid form fields.
 * @param {Object} defer - the deferred object which will resolve on success or reject.
 * @param {Object} data - the response data with the invalid form fields or
 *  valid model data.
 */
function shippingFormResponse(defer, data) {
    var isMultiShip = $('#checkout-main').hasClass('multi-ship');
    var formSelector = isMultiShip
        ? '.multi-shipping .active form'
        : '.single-shipping form';

    // highlight fields with errors
    if (data.error) {
        if (data.fieldErrors.length) {
            data.fieldErrors.forEach(function (error) {
                if (Object.keys(error).length) {
                    formHelpers.loadFormErrors(formSelector, error);
                }
            });
            defer.reject(data);
        }

        if (data.cartError) {
            window.location.href = data.redirectUrl;
            defer.reject();
        }
    } else {
        //
        // Populate the Address Summary
        //

        $('body').trigger('checkout:updateCheckoutView',
            { order: data.order, customer: data.customer });

        defer.resolve(data);
    }
}

/**
 * Does Ajax call to trigger multishipping
 * @param {boolean} checked - is multi shipping checked
 */
function toggleMultiShip(checked) {
    var url = $('.shipping-nav form').attr('action');
    $.spinner().start();
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: {
            usingMultiShip: !!checked
        },
        success: function (data) {
            if (data.error) {
                window.location.href = data.redirectUrl;
            } else {
                $('body').trigger('checkout:updateCheckoutView',
                    { order: data.order, customer: data.customer });
            }
            $.spinner().stop();
        },
        error: function () {
            $.spinner().stop();
        }
    });
}

/**
 * Does Ajax call to create a server-side shipment w/ pliUUID & URL
 * @param {string} url - string representation of endpoint URL
 * @param {Object} shipmentData - product line item UUID
 * @returns {Object} - promise value for async call
 */
function createNewShipment(url, shipmentData) {
    $.spinner().start();
    return $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: shipmentData
    });
}

/**
 * Does Ajax call to select shipping method
 * @param {string} url - string representation of endpoint URL
 * @param {Object} urlParams - url params
 */
function selectShippingMethodAjax(url, urlParams) {
    $.spinner().start();
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: urlParams
    })
        .done(function (data) {
            if (data.error) {
                window.location.href = data.redirectUrl;
            } else {
                $('body').trigger('checkout:updateCheckoutView',
                    {
                        order: data.order,
                        customer: data.customer,
                        options: { keepOpen: true }
                    }
                );
            }
            $.spinner().stop();
        })
        .fail(function () {
            $.spinner().stop();
        });
}

/**
 * Initializes state object from shipping form data attribute
 */
function initializeStateObject() {
    var initialState = $('.shipping-form').data('initial-state');
    shippingState = new ShippingState(initialState.shippingState);
}

module.exports = {
    methods: {
        updateShippingAddressSelector: updateShippingAddressSelector,
        updateShippingAddressFormValues: updateShippingAddressFormValues,
        updateShippingMethods: updateShippingMethods,
        updateShippingSummaryInformation: updateShippingSummaryInformation,
        updatePLIShippingSummaryInformation: updatePLIShippingSummaryInformation,
        updateProductLineItemShipmentUUIDs: updateProductLineItemShipmentUUIDs,
        updateShippingInformation: updateShippingInformation,
        updateMultiShipInformation: updateMultiShipInformation,
        shippingFormResponse: shippingFormResponse,
        toggleMultiShip: toggleMultiShip,
        createNewShipment: createNewShipment,
        selectShippingMethodAjax: selectShippingMethodAjax,
        updateShippingMethodList: updateShippingMethodList,
        initializeStateObject: initializeStateObject
    },

    selectShippingMethod: function () {
        $('.shipping-method-list').change(function () {
            var $shippingForm = $(this).parents('form');
            var methodID = $(':checked', this).val();
            var pickupEnabled = $(':checked', this).data('pickup');
            var shipmentUUID = $shippingForm.find('[name=shipmentUUID]').val();
            var urlParams = addressHelpers.methods.getAddressFieldsFromUI($shippingForm);
            urlParams.shipmentUUID = shipmentUUID;
            urlParams.methodID = methodID;

            shippingState.changeState({ pickupEnabled: pickupEnabled }, shipmentUUID);

            var url = $(this).data('select-shipping-method-url');
            selectShippingMethodAjax(url, urlParams);
        });
    },

    selectMultiShipping: function () {
        $('input[name="usingMultiShipping"]').on('change', function () {
            var checked = this.checked;
            toggleMultiShip(checked);
        });
    },

    selectSingleShipAddress: function () {
        $('.single-shipping .addressSelector').on('change', function () {
            var form = $(this).parents('form')[0];
            var selectedOption = $('option:selected', this);
            var attrs = selectedOption.data();
            var shipmentUUID = selectedOption[0].value;
            var originalUUID = $('input[name=shipmentUUID]', form).val();
            var element;

            Object.keys(attrs).forEach(function (attr) {
                element = attr === 'countryCode' ? 'country' : attr;
                $('[name$=' + element + ']', form).val(attrs[attr]);
            });

            $('[name$=stateCode]', form).trigger('change');

            if (shipmentUUID === 'new') {
                $(form).attr('data-address-mode', 'new');
            } else if (shipmentUUID === originalUUID) {
                $(form).attr('data-address-mode', 'shipment');
            } else if (shipmentUUID.indexOf('ab_') === 0) {
                $(form).attr('data-address-mode', 'customer');
            } else {
                $(form).attr('data-address-mode', 'edit');
            }
        });
    },

    selectMultiShipAddress: function () {
        $('.product-shipping-block .addressSelector').on('change', function () {
            var form = $(this).parents('form')[0];
            var selectedOption = $('option:selected', this);
            var attrs = selectedOption.data();
            var shipmentUUID = selectedOption[0].value;
            var originalUUID = $('input[name=shipmentUUID]', form).val();
            var pliUUID = $('input[name=productLineItemUUID]', form).val();

            Object.keys(attrs).forEach(function (attr) {
                $('[name$=' + attr + ']', form).val(attrs[attr]);
            });

            if (shipmentUUID === 'new' && pliUUID) {
                var createShipmentUrl = $(this).attr('data-create-shipment-url');
                createNewShipment(createShipmentUrl, { productLineItemUUID: pliUUID })
                    .done(function (response) {
                        $.spinner().stop();
                        if (response.error) {
                            if (response.redirectUrl) {
                                window.location.href = response.redirectUrl;
                            }
                            return;
                        }

                        $('body').trigger('checkout:updateCheckoutView',
                            {
                                order: response.order,
                                customer: response.customer,
                                options: { keepOpen: true }
                            }
                        );

                        $(form).attr('data-address-mode', 'new');
                    })
                    .fail(function () {
                        $.spinner().stop();
                    });
            } else if (shipmentUUID === originalUUID) {
                $('select[name$=stateCode]', form).trigger('change');
                $(form).attr('data-address-mode', 'shipment');
            } else if (shipmentUUID.indexOf('ab_') === 0) {
                var url = form.action;
                var serializedData = $(form).serialize();
                createNewShipment(url, serializedData)
                    .done(function (response) {
                        $.spinner().stop();
                        if (response.error) {
                            if (response.redirectUrl) {
                                window.location.href = response.redirectUrl;
                            }
                            return;
                        }

                        $('body').trigger('checkout:updateCheckoutView',
                            {
                                order: response.order,
                                customer: response.customer,
                                options: { keepOpen: true }
                            }
                        );

                        $(form).attr('data-address-mode', 'customer');
                    })
                    .fail(function () {
                        $.spinner().stop();
                    });
            } else {
                var updatePLIShipmentUrl = $(form).attr('action');
                var serializedAddress = $(form).serialize();
                createNewShipment(updatePLIShipmentUrl, serializedAddress)
                    .done(function (response) {
                        $.spinner().stop();
                        if (response.error) {
                            if (response.redirectUrl) {
                                window.location.href = response.redirectUrl;
                            }
                            return;
                        }

                        $('body').trigger('checkout:updateCheckoutView',
                            {
                                order: response.order,
                                customer: response.customer,
                                options: { keepOpen: true }
                            }
                        );

                        $(form).attr('data-address-mode', 'edit');
                    })
                    .fail(function () {
                        $.spinner().stop();
                    });
            }
        });
    },

    multiShipActions: function () {
        $('.product-shipping-block [data-action]').on('click', function (e) {
            e.preventDefault();

            var action = $(this).data('action');
            var $rootEl = $(this).parents('[data-view-mode]');
            var form = $(this).parents('form')[0];

            switch (action) {
                case 'enter':
                case 'edit':
                    // do nothing special, just show the edit address view
                    if (action === 'enter') {
                        $(form).attr('data-address-mode', 'new');
                    } else {
                        $(form).attr('data-address-mode', 'edit');
                    }

                    $rootEl.attr('data-view-mode', 'edit');
                    var addressInfo = addressHelpers.methods.getAddressFieldsFromUI(form);
                    var savedState = {
                        UUID: $('input[name=shipmentUUID]', form).val(),
                        shippingAddress: addressInfo
                    };

                    $rootEl.data('saved-state', JSON.stringify(savedState));
                    break;
                case 'cancel':
                    // Should clear out changes / restore previous state
                    var restoreState = $rootEl.data('saved-state');
                    if (restoreState) {
                        var restoreStateObj = JSON.parse(restoreState);
                        // TODO: This should test whatever might trigger a server-side save
                        //  which is stateCode, as of now, 8/8/2017
                        var originalStateCode = restoreStateObj.shippingAddress.stateCode;
                        var stateCode = $('[name$=_stateCode]', form).val();
                        updateShippingAddressFormValues(restoreStateObj);
                        if (stateCode !== originalStateCode) {
                            $('[data-action=save]', form).trigger('click');
                        } else {
                            $(form).attr('data-address-mode', 'edit');
                        }
                    }
                    break;
                case 'save':
                    // Save address to checkoutAddressBook
                    var data = $(form).serialize();
                    var url = form.action;
                    $rootEl.spinner().start();
                    $.ajax({
                        url: url,
                        type: 'post',
                        dataType: 'json',
                        data: data
                    })
                        .done(function (response) {
                            formHelpers.clearPreviousErrors(form);
                            if (response.error) {
                                formHelpers.loadFormErrors(form, response.fieldErrors);
                            } else {
                                // Update UI from response

                                $('body').trigger('checkout:updateCheckoutView',
                                    {
                                        order: response.order,
                                        customer: response.customer
                                    }
                                );

                                $rootEl.attr('data-view-mode', 'view');
                            }

                            if (response.order && response.order.shippable) {
                                $('button.submit-shipping').attr('disabled', null);
                            } else {
                                $('button.submit-shipping').attr('disabled', 'disabled');
                            }
                            $rootEl.spinner().stop();
                        })
                        .fail(function (err) {
                            if (err.responseJSON.redirectUrl) {
                                window.location.href = err.responseJSON.redirectUrl;
                            }

                            $rootEl.spinner().stop();
                        });

                    // pull down applicable shipping methods
                    break;
                default:
                // console.error('unhandled tab target: ' + testTarget);
            }
            return false;
        });
    },

    updateShippingList: function () {
        $('select[name$="shippingAddress_addressFields_states_stateCode"]')
            .on('change', function (e) {
                updateShippingMethodList($(e.currentTarget.form));
            });
    }
};
