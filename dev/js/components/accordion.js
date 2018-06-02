import { Easing } from '../services/easing';

/**
 * @function setARIA
 * @description Apply the correct ARIA attribute at the moment of click.
 * @param {jQuery} $el - DOM element to set the correct ARIA attribute.
 * @param {jQuery} $container - DOM element to check if it is hidden or not.
 */
function setARIA($el, $container) {
	if ($el.siblings($container).is(':hidden')) {
		$el.attr('aria-expanded', 'false');
	} else {
		$el.attr('aria-expanded', 'true');
	}
}

class accordion {
	constructor () {
		this.parent = '.accordion';
		this.triggerEl = '.trigger';
		this.expandable = $('.expandable');
		this.content = $('.content');
		this.defEasing = 'easeInOutCirc';
		this.defTiming = 450;
	}

	run () {
		this.findOpenContents();
		this.setWCAG();
		this.trigger();
	}

	findOpenContents() {
		$(this.parent).find('[data-init-open]').each((index, el) => {
			$(el).addClass('open').removeAttr('data-init-open').find(this.content).show();
		});
	}

	setWCAG () {
		$(this.parent).attr('role', 'tablist').find(this.triggerEl).each((index, el) => {
			$(el).attr('role', 'tab').attr('tabindex', '0');
			$(el).siblings(this.content).attr('role', 'tabpanel');
			setARIA($(el), this.content);
		});
	}

	trigger () {
		$(this.parent).on('click', this.triggerEl, event => {
			event.preventDefault();
			let self = $(event.currentTarget);

			this.toggleTriggerClass(self);
			this.toggleContent(self);
			// launch `siblingsSlideUp` after all events - improve FPS.
			this.siblingsSlideUp(self);
		});
	}

	toggleTriggerClass (elem) {
		elem.closest(this.expandable).toggleClass('open');
	}

	toggleContent (elem) {
		elem.siblings(this.content).stop().slideToggle(this.defTiming, this.defEasing, () => {
			setARIA(elem, this.content);
		});
	}

	siblingsSlideUp (elem) {
		if (elem.parents(this.parent).attr('data-trigger-once') != 'true') {
			elem.closest(this.expandable).siblings(this.expandable).find(this.content).slideUp(this.defTiming, this.defEasing);
			elem.closest(this.expandable).siblings(this.expandable).removeClass('open');
			elem.closest(this.expandable).siblings(this.expandable).find(this.triggerEl).attr('aria-expanded', 'false');
		}
	}
}

const Accordion = new accordion();
export default Accordion;
