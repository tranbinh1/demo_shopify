class ProductBundle extends HTMLElement {
    constructor() {
        super();
        this.updateBundleTotalPrice();
        this.updateBundleText();
        this.form = this.querySelector('form');
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.querySelectorAll('.bundle-checkbox')
        const elem_chk = document.querySelectorAll('.bundle-checkbox');
        if(elem_chk) {
          elem_chk.forEach( (button) => button.addEventListener('click', this.onHandleCheckedProduct.bind(this)));
        }
        const elem_toogle = document.querySelectorAll('.fbt-toogle-options');
        if(elem_toogle) {
          elem_toogle.forEach( (button) => button.addEventListener('click', this.onHandleToogleProduct.bind(this)));
        }
        this.form.addEventListener('change', this.onVariantChange.bind(this));
    }

    onVariantChange(evt) {
        this.changeSwatchProductBundle(evt);
        this.updateVariants(evt);
    }

    onSubmitHandler(evt) {
        evt.preventDefault();
        const bundleProduct = this.form.querySelectorAll('.fbt-product-item.isChecked');
        const curPro = this.form.querySelector('[data-collections-related]');
        const discount_code = "FBT-BUNDLE-"+ meta.product.id;
        let data = '';
        let hint = ',';
        bundleProduct.forEach((item, index) => {
            const variantId = item.querySelector('[name=group_id]').value;
            if(variantId) {
                data = `${data}${variantId}:1${index == (bundleProduct.length - 1) ? '' : hint}`;
            };
        });
        fetch(`/cart/${data}`)
        .then(function(parsedState) {
        });
        if (bundleProduct.length == this.form.querySelectorAll('.fbt-product-item').length) {
            fetch(`/discount/${discount_code}?redirect=/cart`)
            .then(function(parsedState) {
            });
        }
    }

    onHandleCheckedProduct(evt) {
        evt.preventDefault();
        const dataId = evt.target.closest('.fbt-product-item').getAttribute('data-bundle-product-id');
        if(!document.querySelector('[data-bundle-product-id="'+ dataId +'"]').classList.contains('isChecked')) {
            document.querySelector('[data-bundle-product-id="'+ dataId +'"]').classList.add('isChecked');
            evt.target.closest('.fbt-product-item').classList.add('isChecked');
            evt.target.previousElementSibling.setAttribute('checked', true);
        } else {
            document.querySelector('[data-bundle-product-id="'+ dataId +'"]').classList.remove('isChecked');
            evt.target.closest('.fbt-product-item').classList.remove('isChecked');
            evt.target.previousElementSibling.removeAttribute('checked');
        };
        this.updateBundleTotalPrice();
    }

    onHandleToogleProduct(evt) {
        evt.preventDefault();

        (evt.target.nextElementSibling.classList.contains('show')) ? 
        evt.target.nextElementSibling.classList.remove('show'):
        evt.target.nextElementSibling.classList.add('show');
        this.updateVariants(evt);

    }

    updateBundleText(showBundleText = true) {
        if (showBundleText) {
            const bundleText = document.querySelector('.bundle-price');
            const discountRate = bundleText.getAttribute('data-discount-rate')*100;
            const discountText = document.querySelector('.discount-text');
            discountText.innerHTML = discountText.textContent.replace('[discount]',discountRate + '%');
            discountText.style.display = 'block';
        }
    }

    updateBundleTotalPrice(showBundleTotalPrice = true) {
        if (showBundleTotalPrice) {
            const bundleProItem = document.querySelectorAll('.fbt-product-item.isChecked');
            const bundlePrice = document.querySelector('.bundle-price');
            const oldPrice = document.querySelector('.old-price--action');
            const discountRate = bundlePrice.getAttribute('data-discount-rate');
            var totalPrice = 0;
            const checkedProductLength = bundleProItem.length;
            const maxProduct = document.querySelectorAll('.fbt-product-item').length;

            bundleProItem.forEach((item) => {
                const selectElm = item.querySelector('select[name=group_id]'),
                    inputElm = item.querySelector('input[name=group_id]');

                if(selectElm.length) {
                    var price = selectElm[selectElm.selectedIndex].getAttribute('data-price');
                } else {
                  if (inputElm.length) {
                    var price = selectElm.querySelector('input[name=group_id]').getAttribute('data-price');
                  } else {
                    var price = selectElm.querySelector('input[name=id]').getAttribute('data-price');
                  }
                }

                if(price) {
                    totalPrice = totalPrice + parseFloat(price);
                    if(bundlePrice && oldPrice){
                        oldPrice.innerHTML = totalPrice;
                        bundlePrice.innerHTML = totalPrice*(1 - discountRate);
                         if(checkedProductLength == maxProduct){
                            bundlePrice.style.display = 'block';
                            oldPrice.style.display = 'block';
                            document.querySelector('.price--action').style.display = 'none';
                        }else{
                            bundlePrice.style.display = 'none';
                            oldPrice.style.display = 'none';
                            document.querySelector('.price--action').style.display = 'block';
                        }
                    }
                    document.querySelector('.price--action').innerHTML = totalPrice;
                };
            })
        }
    }

    updateVariants(evt){
        const productId = evt.target.closest('.fbt-product-item').getAttribute('data-bundle-product-id');
        const variants = window.productVariants[productId];
        const fieldsets = evt.target.closest('.fbt-product-item').querySelectorAll('.swatch');
        let selectedOption1;
        let selectedOption2;
        let selectedOption3;
        if (variants) {
            if (fieldsets[0]) selectedOption1 = Array.from(fieldsets[0].querySelectorAll('input')).find((radio) => radio.checked).value;
            if (fieldsets[1]) selectedOption2 = Array.from(fieldsets[1].querySelectorAll('input')).find((radio) => radio.checked).value;
            if (fieldsets[2]) selectedOption3 = Array.from(fieldsets[2].querySelectorAll('input')).find((radio) => radio.checked).value;
            var checkStatus = (optionSoldout, optionUnavailable,swatch) => {
                if(optionSoldout == undefined){
                    if (optionUnavailable == undefined) {
                        swatch.classList.add('soldout');
                        swatch.querySelector('input').setAttribute('disabled', true);
                    } else {
                        swatch.classList.add('soldout');
                        swatch.querySelector('input').setAttribute('disabled', true);
                    }
                } else {
                    swatch.classList.remove('soldout');
                    swatch.querySelector('input').removeAttribute('disabled');
                }
            };
            var renderSwatch = (optionIndex,inp) => {
                const swatchs = inp.querySelectorAll('.swatch-element');
                swatchs.forEach((swatch) => {
                    const swatchVal = swatch.getAttribute('data-value');
                    const optionSoldout = variants.find((variant) => {
                        switch (optionIndex) {
                            case 1: return variant.option1 == swatchVal && variant.available;
                            case 2: return variant.option1 == selectedOption1 && variant.option2 == swatchVal && variant.available;
                            case 3: return variant.option1 == selectedOption1 && variant.option2 == selectedOption2 && variant.option3 == swatchVal && variant.available;
                        }
                    });
                    const optionUnavailable = variants.find((variant) => {
                        switch (optionIndex) {
                            case 1: return variant.option1 == swatchVal;
                            case 2: return variant.option1 == selectedOption1 && variant.option2 == swatchVal;
                            case 3: return variant.option1 == selectedOption1 && variant.option2 == selectedOption2 && variant.option3 == swatchVal;
                        }
                    });
                    checkStatus(optionSoldout, optionUnavailable,swatch);
                })
            }
            var select_va_avai = (fieldset) => {
                // if (fieldset.querySelector('input:checked').parentElement.classList.contains('soldout')) {
                //     fieldset.querySelectorAll('.swatch-element input').forEach((item) => {
                //         item.removeAttribute('checked');
                //     });
                //     fieldset.querySelector('.swatch-element:not(.soldout) input').setAttribute('checked', '');
                // }
                fieldset.querySelector('[data-option-select]').innerHTML = fieldset.querySelector('input:checked').value;
            }
            fieldsets.forEach((inp) => {
                const optionIndex = parseInt(inp.getAttribute('data-option-idx'));
                renderSwatch(optionIndex,inp);

                // checked Variant Available
                select_va_avai(inp);
            });

        }
    }

    changeSwatchProductBundle(evt) {
        const productItem = evt.target.closest('.fbt-product-item');
        const fieldsets = Array.from(productItem.querySelectorAll('.swatch'));
        const productId = evt.target.parentElement.getAttribute('data-popup-bundle-product-id');
        const variantList = window.productVariants[productId];
        const optionIdx = parseInt(evt.target.closest('[data-option-idx]').getAttribute('data-option-idx'));
        const swatches = Array.from(productItem.querySelectorAll('.swatch-element'));
        const thisVal = evt.target.value;
        const fbtPrice = productItem.querySelector('.fbt-prices');
        const priceSale = fbtPrice.querySelector('.price-sale');
        const productPrice = fbtPrice.querySelector('[data-fbt-price-change]');
        const productInput = productItem.querySelector('[name=group_id]');
        // Get selected swatches
        let selectedVariant;
        let selectedSwatchOpt1;
        let selectedSwatchOpt2;
        let selectedSwatchOpt3;
        if (fieldsets[0]) selectedSwatchOpt1 = Array.from(fieldsets[0].querySelectorAll('input')).find((radio) => radio.checked).value;
        if (fieldsets[1]) selectedSwatchOpt2 = Array.from(fieldsets[1].querySelectorAll('input')).find((radio) => radio.checked).value;
        if (fieldsets[2]) selectedSwatchOpt3 = Array.from(fieldsets[2].querySelectorAll('input')).find((radio) => radio.checked).value;
        // Re-active all swatches
        swatches.forEach((swatche)=> {
            swatche.classList.remove('soldout');
            swatche.querySelector('input').setAttribute('disabled',false);
        })
        // Auto get first available variant
        switch (optionIdx){
            case 1:
                var availableVariants = variantList.find(function(variant){
                    return variant.option1 == thisVal && variant.option2 == selectedSwatchOpt2 && variant.available;
                })
                if(availableVariants != undefined){
                    selectedVariant =  availableVariants;
                }else{
                     // variant was sold out, so auto select other available variant
                    var altAvailableVariants = variantList.find(function(variant){
                        return variant.option1 == thisVal && variant.available;
                    })
                    selectedVariant =  altAvailableVariants;
                };
                break;
            case 2:
                var availableVariants = variantList.find(function(variant){
                    return variant.option1 == selectedSwatchOpt1 && variant.option2 == thisVal && variant.available;
                })
                if(availableVariants != undefined){
                    selectedVariant =  availableVariants;
                }else{
                    // Something went wrong, if correct, never meet this
                    console.log('Bundle Error: variant was soldout, on option selection #2')
                };
                break;
            case 3:
                var availableVariants = variantList.find(function(variant){
                    return variant.option1 == selectedSwatchOpt1 && variant.option2 == selectedSwatchOpt2 && variant.option3 == thisVal && variant.available;
                })
                if(availableVariants != undefined){
                   selectedVariant =  availableVariants;
                }else{
                    // Something went wrong, if correct, never meet this
                    console.log('Bundle Error: variant was soldout, on option selection #3')
                };
                break;
        }

        productInput.value = selectedVariant.id;

        // Do select callback function
        productPrice.innerHTML = selectedVariant.price;

        // change variant id of main product for adding to cart

        if (priceSale) {
            if (selectedVariant.compare_at_price > selectedVariant.price) {
                priceSale.querySelector('[data-fbt-price-change]').classList.remove('special-price');
                priceSale.querySelector('.old-price').innerHTML = selectedVariant.compare_at_price;
                priceSale.querySelector('.old-price').style.display = 'block';
            }
            else {
                priceSale.querySelector('.old-price').style.display = 'none';
                priceSale.querySelector('[data-fbt-price-change]').classList.remove('special-price');
            }
        }

        productItem.querySelector('select').value = selectedVariant.id;

        this.updateBundleTotalPrice();

        // if (ella.checkNeedToConvertCurrency()) {
        //     Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
        // }

        // Change product image

        if(selectedVariant.featured_image){
            const productImage = document.querySelector('.fbt-image-item[data-bundle-product-id="'+productId+'"] img');
            productImage.setAttribute('src',selectedVariant.featured_image.src)
        }

    }

}

customElements.define('product-bundle', ProductBundle);