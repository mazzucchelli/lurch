/**
 * Update DOM elements with Ajax results
 *
 * @param {Object} $results - jQuery DOM element
 * @param {string} selector - DOM element to look up in the $results
 * @return {undefined}
 */
function updateDom($results, selector) {
    const $updates = $results.find(selector);
    $(selector).empty().html($updates.html());
}

//$('.product-grid').empty().html(response);

/**
 * Keep refinement panes expanded/collapsed after Ajax refresh
 *
 * @param {Object} $results - jQuery DOM element
 * @return {undefined}
 */
function handleRefinements($results) {
    $('.refinement.active').each(function () {
        $(this).removeClass('active');

        $results
            .find(`.${$(this)[0].className.replace(/ /g, '.')}`)
            .addClass('active');
    });

    updateDom($results, '.refinements');
}

/**
 * Parse Ajax results and updated select DOM elements
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function parseResults(response) {
    const $results = $(response);
    const specialHandlers = {
        '.refinements': handleRefinements
    };

    // Update DOM elements that do not require special handling
    [
        '.grid-header',
        '.header-bar',
        '.header.page-title',
        '.product-grid',
        '.show-more',
        '.filter-bar'
    ].forEach(selector => {
        updateDom($results, selector);
    });

    this.plpMobileMenu();

    Object.keys(specialHandlers).forEach(selector => {
        specialHandlers[selector]($results);
    });
}

/**
 * This function retrieves another page of content to display in the content search grid
 * @param {JQuery} $element - the jquery element that has the click event attached
 * @param {JQuery} $target - the jquery element that will receive the response
 * @return {undefined}
 */
function getContent($element, $target) {
    const showMoreUrl = $element.data('url');
    //$.spinner().start();
    $.ajax({
        url: showMoreUrl,
        method: 'GET',
        success(response) {
            $target.append(response);
            //$.spinner().stop();
        },
        error() {
            //$.spinner().stop();
        }
    });
}

/**
 * Update sort option URLs from Ajax response
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function updateSortOptions(response) {
    const $tempDom = $('<div>').append($(response));
    const sortOptions = $tempDom.find('.grid-footer').data('sort-options').options;
    sortOptions.forEach(option => {
        $(`option.${option.id}`).val(option.url);
    });
}

class plp {

    run () {
        $(document).ready(() => {

            this.applyFilter();
            this.closeRefinments();
            this.filter();
            this.plpMobileMenu();
            this.rellax();
            this.rowSwitch();
            this.showMore();
            this.sort();
            
            $(document).ajaxComplete(() => {
              const getSortOptions = $('.grid-footer').data('sort-options');
              $(`.${getSortOptions.ruleId}`)
                  .addClass('current')
                  .siblings()
                  .removeClass('current');
                  this.rellax();
            });

            $('.button-goto-top').on('click', e => {
                e.preventDefault();
                $('html,body').animate({
                    scrollTop: 0
                }, 700);
            });
            
        });
    }

    rowSwitch () {
        $('.cta-layout-1').click(function() {
            $('body').removeClass('plp-two-row');
            sessionStorage.setItem('plpTwoRow', false);
        });

        $('.cta-layout-2').click(function () {
            $('body').addClass('plp-two-row');
            sessionStorage.setItem('plpTwoRow', true);
        });

        let block = sessionStorage.getItem('plpTwoRow');
        if (block == 'true') {
            $('body').addClass('plp-two-row');
        }
    }

    filter () {
        // Display refinements bar when Menu icon clicked
        $('.container').on('click', 'button.filter-results', () => {
            $('.refinement-bar').show();
            $('body').addClass('mobile-filter-nav-visible');
        });
    }

    closeRefinments () {
        // Refinements close button
        $('.container').on('click', '.refinement-bar button.close', () => {
            $('.refinement-bar').hide();
            $('body').removeClass('mobile-filter-nav-visible');
        });
    }

    sort () {
        // Handle sort order menu selection
        $('.container').on('click', '.plp-sort-order a', function (e) {
            e.preventDefault();
            e.stopPropagation();

            //$.spinner().start();
            $(this).trigger('search:sort', e);
            $.ajax({
                url: e.target.href,
                data: { selectedUrl: e.target.href },
                method: 'GET',
                success(response) {
                    $('.product-grid').empty().html(response);
                    $('[data-interchange]:not([src])').foundation();
                    this.plpMobileMenu();
                    //$.spinner().stop();
                },
                error() {
                    //$.spinner().stop();
                }
            });
        });
    }

    showMore() {
        // Show more products
        $('.container').on('click', '.show-more button', function (e) {
            e.stopPropagation();
            const showMoreUrl = $(this).data('url');

            e.preventDefault();

            //$.spinner().start();
            $(this).trigger('search:showMore', e);
            $.ajax({
                url: showMoreUrl,
                data: { selectedUrl: showMoreUrl },
                method: 'GET',
                success(response) {
                    $('.grid-footer').replaceWith(response);
                    updateSortOptions(response);
                    $('[data-interchange]:not([src])').foundation();
                    //$.spinner().stop();
                },
                error() {
                    //$.spinner().stop();
                }
            });
        });
    }

    applyFilter() {
        // Handle refinement value selection and reset click
        $('.container').on(
            'click',
            '.refinements li a, .refinement-bar a.reset, .filter-value a, .swatch-filter a',
            function (e) {
                e.preventDefault();
                e.stopPropagation();

                //$.spinner().start();
                $(this).trigger('search:filter', e);
                $.ajax({
                    url: e.currentTarget.href,
                    data: {
                        page: $('.grid-footer').data('page-number'),
                        selectedUrl: e.currentTarget.href
                    },
                    method: 'GET',
                    success(response) {
                        parseResults(response);
                        $('[data-interchange]:not([src])').foundation();
                        //$.spinner().stop();
                    },
                    error() {
                        //$.spinner().stop();
                    }
                });
            });
    }

    rellax () {
        if (!$('[data-rellax]').length || ['small', 'medium'].indexOf(Foundation.MediaQuery.current) > -1) return;
        $('[data-rellax]:not(.rellax-active)').each((i, el) => {
            $(el).addClass('rellax-active');
            setTimeout(() => {
                const rellax = new Rellax(el, {
                    center: $(el).data('rellax-center')
                });
            });
        });
    }

    plpMobileMenu () {
        if (['small', 'medium'].indexOf(Foundation.MediaQuery.current) === -1) return;
        $('.plp-header-content-card-title').click(event => {
            $(event.currentTarget).toggleClass('open');
            $(event.currentTarget).next('.plp-header-content-card-body').slideToggle();
        });
    }

    showContentTab () {
        // Display content results from the search
        $('.container').on('click', '.content-search', function () {
            if ($('#content-search-results').html() === '') {
                getContent($(this), $('#content-search-results'));
            }
        });

        // Display the next page of content results from the search
        $('.container').on('click', '.show-more-content button', function () {
            getContent($(this), $('#content-search-results .result-count'));
            $('.show-more-content').remove();
        });
    }

};

const Plp = new plp();
Plp.run();
