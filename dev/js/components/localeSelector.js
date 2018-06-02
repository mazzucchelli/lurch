class localeSelector {

    constructor () {
        this.page = $('.page');
        this.langList = $('.lang-list');
        this.langLink = $('.lang-list a');
        this.countryList = $('.country-list');
        this.countryLink = $('.country-list a');
        this.languageSelectorClick();
        this.countrySelectorClick();
    }

    languageSelectorClick () {

        this.langLink.click(e => {
            e.preventDefault();
            var action = this.page.data('action');
            var localeCode = $(e.currentTarget).data('locale');
            var localeCurrencyCode = $(e.currentTarget).data('currencycode');
            var queryString = this.page.data('querystring');
            var url = this.langList.data('url');

            $.ajax({
                url: url,
                type: 'get',
                dataType: 'json',
                data: {
                    code: localeCode,
                    queryString: queryString,
                    CurrencyCode: localeCurrencyCode,
                    action: action
                },
                success: response => {
                    if (response && response.redirectUrl) {
                        window.location.href = response.redirectUrl;
                    }
                },
                error: () => {
                }
            });
        });

    }

    countrySelectorClick () {

        this.countryLink.click(e => {
            e.preventDefault();
            var action = this.page.data('action');
            var localeCode = $(e.currentTarget).data('locale');
            var localeCountryCode = $(e.currentTarget).data('countrycode');
            var url = this.countryList.data('url');

            $.ajax({
                url: url,
                type: 'get',
                dataType: 'json',
                data: {
                    countryCode: localeCountryCode,
                    code: localeCode,
                    action: action
                },
                success: response => {
                    if (response && response.redirectUrl) {
                        window.location.href = response.redirectUrl;
                    }
                },
                error: () => {
                }
            });
        });

    }

};

const LocaleSelector = new localeSelector()
export default LocaleSelector