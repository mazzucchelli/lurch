class search {

    constructor () {
        this.minChars = 3;
        this.debounce = null;
        this.searchToggle = $('.search-item a, #search .close-modal, #toggle-mobile-search, #toggle-mobile-search2, .trigger-search-modal');

        // selectors
        this.endpoint = $('.suggestions-wrapper').data('url');
        this.searchField = $('input.search-field');
        this.searchIcon = $('#search .search-icon');
        this.clearSearch = $('#search .clear-search');
    }

    run () {
        this.toggleSearch();
        this.clear();

        this.searchField.on('keyup click', e => {
            if (this.debounce) {
                clearTimeout(this.debounce);
                this.debounce = null;
            }

            this.debounce = setTimeout(() => {
                this.getSuggestions(e.target);
            }, 300);                
        });
    }

    toggleSearch () {
        this.searchToggle.click(() => {
            this.searchField.val('');
            this.getSuggestionsWrapper().empty();
            $('body').toggleClass('search-visible');
            $('#search .search-field').focus();

            if ($('body').hasClass('search-visible')) {
                this.getSuggestions(this.searchField);
            }
        });
    }

    clear () {
        this.clearSearch.click(e => {
            this.searchField.val('');
            this.searchField.trigger('click');
        });
    }

    /**
     * Retrieve suggestions
     *
     * @param {Object} scope - Search field DOM element
     */
    getSuggestions (scope) {
        if (['small', 'medium'].indexOf(Foundation.MediaQuery.current) > -1) {
            if ($(scope).val().length) {
                this.searchIcon.hide();
                this.clearSearch.show();
            } else {
                this.searchIcon.show();
                this.clearSearch.hide();
            }
        }

        // if ($(scope).val().length >= this.minChars) {
            // $.spinner().start();
            let endpoint = this.endpoint;
            if ($(scope).val().length && $(scope).val().length >= this.minChars) {
                endpoint += encodeURIComponent($(scope).val());
            }

            $.ajax({
                context: scope,
                url: endpoint,
                method: 'GET',
                success: response => {
                    this.processResponse(response);
                },
                error: () => { 
                    // $.spinner().stop(); 
                }
            });
        // } else {
            // this.getSuggestionsWrapper().empty();
        // }
    }

    /**
     * Retrieves Suggestions element relative to scope
     *
     * @param {Object} scope - Search input field DOM element
     * @return {JQuery} - .suggestions-wrapper element
     */
    getSuggestionsWrapper () {
        return $('#search .suggestions-wrapper');
    }

    /**
     * Process Ajax response for SearchServices-GetSuggestions
     *
     * @param {Object|string} response - Empty object literal if null response or string with rendered
     *                                   suggestions template contents
     */
    processResponse (response) {
        var $suggestionsWrapper = this.getSuggestionsWrapper().empty();

        //$.spinner().stop();

        if (!(typeof (response) === 'object')) {
            $suggestionsWrapper.append(response).show();

            $('.popular-searches a').click(e => {
                e.preventDefault();
                this.searchField.val($(e.target).text());
                this.searchField.trigger('click');
            });
        } else {
            $suggestionsWrapper.hide();
        }
    }
}

const Search = new search();
export default Search;
 