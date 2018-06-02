import { makeID } from '../services/utils';

class plugins {
    // we use this class to load global plugins
    constructor () {
        // tab selectors
        this.tabSelect = $('.tab-select');
        this.tabNav = $('.tab-nav');
        this.tabContent = $('.tab-content');

        this.foundation();
        this.validator();
        this.svg4everybody();
        this.select();
        this.tab();
    }

    foundation () {
        $(document).foundation();
    }

    svg4everybody () {
        svg4everybody();
    }

    validator () {
        const forms = $('[data-validate]');
        if (!forms.length) return;

        forms.each((i, form) => {
            $(form).parsley({
                errorClass: 'is-invalid-input',
                successClass: 'is-valid-input',
                errorsWrapper: '<div class="errors-list"></div>',
                errorTemplate: '<span class="form-error is-visible"></span>'
            }).on('field:error', e => {
                e.$element
                    .parent('label')
                    .removeClass('is-valid-label')
                    .addClass('is-invalid-label');
            }).on('field:success', e => {
                e.$element
                    .parent('label')
                    .removeClass('is-invalid-label')
                    .addClass('is-valid-label');
            });
        });
    }

    select () {
        if (['small', 'medium'].indexOf(Foundation.MediaQuery.current) > -1) return;

        const makeCustom = select => {
            if (!$(select).attr('data-id')) $(select).attr('data-id', makeID());
            $(select).customSelect({
                transition: 300,
                modifier: `${$(select).attr('class')} ${$(select).attr('data-id')}`
            });
        };

        $('select:not(.nocustom)').each((i, select) => {
            makeCustom(select);

            $(select).on('DOMSubtreeModified', e => {
                $(e.currentTarget).removeData('custom-select');
                $(`.${$(e.currentTarget).data('id')}`).remove();
                makeCustom(e.target);
            });
        });
    }

    tab () {
        const updateView = targetContent => {
            this.tabContent.removeClass('is-active');
            $(`#${targetContent}`).addClass('is-active');
        }

        this.tabNav.on('click', 'a', e => {
            e.preventDefault();

            const targetContent = $(e.currentTarget).parents('li').data('target');
            this.tabNav.find('li').removeClass('is-current');
            $(e.currentTarget).parents('li').addClass('is-current');
            this.tabSelect.val(targetContent);
            
            if (['small', 'medium'].indexOf(Foundation.MediaQuery.current) === -1) {
                this.tabSelect.removeData('custom-select').show().next('.custom-select').remove();
                this.tabSelect.customSelect({
                    transition: 300,
                    modifier: this.tabSelect.attr('class')
                });
            }
            updateView(targetContent);
        });

        this.tabSelect.on('change', e => {
            e.preventDefault();
            const targetContent = $(e.currentTarget).val();
            this.tabNav.find('li').removeClass('is-current');
            this.tabNav.find(`li[data-target="${targetContent}"]`).addClass('is-current');
            updateView(targetContent);
        });
    }
}

const Plugins = new plugins();
export default Plugins;
