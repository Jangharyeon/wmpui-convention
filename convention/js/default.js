var $win = $(window);
// mac, window 분기
var is_Mac = navigator.platform.toUpperCase().indexOf('MAC')>=0,
	is_Win = navigator.platform.toUpperCase().indexOf('WIN')>=0;
if (is_Mac) {
	$('html').addClass('mac');
}
if (is_Win) {
	$('html').addClass('win');
}

function initPage() {

	// snb메뉴
	var winWidth = $win.width();
	
	// snb fixed
	function fixedSnb() {
		var $snb = $('#snb'),
			$sideNav = $('.side-nav'),
			bodyHeight = $('body').height(),
			headerHeight = $('#header').outerHeight(),
			cHeaderHeight = $('#cHeader').outerHeight(),
			winheight = $win.height(),
			footerHeight = $('#footer').outerHeight(),
			sideNavHeight = $sideNav.outerHeight(),
			tBarHeight = $('.t-bar').height(),
			snbOffset = $snb.offset(),
			sideNavOffset = $sideNav.offset(),
			scrollFixedStartPosition = bodyHeight-winheight,
			scrollEndNavPosition = bodyHeight-sideNavHeight-footerHeight,
			scrollEndNavOffset = bodyHeight-headerHeight-cHeaderHeight-footerHeight-sideNavHeight-tBarHeight,
			scrollDefaultPosition = $win.scrollTop() < headerHeight + cHeaderHeight;

		if ($win.scrollTop() > snbOffset.top && $win.scrollTop() <= scrollFixedStartPosition) {
			$sideNav.addClass('fixed').removeAttr('style');
		}
		if ($win.scrollTop() > scrollEndNavPosition) {
			$sideNav.css({
				'position':'absolute',
				'top':scrollEndNavOffset
			}).removeClass('fixed');
		}
		if (scrollDefaultPosition) {
			$sideNav.removeClass('fixed').removeAttr('style');
		}
	}

	function snbActive(snbMainMenu) {
		var lastId,
			snbMenu = $(snbMainMenu),
			scrollItems = snbMenu.map(function() {
				var item = $($(this).attr('data-href1'));
				if (item.length) {
					return item;
				}
			});

		return function() {
			var cur = scrollItems.map(function() {
				if ($(this).offset().top <= $win.scrollTop()+2) {
					return this;
				}
			});
			cur = cur[cur.length-1];
			var id = cur && cur.length ? cur[0].id : "";
			if (lastId !== id) {
				snbMenu.parent().removeAttr('class').end().filter('[data-href1=#'+id+']').parent().addClass('on');
			}
		}
	}

	//scrollEndPosition snb on event last select
	function scrollEndPositionSnbEvent() {
		var $listSnb = $('.side-nav .list-snb');
		var bodyHeight = $('body').outerHeight();
		var winHeight = $win.height();
		var winScrollTop = $win.scrollTop();
		if (bodyHeight - winHeight - 1 < winScrollTop) {
			$listSnb.find('li').removeClass('on');
			$listSnb.find('li:last-child').addClass('on');
			$listSnb.find('.list-sub li:last-child').addClass('on');
			$listSnb.find('.list-sub a').click(function() {
				$listSnb.find('.list-sub li').removeClass('on');
				$(this).parent().addClass('on');
			});
		}
	}

	// mobile-unfold-menu
	$('.navbar-header .btn-fold').off().on('click', function() {
		var $this = $(this);
		var $navLnb = $('.nav-lnb');
		var listLnbHeight = $('.list-lnb').outerHeight();
		$this.parents('#header').toggleClass('menu-unfold');
		if ($('#header').hasClass('menu-unfold')) {
			$navLnb.css('height', listLnbHeight);
		} else {
			$navLnb.removeAttr('style');
		}
	});

	// mobile-top-button
	var windowWidth = $(window).width();
	if (windowWidth < 769) {
		$('#footer .btn-top').off().on('click touchend', function() {
			$('html, body').animate({
				scrollTop:0
			}, 200);
			return false;
		});
	}

	// font-size zoom-in-out
	var $container = $('#container');
	function defaultFontSize() {
		$('.list-zoom .btn-zoom').click(function() {
			if (!$container.is('[style]')) {
				$container.css('font-size','14px');
			}
		});
	}

	function getFontSize() {
		return $container.attr('style').substr(11,2);
	}

	function adjustFontSize(max, factor) {
		var fontSize = getFontSize();
		function maximumFontSize() {
			$container.css({
				'font-size':parseInt(fontSize)+factor
			});
		}
		if (fontSize > max) {
			maximumFontSize();
		} else if (fontSize < max) {
			maximumFontSize();
		}
	}

	function zoomIn() {
		adjustFontSize(22, 2);
	}
	function zoomOut() {
		adjustFontSize(10, -2);
	}

	// actionEvent
	var snbTit = snbActive('.side-nav .list-snb > li > a');
	var snbSubTit = snbActive('.side-nav .list-sub > li > a');
	
	defaultFontSize();
	$('.list-zoom .btn-in').click(zoomIn);
	$('.list-zoom .btn-out').click(zoomOut);
	$('.list-zoom .btn-reset').click(function() {
		$container.removeAttr('style');
	});

	// scrollEvent
	$win.off('scroll').on('scroll', function() {
		snbTit();
		snbSubTit();
		fixedSnb();
		scrollEndPositionSnbEvent();
	});

	// lnb location
	var lastUrl = window.location.hash.replace('#\/', '');
	if(lastUrl.indexOf("#") > -1) {
		lastUrl = lastUrl.substr(0, lastUrl.indexOf("#"));
	}
	$('#lnb .on').removeClass('on');
	$('.nav-lnb a[href*="' + lastUrl + '"]').parent().addClass('on');

	SyntaxHighlighter.highlight({});

}

var wmpConventionApp = angular.module('wmp', ['ngRoute']);

wmpConventionApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/coding-guide', { templateUrl: 'convention/views/coding-guide.html' })
		.when('/css-guide', { templateUrl: 'convention/views/css-guide.html' })
		.when('/html-guide', { templateUrl: 'convention/views/html-guide.html' })
		.when('/image-guide', { templateUrl: 'convention/views/image-guide.html' })
		.when('/naming-guide', { templateUrl: 'convention/views/naming-guide.html' })
		.when('/reference', { templateUrl: 'convention/views/reference.html' })
		.otherwise({redirectTo: '/coding-guide'});
}]);

wmpConventionApp.directive('wmpSnb', function($compile) {

	return {
		compile: function(element, atrr) {

			return function($scope, element, attrs) {

				// section-docs h1,h2를 snb메뉴로 자동 생성
				$('.section-docs').each(function(index) {
					var $this = $(this),
						$thisTitle = $this.children('.tit-docs'),
						sectionTitleId = $thisTitle.attr('id'),
						sectionTitleText = $thisTitle.text();
					if ($this.children('h2').length > 0) {
						$('.list-snb').append('<li><a href="" data-href1="#'+sectionTitleId+'" ng-click="moveTo(\'' +sectionTitleId+ '\')">' + sectionTitleText + '</a><ul class="list-sub"></ul></li>');
						$thisTitle.parent().children('h2').each(function() {
							var $this = $(this),
								sectionSubTitleId = $this.attr('id'),
								sectionSubTitleText = $this.text(),
								listSubIndex = $('.list-snb .list-sub').length;
							$('.list-snb .list-sub').eq(listSubIndex-1).append('<li><a href="" data-href1="#'+sectionSubTitleId+'" ng-click="moveTo(\'' +sectionSubTitleId+'\')">' + sectionSubTitleText + '</a></li>');
						});
					} else {
						$('.list-snb').append('<li><a href="" data-href1="#'+sectionTitleId+'" ng-click="moveTo(\'' +sectionTitleId+ '\')">' + sectionTitleText + '</a></li>');
					}
				});

				$compile(element.contents())($scope);
			}
		}
	}
});

wmpConventionApp.controller('AppCtrl', ['$rootScope', '$route', '$location', '$anchorScroll', '$timeout', '$window',
	function($scope, $route, $location, $anchorScroll, $timeout, $window) {

	function init() {
		if(!$scope.init && $('#snb').length > 0) {  
			$scope.init = true;
			initPage();
		}
	}

	$scope.moveTop = function() {
		$location.hash('top');
		$($window).scrollTop(0);
	}

	$scope.moveTo = function(id) {
		$location.hash(id);
		setTimeout(function() {
			var section = $('#' + id).closest('section');
			var offset = section.offset();
			var remainHeight = 0;
			while(section.length > 0) {
				remainHeight += section.outerHeight();
				section = section.next();
			}
			if($(window).height() > remainHeight) {
				$('html body').scrollTop($(document).height());
			}
		});
	}

	$scope.$on('$routeChangeStart', function() {
		$scope.init = false;
	});

	$scope.$on('$includeContentLoaded', init);

	$scope.$on('$viewContentLoaded', init);

}]);

