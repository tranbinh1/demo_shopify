(function ($) {
	var $body = $('body'),
        $doc = $(document),
        $html = $('html'),
        $win = $(window);

    $doc.ready(() => {
        $doc.ajaxStart(() => {
            halo.isAjaxLoading = true;
        });

        $doc.ajaxStop(() => {
            halo.isAjaxLoading = false;
        });

        halo.ready();
    });

	window.onload = function() { 
	    halo.init();
	}

	var halo = {
        haloTimeout: null,
        isAjaxLoading: false,

        ready: function (){
            this.loaderScript();
            this.loaderProductBlock();

            if($body.hasClass('template-product')) {
                this.loaderRecommendationsBlock();
            }
        },

		init: function () {
            this.productBlockInfiniteScroll();
            this.initGlobalCheckbox();
            this.initColorSwatch();
            this.initAddToCart();
            this.initQuickShop();
            this.initQuickCart();
			this.initBeforeYouLeave();
            this.initNotifyInStock();
            this.initCompareProduct();
            this.initQuickView();
            this.initWishlist();
            this.initAskAnExpert();

            if($body.hasClass('template-page')) {
                // this.initWishlistPage();
            }

            if($body.hasClass('template-product')) {
                this.initProductView($('.halo-productView'));
            }
		},

        loaderScript: function() {
            var load = function(){
                var script = $('[data-loader-script]');

                if (script.length > 0) {
                    script.each((index, element) => {
                        var $this = $(element),
                            link = $this.data('loader-script'),
                            top = element.getBoundingClientRect().top;

                        if (!$this.hasClass('is-load')){
                            if (top < window.innerHeight + 100) {
                                halo.buildScript(link);
                                $('[data-loader-script="' + link + '"]').addClass('is-load');
                            }
                        }
                    })
                }
            }
            
            window.addEventListener('load', () => {
                load();
                window.addEventListener('scroll', load);
            });
        },

        buildScript: function(name) {
            var loadScript = document.createElement("script");
            loadScript.src = name;
            document.body.appendChild(loadScript);
        },

        loaderProductBlock: function() {
            halo.buildProductBlock();
        },

        buildProductBlock: function() {
            var isAjaxLoading = false;

            $doc.ajaxStart(() => {
                isAjaxLoading = true;
            });

            $doc.ajaxStop(() => {
                isAjaxLoading = false;
            });

            var productBlock = $('[data-product-block]');

            var load = function() {
                productBlock.each((index, element) => {
                    var top = element.getBoundingClientRect().top,
                        $block = $(element);

                    if (!$block.hasClass('ajax-loaded')) {
                        if (top < window.innerHeight && top < 400) {
                            var url = $block.data('collection'),
                                layout = $block.data('layout'),
                                limit = $block.data('limit'),
                                image_ratio = $block.data('image-ratio'),
                                swipe = $block.data('swipe'),
                                sectionId = $block.attr('sectionId');

                            if(url != null && url != undefined) {
                                $.ajax({
                                    type: 'get',
                                    url: window.routes.root + '/collections/' + url,
                                    cache: false,
                                    data: {
                                        view: 'ajax_product_block',
                                        constraint: 'limit=' + limit + '+layout=' + layout + '+sectionId=' + sectionId + '+imageRatio=' + image_ratio + '+swipe=' + swipe
                                    },
                                    beforeSend: function () {
                                        $block.addClass('ajax-loaded');
                                    },
                                    success: function (data) {
                                        if (url != '') {
                                            if (layout == 'grid') {
                                                $block.find('.products-grid').html(data);
                                            } else if (layout == 'slider'){
                                                $block.find('.products-carousel').html(data);
                                            }
                                        }
                                    },
                                    complete: function () {
                                        if (layout == 'slider') {
                                            halo.productBlockSilder($block);
                                        }

                                        if(window.compare.show){
                                            var $compareLink = $('a[data-compare-link]');

                                            halo.setLocalStorageProductForCompare($compareLink);
                                        }

                                        if(window.wishlist.show){
                                            halo.setLocalStorageProductForWishlist();
                                        }

                                        if (window.review.show && $('.shopify-product-reviews-badge').length > 0) {
                                            return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
                                        }
                                    }
                                });
                            } else {
                                $block.addClass('ajax-loaded');

                                if (layout == 'slider') {
                                    halo.productBlockSilder($block);
                                }
                            }
                        }
                    }
                });
            }

            window.addEventListener('load', () => {
                load();
                window.addEventListener('scroll', load);
            });
        },

        loaderRecommendationsBlock: function(){
            halo.buildRecommendationBlock();
        },

        productBlockSilder: function(wrapper) {
            var productGrid = wrapper.find('.products-carousel'),
                itemToShow = productGrid.data('item-to-show'),
                itemDots = productGrid.data('item-dots'),
                itemArrows = productGrid.data('item-arrows');

            if(productGrid.length > 0) {
                if(productGrid.not('.slick-initialized')) {
                    productGrid.slick({
                        mobileFirst: true,
                        adaptiveHeight: true,
                        vertical: false,
                        infinite: false,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        arrows: false,
                        dots: true,
                        nextArrow: '<button type="button" class="slick-arrow slick-next"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 7.75 1.34375 L 6.25 2.65625 L 14.65625 12 L 6.25 21.34375 L 7.75 22.65625 L 16.75 12.65625 L 17.34375 12 L 16.75 11.34375 Z"/></svg></button>',
                        prevArrow: '<button type="button" class="slick-arrow slick-prev"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 7.75 1.34375 L 6.25 2.65625 L 14.65625 12 L 6.25 21.34375 L 7.75 22.65625 L 16.75 12.65625 L 17.34375 12 L 16.75 11.34375 Z"/></svg></button>',
                        responsive: 
                        [
                            {
                                breakpoint: 1599,
                                settings: {
                                    arrows: itemArrows,
                                    dots: itemDots,
                                    get slidesToShow() {
                                        if(itemToShow !== undefined && itemToShow !== null && itemToShow !== ''){
                                            return this.slidesToShow = itemToShow;
                                        } else {
                                            return this.slidesToShow = 1;
                                        }
                                    }
                                }
                            },
                            {
                                breakpoint: 1024,
                                settings: {
                                    arrows: itemArrows,
                                    dots: itemDots,
                                    get slidesToShow() {
                                        if(itemToShow !== undefined && itemToShow !== null && itemToShow !== ''){
                                            if(itemToShow == 5){
                                                return this.slidesToShow = itemToShow - 1;
                                            } else {
                                                return this.slidesToShow = itemToShow;
                                            }
                                        } else {
                                            return this.slidesToShow = 1;
                                        }
                                    }
                                }
                            },
                            {
                                breakpoint: 991,
                                settings: {
                                    slidesToShow: 4,
                                    slidesToScroll: 1
                                }
                            },
                            {
                                breakpoint: 767,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 1
                                }
                            },
                            {
                                breakpoint: 320,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 1
                                }
                            }
                        ]
                    });

                    if (!wrapper.hasClass('ajax-loaded')) {

                    }
                }
            }
        },

        productBlockInfiniteScroll: function() {
            var productBlock = $('[data-product-block]');

            productBlock.each((index, element) => {
                var $block = $(element),
                    showMore = $block.find('[data-product-infinite]');
            
                if (showMore.length > 0) {
                    showMore.find('.button').on('click', (event) => {
                        var showMoreButton = $(event.target);

                        if (!showMoreButton.hasClass('view-all')) {
                            event.preventDefault();
                            event.stopPropagation();

                            var text = window.button_load_more.loading;

                            showMoreButton.addClass('is-loading');
                            showMoreButton.text(text);

                            var url = showMoreButton.attr('data-collection'),
                                limit = showMoreButton.attr('data-limit'),
                                swipe = showMoreButton.attr('data-swipe'),
                                total = showMoreButton.attr('data-total'),
                                image_ratio = showMoreButton.attr('data-image-ratio'),
                                sectionId = showMoreButton.attr('sectionId'),
                                page = parseInt(showMoreButton.attr('data-page'));

                            halo.doProductBlockInfiniteScroll(url, total, limit, swipe, image_ratio, sectionId, page, showMoreButton, $block);
                        }
                    });
                }
            });
        },

        doProductBlockInfiniteScroll: function(url, total, limit, swipe, image_ratio, sectionId, page, showMoreButton, $block){
            $.ajax({
                type: 'get',
                url: window.routes.root + '/collections/' + url,
                cache: false,
                data: {
                    view: 'ajax_product_block_load_more',
                    constraint: 'limit=' + limit + '+page=' + page + '+sectionId=' + sectionId + '+imageRatio=' + image_ratio + '+swipe=' + swipe
                },
                beforeSend: function () {
                    // halo.showLoading();
                },
                success: function (data) {
                    $block.find('.products-grid').append(data);

                    var length = $block.find('.products-grid .product').length;

                    if($(data).length == limit && length < 50){
                        var text = window.button_load_more.default;

                        showMoreButton.removeClass('is-loading');
                        showMoreButton.attr('data-page', page + 1);
                        showMoreButton.text(text);
                    } else {
                        if (total > 50) {
                            var text = window.button_load_more.view_all;

                            showMoreButton.text(text);
                            showMoreButton.removeClass('is-loading');
                            showMoreButton.attr('href', window.routes.root + '/collections/' + url).addClass('view-all');
                        } else {
                            var text = window.button_load_more.no_more;

                            showMoreButton.text(text);
                            showMoreButton.removeClass('is-loading');
                            showMoreButton.attr('disabled', 'disabled');
                        }
                    }
                },
                complete: function () {
                    // halo.hideLoading();
                }
            });
        },

        buildRecommendationBlock: function(){
            var $this = document.querySelector('[data-recommendations-block]'),
                layout = $this.dataset.layout;
                swipe = $this.dataset.swipe;

            const handleIntersection = (entries, observer) => {
                if (!entries[0].isIntersecting) return;

                fetch($this.dataset.url)
                .then(response => response.text())
                .then(text => {
                    const html = document.createElement('div');
                    html.innerHTML = text;
                    const recommendations = html.querySelector('[data-recommendations-block]');
                    if (recommendations && recommendations.innerHTML.trim().length) {
                        $this.innerHTML = recommendations.innerHTML;

                        if (layout == 'slider') {
                            halo.productBlockSilder($($this));
                        } else {
                            if(swipe == true){
                                console.log("ok");
                            }
                        }


                        if(window.compare.show){
                            var $compareLink = $('a[data-compare-link]');

                            halo.setLocalStorageProductForCompare($compareLink);
                        }

                        if(window.wishlist.show){
                            halo.setLocalStorageProductForWishlist();
                        }

                        if (window.review.show && $('.shopify-product-reviews-badge').length > 0) {
                            return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
                        }
                    }
                })
                .catch(e => {
                    console.error(e);
                });
            }

            new IntersectionObserver(handleIntersection.bind($this), {}).observe($this);
        },

        initGlobalCheckbox: function() {
            $doc.on('change', '.global-checkbox--input', (event) => {
                var targetId = event.target.getAttribute('data-target');

                if(event.target.checked){
                    $(targetId).attr('disabled', false);
                } else{
                    $(targetId).attr('disabled', true);
                }
            });
        },

        initColorSwatch: function() {
            $('.card .swatch-label.is-active').trigger('click');

            $doc.on('click', '.card .swatch-label', (event) => {
                var $target = $(event.currentTarget),
                    title = $target.attr('title').replace(/^\s+|\s+$/g, ''),
                    product = $target.closest('.product-item'),
                    productJson = product.data('json-product'),
                    productTitle = product.find('.card-title'),
                    productAction = product.find('[data-btn-addtocart]'),
                    variantId = $target.data('variant-id'),
                    productHref = product.find('a').attr('href'),
                    oneOption = $target.data('with-one-option'),
                    newImage = $target.data('variant-img'),
                    mediaList = []; 

                $target.parents('.swatch').find('.swatch-label').removeClass('is-active');
                $target.addClass('is-active');

                if(productTitle.hasClass('card-title-change')){
                    productTitle.find('[data-change-title]').text(' - ' + title);
                } else {
                    productTitle.addClass('card-title-change').append('<span data-change-title> - ' + title + '</span>');
                }

                product.find('a:not(.single-action)').attr('href', productHref.split('?variant=')[0]+'?variant='+ variantId);

                if (oneOption != undefined) {
                    var quantity = $target.data('quantity');

                    product.find('[name="id"]').val(oneOption);

                    if (quantity > 0) {
                        if(window.notify_me.show){
                            productAction
                                .removeClass('is-notify-me')
                                .addClass('is-visible');
                        } else {
                            productAction
                                .removeClass('is-soldout')
                                .addClass('is-visible');
                        }
                    } else {
                       if(window.notify_me.show){
                            productAction
                                .removeClass('is-visible')
                                .addClass('is-notify-me');
                        } else {
                            productAction
                                .removeClass('is-visible')
                                .addClass('is-soldout');
                        }
                    }

                    if(productAction.hasClass('is-soldout') || productAction.hasClass('is-notify-me')){
                        if(productAction.hasClass('is-notify-me')){
                            productAction.text(window.notify_me.button);
                        } else {
                            productAction
                                .text(window.variantStrings.soldOut)
                                .prop('disabled', true);
                        }
                    } else {
                        productAction
                            .text(window.variantStrings.addToCart)
                            .prop('disabled', false);
                    }
                } else {
                    if (productJson != undefined) {
                        if(window.quick_shop.show){
                            halo.checkStatusSwatchQuickShop(product, productJson);
                        }
                    }

                    product.find('.swatch-element[data-value="' + title + '"]').find('.single-label').trigger('click');
                }

                if (productJson != undefined) {
                    var mediaList = productJson.media.filter((index, element) => {
                        return element.alt === title;
                    });
                }

                if (mediaList.length > 0) {
                    if (mediaList.length > 1) {
                        var length = 2;
                    } else {
                        var length = mediaList.length;
                    }

                    for (var i = 0; i < length; i++) {
                        product.find('.card-media img:eq('+ i +')').attr('srcset', mediaList[i].src);
                    }
                } else {
                    if (newImage) {
                        product.find('.card-media img:nth-child(1)').attr('srcset', newImage);
                    }
                }
            });

            if(window.product_swatch_style == 'slider'){
                
            }
        },

        initQuickShop: function() {
            if(window.quick_shop.show) {
                $doc.on('click', '[data-quickshop-popup]', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    var $target = $(event.target),
                        product = $target.parents('.product-item'),
                        productJson = product.data('json-product'),
                        variantPopup = product.find('.variants-popup');

                    if(!product.hasClass('quickshop-popup-show')){
                        $('.product-item').removeClass('quickshop-popup-show');

                        product.addClass('quickshop-popup-show');
                        product.find('.swatch-label.is-active').trigger('click');

                        halo.checkStatusSwatchQuickShop(product, productJson);

                        variantPopup.find('.selector-wrapper:not(.option-color)').each((index, element) => {
                            $(element).find('.swatch-element:not(.soldout):not(.unavailable)').eq('0').find('.single-label').trigger('click');
                        });
                    } else {
                        halo.initAddToCartQuickShop($target, variantPopup);
                    }
                });

                $doc.on('click', '[data-cancel-quickshop-popup]', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    var $target = $(event.currentTarget),
                        product = $target.parents('.product-item');

                    product.removeClass('quickshop-popup-show');
                });

                $doc.on('click', (event) => {
                    if ($(event.target).closest('[data-quickshop-popup]').length === 0 && $(event.target).closest('.variants-popup').length === 0 && $(event.target).closest('.card-swatch').length === 0){
                        $('.product-item').removeClass('quickshop-popup-show');
                    }
                });

                halo.changeSwatchQuickShop();
            }
        },

        changeSwatchQuickShop: function () {
            $doc.on('change', '[data-quickshop] .single-option', (event) => {
                var $target = $(event.target),
                    product = $target.parents('.product-item'),
                    productJson = product.data('json-product'),
                    variantList,
                    optionColor = product.find('.option-color').data('option-position'),
                    optionIndex = $target.closest('[data-option-index]').data('option-index'),
                    swatch = product.find('.swatch-element'),
                    thisVal = $target.val(),
                    selectedVariant,
                    productInput = product.find('[name=id]'),
                    selectedOption1 = product.find('.selector-wrapper-1').find('input:checked').val(),
                    selectedOption2 = product.find('.selector-wrapper-2').find('input:checked').val(),
                    selectedOption3 = product.find('.selector-wrapper-3').find('input:checked').val();

                if (productJson != undefined) {
                    variantList = productJson.variants;
                }

                swatch.removeClass('soldout');
                swatch.find('input[type="radio"]').prop('disabled', false);

                switch (optionIndex) {
                    case 0:
                        var availableVariants = variantList.find((variant) => {
                            if (optionColor == 1) {
                                return variant.option2 == thisVal && variant.option1 == selectedOption2;
                            } else {
                                if (optionColor == 2) {
                                    return variant.option3 == thisVal && variant.option1 == selectedOption2;
                                } else {
                                    return variant.option1 == thisVal && variant.option2 == selectedOption2;
                                }
                            }
                        });

                        if(availableVariants != undefined){
                            selectedVariant =  availableVariants;
                        } else{
                            var altAvailableVariants = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == thisVal;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == thisVal;
                                    } else {
                                        return variant.option1 == thisVal;
                                    }
                                }
                            });

                            selectedVariant =  altAvailableVariants;
                        }

                        break;
                    case 1:
                        var availableVariants = variantList.find((variant) => {
                            if (optionColor == 1) {
                                return variant.option2 == selectedOption1 && variant.option1 == thisVal && variant.option3 == selectedOption2;
                            } else {
                                if (optionColor == 2) {
                                    return variant.option3 == selectedOption1 && variant.option1 == thisVal && variant.option2 == selectedOption2;
                                } else {
                                    return variant.option1 == selectedOption1 && variant.option2 == thisVal && variant.option3 == selectedOption2;
                                }
                            }
                        });

                        if(availableVariants != undefined){
                            selectedVariant =  availableVariants;
                        } else {
                            var altAvailableVariants = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == selectedOption1 && variant.option1 == thisVal;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == selectedOption1 && variant.option1 == thisVal;
                                    } else {
                                        return variant.option1 == selectedOption1 && variant.option2 == thisVal;
                                    }
                                }
                            });

                            selectedVariant =  altAvailableVariants;
                        }

                        break;
                    case 2:
                        var availableVariants = variantList.find((variant) => {
                            if (optionColor == 1) {
                                return variant.option2 == selectedOption1 && variant.option1 == selectedOption2 && variant.option3 == thisVal;
                            } else {
                                if (optionColor == 2) {
                                    return variant.option3 == selectedOption1 && variant.option1 == selectedOption2 && variant.option2 == thisVal;
                                } else {
                                    return variant.option1 == selectedOption1 && variant.option2 == selectedOption2 && variant.option3 == thisVal;
                                }
                            }
                        });

                        if(availableVariants != undefined){
                            selectedVariant =  availableVariants;
                        }

                        break;
                }

                if (selectedVariant == undefined) {
                    return;
                }

                productInput.val(selectedVariant.id);

                halo.checkStatusSwatchQuickShop(product, productJson);
            });
        },

        checkStatusSwatchQuickShop: function(product, productJson){
            var variantPopup = product.find('.card-variant'),
                variantList,
                productOption = product.find('[data-option-index]'),
                optionColor = product.find('.option-color').data('option-position'),
                selectedOption1 = product.find('[data-option-index="0"]').find('input:checked').val(),
                selectedOption2 = product.find('[data-option-index="1"]').find('input:checked').val(),
                selectedOption3 = product.find('[data-option-index="2"]').find('input:checked').val();

            if (productJson != undefined) {
                variantList = productJson.variants;
            }

            productOption.each((index, element) => {
                var optionIndex = $(element).data('option-index'),
                    swatch = $(element).find('.swatch-element');

                switch (optionIndex) {
                    case 0:
                        swatch.each((idx, elt) => {
                            var item = $(elt),
                                swatchVal = item.data('value');

                            var optionSoldout = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == swatchVal && variant.available;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == swatchVal && variant.available;
                                    } else {
                                        return variant.option1 == swatchVal && variant.available;
                                    }
                                }
                            });

                            var optionUnavailable = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == swatchVal;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == swatchVal;
                                    } else {
                                        return variant.option1 == swatchVal;
                                    }
                                }
                            });

                            if(optionSoldout == undefined){
                                if (optionUnavailable == undefined) {
                                    item.removeClass('soldout available').addClass('unavailable');
                                    item.find('input[type="radio"]').prop('checked', false);
                                } else {
                                    item
                                        .removeClass('unavailable available')
                                        .addClass('soldout')
                                        .find('.single-action')
                                        .attr('data-variant-id', optionUnavailable.title);
                                    item.find('input[type="radio"]').prop('disabled', false);
                                }
                            } else {
                                item.removeClass('soldout unavailable').addClass('available');
                                item.find('input[type="radio"]').prop('disabled', false);
                            }
                        });

                        break;
                    case 1:
                        swatch.each((idx, elt) => {
                            var item = $(elt),
                                swatchVal = item.data('value');

                            var optionSoldout = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == selectedOption1 && variant.option1 == swatchVal && variant.available;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == selectedOption1 && variant.option1 == swatchVal && variant.available;
                                    } else {
                                        return variant.option1 == selectedOption1 && variant.option2 == swatchVal && variant.available;
                                    }
                                }
                            });

                            var optionUnavailable = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == selectedOption1 && variant.option1 == swatchVal;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == selectedOption1 && variant.option1 == swatchVal;
                                    } else {
                                        return variant.option1 == selectedOption1 && variant.option2 == swatchVal;
                                    }
                                }
                            });

                            if(optionSoldout == undefined){
                                if (optionUnavailable == undefined) {
                                    item.removeClass('soldout available').addClass('unavailable');
                                    item.find('input[type="radio"]').prop('checked', false);
                                } else {
                                    item
                                        .removeClass('unavailable available')
                                        .addClass('soldout')
                                        .find('.single-action-selector')
                                        .attr('data-variant-id', optionUnavailable.title);
                                    item.find('input[type="radio"]').prop('disabled', false);
                                }
                            } else {
                                item.removeClass('soldout unavailable').addClass('available');
                                item.find('input[type="radio"]').prop('disabled', false);
                            }
                        });

                        break;
                    case 2:
                        swatch.each((idx, elt) => {
                            var item = $(elt),
                                swatchVal = item.data('value');

                            var optionSoldout = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == selectedOption1 && variant.option1 == selectedOption2 && variant.option3 == swatchVal && variant.available;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == selectedOption1 && variant.option1 == selectedOption2 && variant.option2 == swatchVal && variant.available;
                                    } else {
                                        return variant.option1 == selectedOption1 && variant.option2 == selectedOption2 && variant.option3 == swatchVal && variant.available;
                                    }
                                }
                            });

                            var optionUnavailable = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == selectedOption1 && variant.option1 == selectedOption2 && variant.option3 == swatchVal;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == selectedOption1 && variant.option1 == selectedOption2 && variant.option2 == swatchVal;
                                    } else {
                                        return variant.option1 == selectedOption1 && variant.option2 == selectedOption2 && variant.option3 == swatchVal;
                                    }
                                }
                            });

                            if(optionSoldout == undefined){
                                if (optionUnavailable == undefined) {
                                    item.removeClass('soldout available').addClass('unavailable');
                                    item.find('input[type="radio"]').prop('checked', false);
                                } else {
                                    item
                                        .removeClass('unavailable available')
                                        .addClass('soldout')
                                        .find('.single-action-selector')
                                        .attr('data-variant-id', optionUnavailable.title);
                                    item.find('input[type="radio"]').prop('disabled', false);
                                }
                            } else {
                                item.removeClass('unavailable soldout').addClass('available');
                                item.find('input[type="radio"]').prop('disabled', false);
                            }
                        });

                        break;
                }
            });

            variantPopup.find('.selector-wrapper:not(.option-color)').each((index, element) => {
                var item = $(element);

                if (item.find('.swatch-element').find('input:checked').length < 1) {
                    if (item.find('.swatch-element.available').length > 0) {
                        item.find('.swatch-element.available').eq('0').find('.single-label').trigger('click');
                    } else {
                        item.find('.swatch-element.soldout').eq('0').find('.single-label').trigger('click');
                    }
                }
            });
        },

        initAddToCartQuickShop: function($target, popup){
            var variantId = popup.find('[name="id"]').val(),
                qty = 1;

            halo.actionAddToCart($target, variantId, qty);
        },

        initAddToCart: function() {
            $doc.on('click', '[data-btn-addtocart]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.target);

                if(!$target.hasClass('is-notify-me') && !$target.hasClass('is-soldout')){
                    var form = $target.parents('form'),
                        variantId = form.find('[name="id"]').val(),
                        qty = form.find('[name="quantity"]').val();

                    if(qty == undefined){
                        qty = 1;
                    }

                    halo.actionAddToCart($target, variantId, qty);
                } else if($target.hasClass('is-notify-me')){
                    halo.notifyInStockPopup($target);
                }
            });

            $doc.on('click', '[data-close-add-to-cart-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.removeClass('add-to-cart-show');
            });

            $doc.on('click', '[data-close-upsell-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.removeClass('cart-upsell-show');
            });

            $doc.on('click', (event) => {
                if($body.hasClass('add-to-cart-show')){
                    if (($(event.target).closest('[data-add-to-cart-popup]').length === 0)) {
                        $body.removeClass('add-to-cart-show');
                    }
                }

                if($body.hasClass('cart-upsell-show')){
                    if (($(event.target).closest('[data-upsell-popup]').length === 0) && ($(event.target).closest('[data-edit-cart-popup]').length === 0)){
                        $body.removeClass('cart-upsell-show');
                    }
                }
            });
        },

        actionAddToCart: function($target, variantId, qty){
            var originalMessage = window.variantStrings.addToCart,
                waitMessage = window.variantStrings.addingToCart,
                successMessage = window.variantStrings.addedToCart;

            if($target.hasClass('button-text-change')){
                originalMessage = $target.text();
            }

            $target
                .text(waitMessage)
                .addClass('is-loading');

            if($body.hasClass('quick-view-show')){
                Shopify.addItem(variantId, qty, () => {
                    $target.text(successMessage);

                    if (window.after_add_to_cart.type == 'cart') {
                        halo.redirectTo(window.routes.cart);
                    } else {
                        Shopify.getCart((cartTotal) => {
                            $body.find('[data-cart-count]').text(cartTotal.item_count);
                            $target
                                .text(originalMessage)
                                .removeClass('is-loading');
                        });
                    }
                });
            } else {
                Shopify.addItem(variantId, qty, () => {
                    $target.text(successMessage);

                    switch (window.after_add_to_cart.type) {
                        case 'cart':
                            halo.redirectTo(window.routes.cart);

                            break;
                        case 'quick_cart':
                            if(window.quick_cart.show){
                                Shopify.getCart((cart) => {
                                    if( window.quick_cart.type == 'popup'){
                                        // $body.addClass('cart-modal-show');
                                        // halo.updateDropdownCart(cart);
                                    } else {
                                        $body.addClass('cart-sidebar-show');
                                        halo.updateSidebarCart(cart);
                                    }

                                    $target
                                        .text(originalMessage)
                                        .removeClass('is-loading');
                                });
                            } else {
                                halo.redirectTo(window.routes.cart);
                            }

                            break;
                        case 'popup_cart_1':
                            Shopify.getCart((cart) => {
                                halo.updatePopupCart(cart, 1);
                                $body.addClass('add-to-cart-show');

                                $target
                                    .text(originalMessage)
                                    .removeClass('is-loading');
                            });

                            break;
                        case 'popup_cart_2':
                            Shopify.getCart((cart) => {
                                halo.updatePopupCart(cart, 2);

                                $target
                                    .text(originalMessage)
                                    .removeClass('is-loading');
                            });

                            break;
                    }
                });
            }
        },

        isRunningInIframe: function() {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        },

        redirectTo: function(url){
            if (halo.isRunningInIframe() && !window.iframeSdk) {
                window.top.location = url;
            } else {
                window.location = url;
            }
        },

		initBeforeYouLeave: function() {
            var $beforeYouLeave = $('#halo-leave-sidebar'),
                time = $beforeYouLeave.data('time'),
                idleTime = 0;

            if (!$beforeYouLeave.length) {
                return;
            } else{
                var slickInterval = setInterval(() => {
                    timerIncrement();
                }, time);

                $body.on('mousemove keydown scroll', () => {
                    resetTimer();
                });
            }

            $body.on('click', '[data-close-before-you-leave]', (event) => {
                event.preventDefault();

                $body.removeClass('before-you-leave-show');
            });

            $body.on('click', (event) => {
                if ($body.hasClass('before-you-leave-show')) {
                    if ($(event.target).closest('#halo-leave-sidebar').length === 0){
                        $body.removeClass('before-you-leave-show');
                    }
                }
            });

            function timerIncrement() {
                idleTime = idleTime + 1;

                if (idleTime >= 1 && !$body.hasClass('before-you-leave-show')) {
                    if($beforeYouLeave.find('.products-carousel').length > 0){
                        var slider = $beforeYouLeave.find('.products-carousel');

                        productsCarousel(slider);
                    }

                    $body.addClass('before-you-leave-show');
                }
            }

            function resetTimer() {
                idleTime = -1;
            }

            function productsCarousel(slider){
                if(!slider.hasClass('slick-slider')) {
                    slider.slick({
                        dots: true,
                        arrows: true,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        slidesPerRow: 1,
                        rows: 3,
                        infinite: false,
                        nextArrow: '<button type="button" class="slick-arrow slick-arrow--bottom slick-next"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 18 8 L 18 11 L 0 11 L 0 13 L 18 13 L 18 16 L 23.599609 12 L 18 8 z"/></svg></button>', 
                        prevArrow: '<button type="button" class="slick-arrow slick-arrow--bottom slick-prev"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 18 8 L 18 11 L 0 11 L 0 13 L 18 13 L 18 16 L 23.599609 12 L 18 8 z"/></svg></button>'
                    });
                }
            }
        },

        initQuickCart: function() {
            if(window.quick_cart.show){
                if(window.quick_cart.type == 'popup'){
                    // halo.initDropdownCart();
                } else {
                    halo.initSidebarCart();
                }
            }

            halo.initEventQuickCart();
        },

        initEventQuickCart: function(){
            halo.removeItemQuickCart();
            halo.updateQuantityItemQuickCart();
            halo.editQuickCart();
        },

        initFreeShippingMessage: function () {
            $.getJSON('/cart.js', (cart) => {
                halo.freeShippingMessage(cart);
            });
        },

        freeShippingMessage: function(cart){
            var freeshipEligible = 0,
                $wrapper = $('.haloCalculatorShipping'),
                $progress = $('[data-shipping-progress]'),
                $message = $('[data-shipping-message]');

            var freeshipText = window.free_shipping_text.free_shipping_message,
                freeshipText1 = window.free_shipping_text.free_shipping_message_1,
                freeshipText2 = window.free_shipping_text.free_shipping_message_2,
                freeshipText3 = window.free_shipping_text.free_shipping_message_3,
                freeshipText4 = window.free_shipping_text.free_shipping_message_4,
                extraPrice = 0,
                shipVal = window.free_shipping_text.free_shipping_1,
                classLabel1 = 'progress-30',
                classLabel2 = 'progress-60',
                classLabel3 = 'progress-100',
                freeshipPrice = parseInt(window.free_shipping_price);

            var cartTotalPrice =  parseInt(cart.total_price)/100,
                freeshipBar = Math.round((cartTotalPrice * 100)/freeshipPrice);

            if(cartTotalPrice == 0) {
                freeshipText =  '<span>' + freeshipText + ' ' + Shopify.formatMoney(freeshipPrice * 100, window.money_format) +'!</span>';
            } else if (cartTotalPrice >= freeshipPrice) {
                freeshipEligible = 1;
                freeshipText = freeshipText1;
            } else {
                extraPrice = parseInt(freeshipPrice - cartTotalPrice);
                freeshipText = '<span>' + freeshipText2 + ' </span>' + Shopify.formatMoney(extraPrice * 100, window.money_format) + '<span>' + freeshipText3 + ' </span><span class="text">' + freeshipText4 + '</span>';
                shipVal = window.free_shipping_text.free_shipping_2;
            }

            if(freeshipBar >= 100 ){
                freeshipBar = 100;
            }

            var classLabel = 'progress-free';

            if(freeshipBar == 0){
                classLabel = 'none';
            } else if(freeshipBar <= 30 ) {
                classLabel = classLabel1;
            } else if(freeshipBar <= 60) {
                classLabel = classLabel2;
            } else if(freeshipBar < 100){
                classLabel = classLabel3;
            }

            if(!$wrapper.hasClass('style-3')){
                var progress = '<div class="progress_shipping" role="progressbar">\
                                    <div class="progress-meter" style="width: '+ freeshipBar +'%;"></div>\
                                </div>';
            } else {
                var progress = '<div class="progress_shipping" role="progressbar">\
                                    <div class="progress-meter" style="width: '+ freeshipBar +'%;">'+ freeshipBar +'%</div>\
                                </div>';
            }

            setTimeout(() => {
                $wrapper.removeClass('animated-loading');
                $progress.addClass(classLabel).html(progress);
                $message.addClass(classLabel).html(freeshipText);
            }, 200);
        },

        productCollectionCartSlider: function(){
            var productCart = $('[data-product-collection-cart]');

            productCart.each((index, element) => {
                var self = $(element),
                    productGrid = self.find('.products-carousel'),
                    itemDots = productGrid.data('item-dots'),
                    itemArrows = productGrid.data('item-arrows');

                if(productGrid.length > 0){
                    if(!productGrid.hasClass('slick-initialized')){
                        productGrid.slick({
                            mobileFirst: true,
                            adaptiveHeight: false,
                            infinite: false,
                            vertical: false,
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            dots: true,
                            arrows: false,
                            nextArrow: '<button type="button" class="slick-arrow slick-next"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 7.75 1.34375 L 6.25 2.65625 L 14.65625 12 L 6.25 21.34375 L 7.75 22.65625 L 16.75 12.65625 L 17.34375 12 L 16.75 11.34375 Z"/></svg></button>',
                            prevArrow: '<button type="button" class="slick-arrow slick-prev"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 7.75 1.34375 L 6.25 2.65625 L 14.65625 12 L 6.25 21.34375 L 7.75 22.65625 L 16.75 12.65625 L 17.34375 12 L 16.75 11.34375 Z"/></svg></button>',
                            responsive: [
                            {
                                breakpoint: 1025,
                                settings: {
                                    dots: itemDots,
                                    arrows: itemArrows
                                }
                            }]
                        });
                    }
                }
            });
        },

        updatePopupCart: function(cart, layout) {
            if(layout == 1){
                var item = cart.items[0],
                    popup = $('[data-add-to-cart-popup]'),
                    product = popup.find('.product-added'),
                    productTitle = product.find('.product-title'),
                    productImage = product.find('.product-image'),
                    title = item.product_title,
                    image = item.featured_image,
                    img = '<img src="'+ image.url +'" alt="'+ image.alt +'" title="'+ image.alt +'"/><svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="external-link" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-external-link fa-w-16 fa-3x"><path d="M440,256H424a8,8,0,0,0-8,8V464a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V112A16,16,0,0,1,48,96H248a8,8,0,0,0,8-8V72a8,8,0,0,0-8-8H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V264A8,8,0,0,0,440,256ZM500,0,364,.34a12,12,0,0,0-12,12v10a12,12,0,0,0,12,12L454,34l.7.71L131.51,357.86a12,12,0,0,0,0,17l5.66,5.66a12,12,0,0,0,17,0L477.29,57.34l.71.7-.34,90a12,12,0,0,0,12,12h10a12,12,0,0,0,12-12L512,12A12,12,0,0,0,500,0Z" class=""></path></svg>';

                productImage.attr('href', item.url).html(img);

                productTitle
                    .find('.title')
                    .attr('href', item.url)
                    .append(title);

                Shopify.getCart((cartTotal) => {
                    $body.find('[data-cart-count]').text(cartTotal.item_count);
                });
            } else {
                var popup = $('.halo-upsell-popup'),
                    popupContent = popup.find('.halo-popup-content');

                const $cartLoading = '<div class="loading-overlay loading-overlay--custom">\
                        <div class="loading-overlay__spinner">\
                            <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\
                                <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>\
                            </svg>\
                        </div>\
                    </div>';
                const loadingClass = 'is-loading';

                if(!$.isEmptyObject(cart)) {
                    if(cart.quantity > 0 || cart.item_count > 0) {
                        popupContent
                            .addClass(loadingClass)
                            .prepend($cartLoading);

                        $.ajax({
                            type: 'GET',
                            url: '/cart?view=ajax_upsell_cart',
                            cache: false,
                            success: function (data) {
                                var response = $(data);

                                popupContent
                                    .removeClass(loadingClass)
                                    .html(response);
                            },
                            error: function (xhr, text) {
                                alert($.parseJSON(xhr.responseText).description);
                            },
                            complete: function () {
                                $body.find('[data-cart-count]').text(cart.item_count);

                                if(cart.item_count == 0){
                                    $body.removeClass('cart-upsell-show');
                                } else{
                                    if(!$body.hasClass('cart-upsell-show')){
                                        $body.addClass('cart-upsell-show');
                                    }

                                    halo.initFreeShippingMessage();
                                }
                            }
                        });
                    } else {
                        $body.find('[data-cart-count]').text(cart.item_count);
                        $body.removeClass('cart-upsell-show');

                        halo.initFreeShippingMessage();
                    }
                }
            }
        },

        initSidebarCart: function() {
            var cartIcon = $('[data-cart-sidebar]');

            if ($body.hasClass('template-cart')) {
                cartIcon.on('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    $('html, body').animate({
                        scrollTop: 0
                    }, 700);
                });
            } else {
                cartIcon.on('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    Shopify.getCart((cart) => {
                        $body.addClass('cart-sidebar-show');
                        halo.updateSidebarCart(cart);
                    });
                });
            }

            $doc.on('click', '[data-close-cart-sidebar]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                if ($body.hasClass('cart-sidebar-show')) {
                    $body.removeClass('cart-sidebar-show');
                }
            });

            $doc.on('click', (event) => {
                if ($body.hasClass('cart-sidebar-show') && !$body.hasClass('edit-cart-show')) {
                    if (($(event.target).closest('#halo-cart-sidebar').length === 0) && ($(event.target).closest('[data-cart-sidebar]').length === 0) && ($(event.target).closest('[data-edit-cart-popup]').length === 0)){
                        $body.removeClass('cart-sidebar-show');
                    }
                }
            });
        },

        updateSidebarCart: function(cart) {
            if(!$.isEmptyObject(cart)){
                const $cartDropdown = $('#halo-cart-sidebar .halo-sidebar-wrapper');
                const $cartLoading = '<div class="loading-overlay loading-overlay--custom">\
                        <div class="loading-overlay__spinner">\
                            <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\
                                <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>\
                            </svg>\
                        </div>\
                    </div>';
                const loadingClass = 'is-loading';

                $cartDropdown
                    .addClass(loadingClass)
                    .prepend($cartLoading);

                $.ajax({
                    type: 'GET',
                    url: '/cart?view=ajax_side_cart',
                    cache: false,
                    success: function (data) {
                        var response = $(data);

                        $cartDropdown
                            .removeClass(loadingClass)
                            .html(response);
                    },
                    error: function (xhr, text) {
                        alert($.parseJSON(xhr.responseText).description);
                    },
                    complete: function () {
                        $body.find('[data-cart-count]').text(cart.item_count);
                        halo.productCollectionCartSlider();
                        halo.initFreeShippingMessage();
                    }
                });
            }
        },

        removeItemQuickCart: function () {
            $doc.on('click', '[data-cart-remove]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget),
                    productId = $target.attr('data-cart-remove-id');

                Shopify.removeItem(productId, (cart) => {
                    if($body.hasClass('template-cart')){
                        // halo.updateCart(cart);
                    } else if($body.hasClass('cart-modal-show')){
                        // halo.updateDropdownCart(cart);
                    } else if($body.hasClass('cart-sidebar-show')) {
                        halo.updateSidebarCart(cart);
                    } else if($body.hasClass('cart-upsell-show')){
                        halo.updatePopupCart(cart, 2);
                    }
                });
            });
        },

        updateQuantityItemQuickCart: function(){
            $doc.on('change', '[data-cart-quantity]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget),
                    productId = $target.attr('data-cart-quantity-id'),
                    quantity = parseInt($target.val()),
                    stock = parseInt($target.data('inventory-quantity'));

                if (stock < quantity && stock > 0) {
                    quantity = stock;
                }

                Shopify.changeItem(productId, quantity, (cart) => {
                    if($body.hasClass('template-cart')){
                        // halo.updateCart(cart);
                    } else if($body.hasClass('cart-modal-show')){
                        // halo.updateDropdownCart(cart);
                    } else if($body.hasClass('cart-sidebar-show')) {
                        halo.updateSidebarCart(cart);
                    } else if($body.hasClass('cart-upsell-show')){
                        halo.updatePopupCart(cart);
                    }
                });
            });
        },

        editQuickCart: function() {
            $doc.on('click', '[data-open-edit-cart]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget),
                    url = $target.data('edit-cart-url'),
                    itemId = $target.data('edit-cart-id'),
                    quantity = $target.data('edit-cart-quantity'),
                    option = $target.parents('.previewCartItem').find('previewCartItem-variant').text();

                const modal = $('[data-edit-cart-popup]'),
                    modalContent = modal.find('.halo-popup-content');

                $.ajax({
                    type: 'get',
                    url: url,
                    cache: false,
                    dataType: 'html',
                    beforeSend: function() {
                        if($body.hasClass('template-cart')){
                            // halo.showLoading();
                        }
                    },
                    success: function(data) {
                        modalContent.html(data);
                        modalContent.find('[data-template-cart-edit]').attr('data-cart-update-id', itemId);

                        var productItem = modalContent.find('.product-edit-item');
                        productItem.find('input[name="quantity"]').val(quantity);
                    },
                    error: function(xhr, text) {
                        alert($.parseJSON(xhr.responseText).description);

                        if($body.hasClass('template-cart')){
                            // halo.hideLoading();
                        }
                    },
                    complete: function () {
                        $body.addClass('edit-cart-show');

                        if($body.hasClass('template-cart')){
                            // halo.hideLoading();
                        }
                    }
                });
            });

            $doc.on('click', '[data-close-edit-cart]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.removeClass('edit-cart-show');
            });

            $doc.on('click', (event) => {
                if ($body.hasClass('edit-cart-show')) {
                    if (($(event.target).closest('[data-edit-cart-popup]').length === 0) && ($(event.target).closest('[data-open-edit-cart]').length === 0)){
                        $body.removeClass('edit-cart-show');
                    }
                }
            });

            halo.addMoreItemEditCart();
            halo.addAllItemCartEdit();
        },

        addMoreItemEditCart: function(){
            $doc.on('click', '[data-edit-cart-add-more]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var itemWrapper = $('[data-template-cart-edit]'),
                    currentItem = $(event.target).parents('.product-edit-item'),
                    count = parseInt(itemWrapper.attr('data-count')),
                    cloneProduct = currentItem.clone().removeClass('product-edit-itemFirst');
                    cloneProductId = cloneProduct.attr('id') + count;

                cloneProduct.attr('id', cloneProductId);

                halo.updateClonedProductAttributes(cloneProduct, count);

                cloneProduct.insertAfter(currentItem);

                count = count + 1;
                itemWrapper.attr('data-count', count);
            });

            $doc.on('click', '[data-edit-cart-remove]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var currentItem = $(event.target).parents('.product-edit-item');

                currentItem.remove();
            });
        },

        updateClonedProductAttributes: function(product, count){
            var form = $('.shopify-product-form', product),
                formId = form.attr('id'),
                newFormId = formId + count;

            form.attr('id', newFormId);

            $('.product-form__radio', product).each((index, element) => {
                var formInput = $(element),
                    formLabel = formInput.next(),
                    id = formLabel.attr('for'),
                    newId = id + count,
                    formInputName = formInput.attr('name');

                formLabel.attr('for', newId);

                formInput.attr({
                    id: newId,
                    name: formInputName + count
                });
            });
        },

        addAllItemCartEdit: function() {
            $doc.on('click', '#add-all-to-cart', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget),
                    cartEdit = $target.parents('.cart-edit'),
                    product = cartEdit.find('.product-edit-item.isChecked'),
                    productId = cartEdit.attr('data-cart-update-id');

                if(product.length > 0){
                    $target
                        .text(window.variantStrings.addingToCart)
                        .addClass('is-loading');

                    Shopify.removeItem(productId, (cart) => {
                        if(!$.isEmptyObject(cart)) {
                            var productHandleQueue = [];

                            var ajax_caller = function(data) {
                                return $.ajax(data);
                            }

                            product.each((index, element) => {
                                var item = $(element),
                                    variantId = item.find('input[name="id"]').val(),
                                    qty = parseInt(item.find('input[name="quantity"]').val());

                                productHandleQueue.push(ajax_caller({
                                    type: 'post',
                                    url: window.routes.root + '/cart/add.js',
                                    data: 'quantity=' + qty + '&id=' + variantId,
                                    dataType: 'json',
                                    async: false
                                }));
                            });

                            if(productHandleQueue.length > 0) {
                                $.when.apply($, productHandleQueue).done((event) => {
                                    $target
                                        .text(window.variantStrings.addToCart)
                                        .removeClass('is-loading');

                                    Shopify.getCart((cart) => {
                                        $body.removeClass('edit-cart-show');

                                        if($body.hasClass('template-cart')){
                                            // halo.updateCart(cart);
                                        } else if($body.hasClass('cart-modal-show')){
                                            // halo.updateDropdownCart(cart);
                                        } else if($body.hasClass('cart-sidebar-show')) {
                                            halo.updateSidebarCart(cart);
                                        } else if($body.hasClass('cart-upsell-show')){
                                            halo.updatePopupCart(cart, 2);
                                        }
                                    });
                                });
                            }
                        }
                    });
                } else {
                    alert(window.variantStrings.addToCart_message);
                }
            });
        },

        initNotifyInStock: function() {
            $doc.on('click', '[data-open-notify-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget);

                halo.notifyInStockPopup($target);
            });

            $doc.on('click', '[data-close-notify-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.removeClass('notify-me-show');
            });

            $doc.on('click', (event) => {
                if($body.hasClass('notify-me-show')){
                    if (($(event.target).closest('[data-open-notify-popup]').length === 0) && ($(event.target).closest('[data-notify-popup]').length === 0)){
                        $body.removeClass('notify-me-show');
                    }
                }
            });

            $doc.on('click', '[data-form-notify]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget);

                halo.notifyInStockAction($target);
            });
        },

        notifyInStockPopup: function($target){
            var variant,
                product = $target.parents('.product-item'),
                title = product.find('.card-title').data('product-title'),
                link = product.find('.card-title').data('product-url'),
                popup = $('[data-notify-popup]');

            if($target.hasClass('is-notify-me')){
                variant = product.find('.card-swatch .swatch-label.is-active').attr('title');
            } else {
                variant = $target.data('variant-id');
            }

            popup.find('[name="halo-notify-product-title"]').val($.trim(title));
            popup.find('[name="halo-notify-product-link"]').val(link);

            if(variant){
                popup.find('[name="halo-notify-product-variant"]').val(variant);
            }

            console.log(variant);

            $body.addClass('notify-me-show');
        },

        notifyInStockAction: function($target){
            var proceed = true,
                $notify = $target.parents('.halo-notifyMe'),
                $notifyForm = $notify.find('.notifyMe-form'),
                $notifyText = $notify.find('.notifyMe-text'),
                notifyMail = $notify.find('input[name="email"]').val(),
                email_reg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
                message;

            if (!email_reg.test(notifyMail) || (!notifyMail)){
                $notify
                    .find('.form-field')
                    .removeClass('form-field--success')
                    .addClass('form-field--error');

                proceed = false;
                message = '<div class="alertBox alertBox--error"><p class="alertBox-message">'+ window.notify_me.error +'</p></div>';

                $notifyText.html(message).show();
            } else {
                $notify
                    .find('.form-field')
                    .removeClass('form-field--error')
                    .addClass('form-field--success');

                $notifyText.html('').hide();
            }

            if (proceed) {
                var notifySite = $notify.find('[name="halo-notify-product-site"]').val(),
                    notifySiteUrl = $notify.find('[name="halo-notify-product-site-url"]').val(),
                    notifyToMail = window.notify_me.mail,
                    notifySubjectMail = window.notify_me.subject,
                    notifyLabelMail = window.notify_me.label,
                    productName = $notify.find('[name="halo-notify-product-title"]').val(),
                    productUrl = $notify.find('[name="halo-notify-product-link"]').val(),
                    productVariant = $notify.find('[name="halo-notify-product-variant"]').val();

                var content = '<div style="margin:30px auto;width:650px;border:10px solid #f7f7f7"><div style="border:1px solid #dedede">\
                        <h2 style="margin: 0; padding:20px 20px 20px;background:#f7f7f7;color:#555;font-size:2em;text-align:center;">'+ notifySubjectMail +'</h2>';

                content += '<table style="margin:0px 0 0;padding:30px 30px 30px;line-height:1.7em">\
                          <tr><td style="padding: 5px 25px 5px 0;"><strong>Product Name: </strong> ' + productName + '</td></tr>\
                          <tr><td style="padding: 5px 25px 5px 0;"><strong>Product URL: </strong> ' + productUrl + '</td></tr>\
                          <tr><td style="padding: 5px 25px 5px 0;"><strong>Email Request: </strong> ' + notifyMail + '</td></tr>\
                          '+ ((productVariant != '') ? '<tr><td style="padding: 5px 25px 5px 0;"><strong>Product Variant: </strong>' + productVariant + '</td></tr>' : '') +'\
                       </table>';

                content += '<a href="'+ notifySiteUrl +'" style="display:block;padding:30px 0;background:#484848;color:#fff;text-decoration:none;text-align:center;text-transform:uppercase">&nbsp;'+ notifySite +'&nbsp;</a>';
                content += '</div></div>';

                var notify_post_data = {
                    'api': 'i_send_mail',
                    'subject': notifySubjectMail,
                    'email': notifyToMail,
                    'from_name': notifyLabelMail,
                    'email_from': notifyMail,
                    'message': content
                };

                $.post('https://themevale.net/tools/sendmail/quotecart/sendmail.php', notify_post_data, (response) => {
                    if (response.type == 'error') {
                       message = '<div class="alertBox alertBox--error"><p class="alertBox-message">'+ response.text +'</p></div>';
                    } else {
                       message = '<div class="alertBox alertBox--success"><p class="alertBox-message">'+ window.notify_me.success +'</p></div>';
                       halo.resetForm($notifyForm);
                    }

                    $notifyText.html(message).show();
                }, 'json');
            }
        },

        initAskAnExpert: function(){
            $doc.on('click', '[data-open-ask-an-expert]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var askAnExpert = $('[data-ask-an-expert-popup]'),
                    modalContent = askAnExpert.find('.halo-popup-content'),
                    url;

                if($body.hasClass('template-product')){
                    var handle = $('.productView').data('product-handle');

                    url = window.routes.root + '/products/' + handle + '?view=ajax_ask_an_expert';
                } else {
                    url = window.routes.root + '/search?view=ajax_ask_an_expert';
                }

                $.ajax({
                    type: 'get',
                    url: url,
                    beforeSend: function () {
                        modalContent.empty();
                    },
                    success: function (data) {
                        modalContent.html(data);
                    },
                    error: function (xhr, text) {
                        alert($.parseJSON(xhr.responseText).description);
                    },
                    complete: function () {
                        if($body.hasClass('quick-view-show')){
                            $body.removeClass('quick-view-show');
                        }

                        $body.addClass('ask-an-expert-show');
                    }
                });
            });

            $doc.on('click', '#halo-ask-an-expert-button', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var self = $(event.currentTarget);

                halo.askAnExpertAction(self);
            });

            $doc.on('click', '[data-close-ask-an-expert]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.removeClass('ask-an-expert-show');
            });

            $doc.on('click', (event) => {
                if($body.hasClass('ask-an-expert-show')){
                    if (($(event.target).closest('[data-open-ask-an-expert]').length === 0) && ($(event.target).closest('#halo-ask-an-expert-popup').length === 0)){
                        $body.removeClass('ask-an-expert-show');
                    }
                }
            });
        },

        askAnExpertAction: function($target){
            var proceed = true,
                $askAnExpert = $target.parents('.halo-ask-an-expert'),
                $askAnExpertForm = $askAnExpert.find('.halo-ask-an-expert-form'),
                $askAnExpertMessage = $askAnExpert.find('.message'),
                askAnExpertMail = $askAnExpert.find('input[name="askAnExpertMail"]').val(),
                alertMessage,
                email_reg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

            $('input[required], textarea[required]', $askAnExpertForm).each((index, element) => {
                if (!$.trim($(element).val())) {
                    $(element)
                        .parent('.form-field')
                        .removeClass('form-field--success')
                        .addClass('form-field--error');

                    alertMessage = '<div class="alertBox alertBox--error"><p class="alertBox-message">'+ window.ask_an_expert.error_2 +'</p></div>';

                    $askAnExpertMessage.html(alertMessage).show();

                    proceed = false;
                } else {
                    $(element)
                        .parent('.form-field')
                        .removeClass('form-field--error')
                        .addClass('form-field--success');

                    $askAnExpertMessage.html('').hide();
                }

                if (($(element).attr("name") == 'askAnExpertMail') && (!email_reg.test(askAnExpertMail))){
                    $(element)
                        .parent('.form-field')
                        .removeClass('form-field--success')
                        .addClass('form-field--error');

                    alertMessage = '<div class="alertBox alertBox--error"><p class="alertBox-message">'+ window.ask_an_expert.error_1 +'</p></div>';
                    
                    $askAnExpertMessage.html(alertMessage).show();
                            
                    proceed = false;
                }
            });

            if (proceed) {
                var toMail = window.ask_an_expert.mail,
                    subjectMail =window.ask_an_expert.subject,
                    labelMail =window.ask_an_expert.label,
                    customerName = $askAnExpert.find('[name="askAnExpertName"]').val(),
                    customerMail = askAnExpertMail,
                    customerPhone = $askAnExpert.find('[name="askAnExpertPhone"]').val(),
                    typeRadio1 = $askAnExpert.find('input[name=askAnExpertRadioFirst]:checked').val(),
                    typeRadio2 = $askAnExpert.find('input[name=askAnExpertRadioSecond]:checked').val(),
                    customerMessage = $askAnExpert.find('[name="askAnExpertMessag"]').val();

                var message = "<div style='border: 1px solid #e6e6e6;padding: 30px;max-width: 500px;margin: 0 auto;'>\
                                    <h2 style='margin-top:0;margin-bottom:30px;color: #000000;'>"+ subjectMail +"</h2>\
                                    <p style='border-bottom: 1px solid #e6e6e6;padding-bottom: 23px;margin-bottom:25px;color: #000000;'>You received a new message from your online store's ask an expert form.</p>\
                                    <table style='width:100%;'>";

                if($askAnExpert.hasClass('has-product')){
                    var productName = $askAnExpert.find('[name="halo-product-title"]').val(),
                        productUrl = $askAnExpert.find('[name="halo-product-link"]').val(),
                        productImage = $askAnExpert.find('[name="halo-product-image"]').val();

                    message += "<tr>\
                                    <td style='border-bottom: 1px solid #e6e6e6;padding-bottom: 25px;margin-bottom:25px;width:50%;'>\
                                        <img style='width: 100px' src='"+ productImage +"' alt='"+ productName +"' title='"+ productName +"'>\
                                    </td>\
                                    <td style='border-bottom: 1px solid #e6e6e6;padding-bottom: 25px;margin-bottom:25px;'>\
                                        <a href='"+ productUrl +"'>"+ productName +"</a>\
                                    </td>\
                                </tr>";
                }

                message += "<tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>"+ window.ask_an_expert.customer_name +": </strong></td><td>" + customerName + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>"+ window.ask_an_expert.customer_mail +": </strong></td><td>" + customerMail + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>"+ window.ask_an_expert.customer_phone +": </strong></td><td>" + customerPhone + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>"+ window.ask_an_expert.type_radio1 +" </strong></td><td>"+ typeRadio1 +"</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>"+ window.ask_an_expert.type_radio2 +": </strong></td><td>"+ typeRadio2 +"</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>"+ window.ask_an_expert.customer_message +"? </strong></td><td>" + customerMessage + "</td></tr>\
                        </table></div>";

                var post_data = {
                    'api': 'i_send_mail',
                    'subject': subjectMail,
                    'email': toMail,
                    'from_name': labelMail,
                    'email_from': askAnExpertMail,
                    'message': message
                };

                $.post('https://themevale.net/tools/sendmail/quotecart/sendmail.php', post_data, (response) => {
                    if (response.type == 'error') {
                       alertMessage = '<div class="alertBox alertBox--error"><p class="alertBox-message">'+ response.text +'</p></div>';
                    } else {
                       alertMessage = '<div class="alertBox alertBox--success"><p class="alertBox-message">'+ window.ask_an_expert.success +'</p></div>';

                       halo.resetForm($askAnExpertForm);

                       $askAnExpertForm.hide();
                    }

                    $askAnExpertMessage.html(alertMessage).show();
                }, 'json');
            }
        },

        resetForm: function(form){
            $('.form-field', form).removeClass('form-field--success form-field--error');
            $('input[type=email], input[type=text], textarea', form).val('');
        },

        initCompareProduct: function() {
            var $compareLink = $('a[data-compare-link]');

            if(window.compare.show){
                halo.setLocalStorageProductForCompare($compareLink);
                halo.setAddorRemoveProductForCompare($compareLink);
                halo.setProductForCompare();

                $doc.on('click', '[data-close-compare-product-popup]', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    $body.removeClass('compare-product-show');
                });

                $doc.on('click', (event) => {
                    if($body.hasClass('compare-product-show')){
                        if (($(event.target).closest('[data-compare-link]').length === 0) && ($(event.target).closest('[data-compare-product-popup]').length === 0)){
                            $body.removeClass('compare-product-show');
                        }
                    }
                });
            }
        },

        setLocalStorageProductForCompare: function($link) {
            var count = JSON.parse(localStorage.getItem('compareItem')),
                items = $('[data-product-compare-handle]');

            if(count !== null){ 
                if(items.length > 0) {
                    items.each((index, element) => {
                        var item = $(element),
                            handle = item.data('product-compare-handle');

                        if(count.indexOf(handle) >= 0) {
                            item.find('.compare-icon').addClass('is-checked');
                            item.find('.text').text(window.compare.added);
                            item.find('input').prop('checked', true);
                        } else {
                            item.find('.compare-icon').removeClass('is-checked');
                            item.find('.text').text(window.compare.add);
                            item.find('input').prop('checked', false);
                        }
                    });

                    halo.updateCounterCompare($link);
                }
            }
        },

        setAddorRemoveProductForCompare: function($link) {
            $doc.on('change', '[data-product-compare] input', (event) => {
                var $this = $(event.currentTarget),
                    item = $this.parents('.card-compare'),
                    handle = $this.val(),
                    count = JSON.parse(localStorage.getItem('compareItem'));

                count = halo.uniqueArray(count);

                if(event.currentTarget.checked) {
                    item.find('.compare-icon').addClass('is-checked');
                    item.find('.text').text(window.compare.added);
                    item.find('input').prop('checked', true);
                    halo.incrementCounterCompare(count, handle, $link);
                } else {
                    item.find('.compare-icon').removeClass('is-checked');
                    item.find('.text').text(window.compare.add);
                    item.find('input').prop('checked', false);
                    halo.decrementCounterCompare(count, handle, $link);
                }
            });
        },

        setProductForCompare: function() {
            $doc.on('click', '[data-compare-link]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var count = JSON.parse(localStorage.getItem('compareItem'));

                if (count.length <= 1) {
                    alert(window.compare.message);

                    return false;
                } else {
                    halo.updateContentCompareProduct(count);
                }
            });

            $doc.on('click', '[data-compare-remove]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var id = $(event.currentTarget).data('compare-item'),
                    compareTable = $('[data-compare-product-popup] .compareTable'),
                    item = compareTable.find('.compareTable-row[data-product-compare-id="'+ id +'"]'),
                    handle = item.data('compare-product-handle');


                if(compareTable.find('tbody .compareTable-row').length <= 2){
                    alert(window.compare.message);
                } else {
                    item.remove();
                    
                    var count = JSON.parse(localStorage.getItem('compareItem')),
                        index = count.indexOf(handle),
                        $compareLink = $('a[data-compare-link]');

                    if (index > -1) {
                        count.splice(index, 1);
                        count = halo.uniqueArray(count);
                        localStorage.setItem('compareItem', JSON.stringify(count));

                        halo.setLocalStorageProductForCompare($compareLink);
                        halo.updateCounterCompare($compareLink);
                    }
                }
            });
        },

        updateCounterCompare: function($link) {
            var count = JSON.parse(localStorage.getItem('compareItem'));

            if (count.length > 1) {
                $link.parent().addClass('is-show');
                $link.find('span.countPill').html(count.length);
            } else {
                $link.parent().removeClass('is-show');
            }
        },

        uniqueArray: function(list) {
            var result = [];

            $.each(list, function(index, element) {
                if ($.inArray(element, result) == -1) {
                    result.push(element);
                }
            });

            return result;
        },

        incrementCounterCompare: function(count, item, $link){
            const index = count.indexOf(item);

            count.push(item);
            count = halo.uniqueArray(count);

            localStorage.setItem('compareItem', JSON.stringify(count));

            halo.updateCounterCompare($link);
        },

        decrementCounterCompare: function(count, item, $link){
            const index = count.indexOf(item);

            if (index > -1) {
                count.splice(index, 1);
                count = halo.uniqueArray(count);
                localStorage.setItem('compareItem', JSON.stringify(count));

                halo.updateCounterCompare($link);
            }
        },

        updateContentCompareProduct: function(list){
            var popup = $('[data-compare-product-popup]'),
                compareTable = popup.find('.compareTable');

            compareTable.find('tbody').empty();

            $.ajax({
                type: 'get',
                url: window.routes.root + '/collections/all',
                cache: false,
                data: {
                    view: 'ajax_product_card_compare',
                    constraint: `limit=${list.length}+sectionId=list-compare+list_handle=` + encodeURIComponent(list)
                },
                beforeSend: function () {},
                success: function (data) {
                    compareTable.find('tbody').append(data);
                },
                error: function (xhr, text) {
                    alert($.parseJSON(xhr.responseText).description);
                },
                complete: function () {
                    $body.addClass('compare-product-show');
                }
            });
        },

        initProductView: function($scope){
            halo.productImageGallery($scope);
            halo.productLastSoldOut($scope);
            halo.productCustomerViewing($scope);
            halo.productCountdown($scope);
            halo.productNextPrev($scope);
            halo.productSizeChart($scope);
        },

        initQuickView: function(){
            $doc.on('click', '[data-open-quick-view-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var handle = $(event.currentTarget).data('product-handle');

                halo.updateContentQuickView(handle);
            });

            $doc.on('click', '[data-close-quick-view-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.removeClass('quick-view-show');
            });

            $doc.on('click', (event) => {
                if($body.hasClass('quick-view-show')){
                    if (($(event.target).closest('[data-open-quick-view-popup]').length === 0) && ($(event.target).closest('[data-quick-view-popup]').length === 0)){
                        $body.removeClass('quick-view-show');
                    }
                }
            });
        },

        updateContentQuickView: function(handle){
            var popup = $('[data-quick-view-popup]'),
                popupContent = popup.find('.halo-popup-content');

            $.ajax({
                type: 'get',
                url: window.routes.root + '/products/' + handle + '?view=ajax_quick_view',
                beforeSend: function () {
                    // modalContent.empty();
                },
                success: function (data) {
                    popupContent.html(data);
                },
                error: function (xhr, text) {
                    alert($.parseJSON(xhr.responseText).description);
                },
                complete: function () {
                    var $scope = popup.find('.quickView');

                    halo.productImageGallery($scope);
                    halo.productLastSoldOut($scope);
                    halo.productCustomerViewing($scope);
                    halo.productCountdown($scope);
                    halo.setProductForWishlist(handle);

                    $body.addClass('quick-view-show');

                    if($scope.find('.halo-socialShare').length > 0){
                        src = $scope.find('.halo-socialShare script').attr('src');

                        $.getScript(src)
                            .done(() => {
                                if(typeof addthis !== 'undefined') {
                                    addthis.init();
                                    addthis.layers.refresh();
                                }
                            });
                    }

                    if (window.review.show && $('.shopify-product-reviews-badge').length > 0) {
                        return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
                    }
                }
            });
        },

        productImageGallery: function($scope) {
            var sliderFor = $scope.find('.productView-for'),
                sliderNav = $scope.find('.productView-nav');

            if(!sliderFor.hasClass('slick-initialized') && !sliderNav.hasClass('slick-initialized')) {
                if($scope.hasClass('layout-1') || $scope.hasClass('layout-2')){
                    sliderFor.on('init',(event, slick) => {
                        sliderFor.find('.animated-loading').removeClass('animated-loading');
                    });

                    sliderFor.slick({
                        slidesToShow: 6,
                        slidesToScroll: 1,
                        asNavFor: sliderNav,
                        arrows: true,
                        dots: false,
                        draggable: false,
                        adaptiveHeight: false,
                        focusOnSelect: true,
                        vertical: true,
                        verticalSwiping: true,
                        infinite: false,
                        nextArrow: '<button type="button" class="slick-arrow slick-next"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 7.75 1.34375 L 6.25 2.65625 L 14.65625 12 L 6.25 21.34375 L 7.75 22.65625 L 16.75 12.65625 L 17.34375 12 L 16.75 11.34375 Z"/></svg></button>',
                        prevArrow: '<button type="button" class="slick-arrow slick-prev"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 7.75 1.34375 L 6.25 2.65625 L 14.65625 12 L 6.25 21.34375 L 7.75 22.65625 L 16.75 12.65625 L 17.34375 12 L 16.75 11.34375 Z"/></svg></button>',
                        responsive: [
                            {
                                breakpoint: 1600,
                                settings: {
                                    slidesToShow: 5,
                                    slidesToScroll: 1
                                }
                            },
                            {
                                breakpoint: 1280,
                                settings: {
                                    vertical: false,
                                    verticalSwiping: false
                                }
                            }
                        ]
                    });
                } else if($scope.hasClass('layout-3')){
                    sliderFor.on('init',(event, slick) => {
                        sliderFor.find('.animated-loading').removeClass('animated-loading');
                    });

                    sliderFor.slick({
                        slidesToShow: 6,
                        slidesToScroll: 1,
                        asNavFor: sliderNav,
                        arrows: true,
                        dots: false,
                        focusOnSelect: true,
                        infinite: false,
                        nextArrow: '<button type="button" class="slick-arrow slick-next"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 7.75 1.34375 L 6.25 2.65625 L 14.65625 12 L 6.25 21.34375 L 7.75 22.65625 L 16.75 12.65625 L 17.34375 12 L 16.75 11.34375 Z"/></svg></button>',
                        prevArrow: '<button type="button" class="slick-arrow slick-prev"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 7.75 1.34375 L 6.25 2.65625 L 14.65625 12 L 6.25 21.34375 L 7.75 22.65625 L 16.75 12.65625 L 17.34375 12 L 16.75 11.34375 Z"/></svg></button>',
                        responsive: [
                            {
                                breakpoint: 1600,
                                settings: {
                                    slidesToShow: 5,
                                    slidesToScroll: 1
                                }
                            }
                        ]
                    });
                }

                sliderNav.slick({
                    fade: true,
                    arrows: false,
                    dots: false,
                    infinite: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    asNavFor: sliderFor
                });

                if($scope.hasClass('layout-1') || $scope.hasClass('layout-2')){
                    if ($win.width() > 1279) {
                        if (sliderFor.find('.slick-arrow').length > 0) {
                            var height_for = sliderFor.outerHeight(),
                                height_nav = sliderNav.outerHeight(),
                                pos = (height_nav - height_for)/2;

                            sliderFor.parent().addClass('arrows-visible');
                            sliderFor.parent().css('top', pos);
                        } else {
                            sliderFor.parent().addClass('arrows-disable');
                        }
                    } else {
                        if (sliderFor.find('.slick-arrow').length > 0) {
                            sliderFor.parent().css('top', 'unset');
                        }
                    }
                }

                if (sliderNav.find('[data-youtube]').length > 0) {
                    if (typeof window.onYouTubeIframeAPIReady === 'undefined') {
                        window.onYouTubeIframeAPIReady = halo.initYoutubeCarousel.bind(window, sliderNav);

                        const tag = document.createElement('script');
                        tag.src = 'https://www.youtube.com/player_api';
                        const firstScriptTag = document.getElementsByTagName('script')[0];
                        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    } else {
                        halo.initYoutubeCarousel(sliderNav);
                    }
                }

                if (sliderNav.find('[data-vimeo]').length > 0) {
                    sliderNav.on('beforeChange', (event, slick) => {
                        var currentSlide,
                            player,
                            command;

                        currentSlide = $(slick.$slider).find('.slick-current');
                        player = currentSlide.find('iframe').get(0);

                        command = {
                            'method': 'pause',
                            'value': 'true'
                        };

                        if (player != undefined) {
                            player.contentWindow.postMessage(JSON.stringify(command), '*');
                        }
                    });

                    sliderNav.on('afterChange', (event, slick) => {
                        var currentSlide,
                            player,
                            command;

                        currentSlide = $(slick.$slider).find('.slick-current');
                        player = currentSlide.find('iframe').get(0);

                        command = {
                            'method': 'play',
                            'value': 'true'
                        };

                        if (player != undefined) {
                            player.contentWindow.postMessage(JSON.stringify(command), '*');
                        }
                    });
                }

                if (sliderNav.find('[data-mp4]').length > 0) {
                    sliderNav.on('beforeChange', (event, slick) => {
                        var currentSlide,
                            player;

                        currentSlide = $(slick.$slider).find('.slick-current');
                        player = currentSlide.find('video').get(0);

                        if (player != undefined) {
                            player.pause();
                        }
                    });

                    sliderNav.on('afterChange', (event, slick) => {
                        var currentSlide,
                            player;

                        currentSlide = $(slick.$slider).find('.slick-current');
                        player = currentSlide.find('video').get(0);

                        if (player != undefined) {
                            player.play();
                        }
                    });
                }
            }

            var productFancybox = $scope.find('[data-fancybox]');

            if(productFancybox.length > 0){
                productFancybox.fancybox({
                    buttons: [
                        "zoom",
                        //"share",
                        "slideShow",
                        //"fullScreen",
                        //"download",
                        // "thumbs",
                        "close"
                    ]
                });
            }

            var productZoom = $scope.find('[data-zoom-image]');

            if ($win.width() > 1024) {
                productZoom.each((index, element) => {
                    var $this = $(element);
                    
                    if ($win.width() > 1024) {
                        $this.zoom({ url: $this.attr('data-zoom-image'), touch: false });
                    } else {
                        $this.trigger('zoom.destroy');
                    }
                });
            }

            $win.on('resize', () => {
                if($scope.hasClass('layout-1') || $scope.hasClass('layout-2')){
                    if ($win.width() > 1279) {
                        setTimeout(() => {
                            if (sliderFor.find('.slick-arrow').length > 0) {
                                var height_for = sliderFor.outerHeight(),
                                    height_nav = sliderNav.outerHeight(),
                                    pos = (height_nav - height_for)/2;

                                sliderFor.parent().addClass('arrows-visible');
                                sliderFor.parent().css('top', pos);
                            } else {
                                sliderFor.parent().addClass('arrows-disable');
                            }
                        }, 200);
                    } else {
                        setTimeout(() => {
                            if (sliderFor.find('.slick-arrow').length > 0) {
                                sliderFor.parent().css('top', 'unset');
                            }
                        }, 200);
                    }
                }
            });
        },

        initYoutubeCarousel: function(slider) {
            slider.each((index, slick) => {
                const $slick = $(slick);

                if ($slick.find('[data-youtube]').length > 0) {
                    $slick.addClass('slick-slider--video');

                    halo.initYoutubeCarouselEvent(slick);
                }
            });
        },

        initYoutubeCarouselEvent: function(slick){
            var $slick = $(slick),
                $videos = $slick.find('[data-youtube]');

            bindEvents(slick);

            function bindEvents() {
                if ($slick.hasClass('slick-initialized')) {
                    onSlickImageInit($slick, $videos);
                }

                $doc.on('init', $slick, onSlickImageInit);
                $doc.on('beforeChange', $slick, onSlickImageBeforeChange);
                $doc.on('afterChange', $slick, onSlickImageAfterChange);
            }

            function onPlayerReady(event) {
                $(event.target.getIframe()).closest('.slick-slide').data('youtube-player', event.target);

                setTimeout(function(){
                    if ($(event.target.getIframe()).closest('.slick-slide').hasClass('slick-active')) {
                        $slick.slick('slickPause');
                        event.target.playVideo();
                    }
                }, 200);
            }

            function onPlayerStateChange(event) {
                if (event.data === YT.PlayerState.PLAYING) {
                    $slick.slick('slickPause');
                }

                if (event.data === YT.PlayerState.ENDED) {
                    $slick.slick('slickNext');
                }
            }

            function onSlickImageInit() {
                $videos.each((j, vid) => {
                    const $vid = $(vid);
                    const id = `youtube_player_${Math.floor(Math.random() * 100)}`;

                    $vid.attr('id', id);

                    const player = new YT.Player(id, {
                        host: 'http://www.youtube.com',
                        videoId: $vid.data('youtube'),
                        wmode: 'transparent',
                        playerVars: {
                            autoplay: 0,
                            controls: 0,
                            disablekb: 1,
                            enablejsapi: 1,
                            fs: 0,
                            rel: 0,
                            showinfo: 0,
                            iv_load_policy: 3,
                            modestbranding: 1,
                            wmode: 'transparent',
                        },
                        events: {
                            onReady: onPlayerReady,
                            onStateChange: onPlayerStateChange,
                        },
                    });
                });
            }

            function onSlickImageBeforeChange(){
                const player = $slick.find('.slick-slide.slick-active').data('youtube-player');

                if (player) {
                    player.stopVideo();
                    $slick.removeClass('slick-slider--playvideo');
                }
            }

            function onSlickImageAfterChange(){
                const player = $slick.find('.slick-slide.slick-active').data('youtube-player');

                if (player) {
                    $slick.slick('slickPause');
                    $slick.addClass('slick-slider--playvideo');
                    player.playVideo();
                }
            }
        },

        productNextPrev: function($scope){
            var wrapper = $scope.find('.productView-nextProducts');

            if (wrapper.length > 0 && $win.width() > 1024) {
                const prodWrap = wrapper.find('.next-prev-modal'),
                    prodIcons = wrapper.find('.next-prev-icons'),
                    nextWrap = $('#next-product-modal'),
                    prevWrap = $('#prev-product-modal');

                prodIcons.on('mouseover', () => {
                    prodWrap.addClass('is-show');
                })
                .on('mouseleave', () => {
                    prodWrap.removeClass('is-show');
                });

                $('.next-icon', prodIcons).on('mouseover', () => {
                    prevWrap.removeClass('is-active');
                    nextWrap.addClass('is-active');
                });

                $('.prev-icon', prodIcons).on('mouseover', () => {
                    nextWrap.removeClass('is-active');
                    prevWrap.addClass('is-active');
                });

                prodWrap.on('mouseover', () => {
                    prodWrap.addClass('is-show');
                })
                .on('mouseleave', () => {
                    prodWrap.removeClass('is-show');
                });
            }
        },

        productSizeChart: function($scope){
            var sizeChartBtn =  $scope.find('[data-open-size-chart-popup]');

            sizeChartBtn.on('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                if(!$body.hasClass('size-chart-show')){
                    $body.addClass('size-chart-show');
                }
            });

            $doc.on('click', '[data-close-size-chart-popup]', () => {
                $body.removeClass('size-chart-show');
            });

            $doc.on('click', (event) => {
                if ($body.hasClass('size-chart-show')) {
                    if (($(event.target).closest('[data-open-size-chart-popup]').length === 0) && ($(event.target).closest('[data-size-chart-popup]').length === 0)) {
                        $body.removeClass('size-chart-show');
                    }
                }
            });
        },

        productLastSoldOut: function($scope) {
            var wrapper = $scope.find('[data-sold-out-product]');

            if (wrapper.length > 0) {
                var numbersProductList = wrapper.data('item').toString().split(','),
                    numbersProductItem = Math.floor(Math.random() * numbersProductList.length),
                    numbersHoursList = wrapper.data('hours').toString().split(','),
                    numbersHoursItem = Math.floor(Math.random() * numbersHoursList.length);

                wrapper.find('[data-sold-out-number]').text(numbersProductList[numbersProductItem]);
                wrapper.find('[data-sold-out-hours]').text(numbersHoursList[numbersHoursItem]);
                wrapper.show();
            }
        },

        productCustomerViewing: function($scope) {
            var wrapper = $scope.find('[data-customer-view]');

            if (wrapper.length > 0) {
                var numbersViewer = wrapper.data('customer-view'),
                    numbersViewerList =  JSON.parse('[' + numbersViewer + ']'),
                    numbersViewerTime = wrapper.data('customer-view-time'),
                    timeViewer =  parseInt(numbersViewerTime) * 1000;
                
                setInterval(function() {
                    var numbersViewerItem = (Math.floor(Math.random() * numbersViewerList.length));

                    wrapper.find('.text').text(window.customer_view.text.replace('[number]', numbersViewerList[numbersViewerItem]));
                }, timeViewer);
            }
        },

        productCountdown: function($scope){
            var wrapper = $scope.find('[data-countdown-id]'),
                countDown = wrapper.data('countdown'),
                countDownDate = new Date(countDown).getTime(),
                countDownText = window.countdown.text;

            if(wrapper.length > 0) {
                var countdownfunction = setInterval(function() {
                    var now = new Date().getTime(),
                        distance = countDownDate - now;

                    if (distance < 0) {
                        clearInterval(countdownfunction);
                        wrapper.remove();
                    } else {
                        var days = Math.floor(distance / (1000 * 60 * 60 * 24)),
                            hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                            minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                            seconds = Math.floor((distance % (1000 * 60)) / 1000),
                            strCountDown = '<span class="text"><span>'+ countDownText +'</span></span><span class="num">'+days+'<span>'+ window.countdown.day +'</span></span>\
                                <span class="num">'+hours+'<span>'+ window.countdown.hour +'</span></span>\
                                <span class="num">'+minutes+'<span>'+ window.countdown.min +'</span></span>\
                                <span class="num">'+seconds+'<span>'+ window.countdown.sec +'</span></span>';

                        wrapper.html(strCountDown);
                    }
                }, 1000);
            }
        },

        initWishlist: function() {
            if(window.wishlist.show){
                halo.setLocalStorageProductForWishlist();

                $doc.on('click', '[data-wishlist]', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    var $target = $(event.currentTarget),
                        id = $target.data('product-id'),
                        handle = $target.data('wishlist-handle'),
                        wishlistList = localStorage.getItem('wishlistItem') ? JSON.parse(localStorage.getItem('wishlistItem')) : [];
                        index = wishlistList.indexOf(handle),
                        wishlistContainer = $('[data-wishlist-content]');

                    if(!$target.hasClass('wishlist-added')){
                        $target
                            .addClass('wishlist-added')
                            .find('.text')
                            .text(window.wishlist.added);

                        if(wishlistContainer.length > 0) {
                            // halo.wishlistProductItem(handle);
                        }

                        wishlistList.push(handle);
                        localStorage.setItem('wishlistItem', JSON.stringify(wishlistList));
                    } else {
                       $target
                            .removeClass('wishlist-added')
                            .find('.text')
                            .text(window.wishlist.add);

                        if(wishlistContainer.length > 0) {
                            if($('[data-wishlist-added="wishlist-'+ id +'"]').length > 0) {
                                $('[data-wishlist-added="wishlist-'+ id +'"]').remove();
                            }
                        }

                        wishlistList.splice(index, 1);
                        localStorage.setItem('wishlistItem', JSON.stringify(wishlistList));

                        if(wishlistContainer.length > 0) {
                            if(window.wishlist_list){
                                // halo.wishlistPagination();
                            } else {
                                // halo.updateShareWishlistViaMail2();
                            }
                        }
                    }

                    halo.setProductForWishlist(handle);
                });
            }
        },

        setProductForWishlist: function(handle){
            var wishlistList = JSON.parse(localStorage.getItem('wishlistItem')),
                item = $('[data-wishlist-handle="'+ handle +'"]'),
                index = wishlistList.indexOf(handle);

            if(index >= 0) {
                item
                    .addClass('wishlist-added')
                    .find('.text')
                    .text(window.wishlist.added)
            } else {
                item
                    .removeClass('wishlist-added')
                    .find('.text')
                    .text(window.wishlist.add);
            }
        },

        setLocalStorageProductForWishlist: function() {
            var wishlistList = localStorage.getItem('wishlistItem') ? JSON.parse(localStorage.getItem('wishlistItem')) : [];

            localStorage.setItem('wishlistItem', JSON.stringify(wishlistList));

            if (wishlistList.length > 0) {
                wishlistList = JSON.parse(localStorage.getItem('wishlistItem'));
                
                wishlistList.forEach((handle) => {
                    halo.setProductForWishlist(handle);
                });
            }
        }
	}
})(jQuery);