if (typeof $.easing !== 'undefined') {
	$.easing['jswing'] = $.easing['swing'];
}

export const Easing = $.extend($.easing, {
	def: 'easeOutQuad',
	swing: (x) => {
		return $.easing[$.easing.def](x);
	},
	easeOutQuad: (x) => {
		return 1 - (1 - x) * (1 - x);
	},
	easeInOutCirc: (x) => {
		return x < 0.5 ?
		(1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 :
		(Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
	}
});
