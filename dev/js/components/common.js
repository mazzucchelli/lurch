import Login from './login';
import Search from './search';
import Minicart from './minicart';
import LocaleSelector from './localeSelector';
import Accordion from './accordion';

class common {

    run () {
        this.mobileMenu();
        this.footerMenu();
        Login.login();
        Search.run();
        Minicart.run();
        Accordion.run();
    }

    mobileMenu () {
        if (['small', 'medium'].indexOf(Foundation.MediaQuery.current) === -1) return;

        $('.mobile-level-1 a').click(event => {
            $(event.currentTarget).toggleClass('open');
            $(event.currentTarget).next('.mobile-submenu').slideToggle();
        });

        $('#toggle-mobile-menu, #close-mobile-menu').click(event => {
            $('body').toggleClass('menu-visible');
        });
    }

    footerMenu () {
        if (['small', 'medium'].indexOf(Foundation.MediaQuery.current) === -1) return;

        $('footer h6').click(event => {
            $(event.currentTarget).toggleClass('open');
            $(event.currentTarget).next('.menu-footer').slideToggle();
        });
    }
}

const Common = new common();
export default Common;
