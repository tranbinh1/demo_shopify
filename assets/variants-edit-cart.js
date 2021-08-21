class VariantEditCartSelects extends HTMLElement {
    constructor() {
        super();
        this.variantSelect = this;
        this.item = $(this.variantSelect).closest('.product-edit-item');

        if(this.variantSelect.classList.contains('has-default')){
            this.updateOptions();
            this.updateMasterId();
            this.renderProductInfo();
        }

        this.addEventListener('change', this.onVariantChange.bind(this));
    }

    onVariantChange(event) {
        this.updateOptions();
        this.updateMasterId();

        if (!this.currentVariant) {
            this.updateAttribute(true);
        } else {
            this.updateMedia();
            this.updateVariantInput();
            this.updatePrice();
            this.renderProductInfo();
            this.updateAttribute(false, !this.currentVariant.available);
        }
    }

    updateOptions() {
        this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
    }

    updateMasterId() {
        this.currentVariant = this.getVariantData().find((variant) => {
            return !variant.options.map((option, index) => {
                return this.options[index] === option;
            }).includes(false);
        });
    }

    updateMedia() {
        if (!this.currentVariant || !this.currentVariant?.featured_image) return;
        const itemImage = this.item.find('.product-edit-image');
        const image = this.currentVariant?.featured_image;

        if (!itemImage) return;

        itemImage.find('img').attr({
            'src': image.src,
            'srcset': image.src,
            'alt': image.alt
        });
    }

    updateVariantInput() {
        const productForm = document.querySelector(`#product-form-edit-${this.dataset.product}`);

        if (!productForm) return;

        const input = productForm.querySelector('input[name="id"]');
        
        if (!input) return;

        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    updatePrice(){
        const itemPrice = this.item.find('.product-edit-price');

        if (!itemPrice) return;

        var price = this.currentVariant?.price,
            compare_at_price = this.currentVariant?.compare_at_price;

        itemPrice.find('.price').html(Shopify.formatMoney(price, window.money_format)).show();

        if(compare_at_price > price) {
            itemPrice.find('.compare-price').html(Shopify.formatMoney(compare_at_price, window.money_format)).show();
            itemPrice.find('.price').addClass('new-price');
        } else {
            itemPrice.find('.compare-price').hide();
            itemPrice.find('.price').removeClass('new-price');
        }
    }

    renderProductInfo() {
        var variantList = this.getVariantData().filter((variant) => {
            return variant.available
        });

        var selectedOption1 = this.currentVariant?.option1,
            selectedOption2 = this.currentVariant?.option2,
            selectedOption3 = this.currentVariant?.option3,
            selectedVariant = this.currentVariant.title,
            options = this.getElementsByClassName('product-form__input');

        this.item.find('[data-change-title]').text(' - ' + selectedVariant);

        $.each(options, (index, element) => {
            var position = $(element).data('option-index'),
                type = $(element).data('product-attribute');

            switch (position) {
                case 0:
                    $(element).find('[data-header-option]').text(selectedOption1);

                    if(type == 'set-select') {
                        var selectValue = $(element).find('.select__select').val(),
                            selectList = $(element).find('.select__select option');

                        selectList.each((idx, elt) => {
                            if(elt.value == selectValue){
                                $(elt).attr('selected', 'selected');
                            } else {
                                $(elt).removeAttr('selected');
                            }
                        });
                    }

                    var option1List = variantList.filter((variant) => {
                        return variant.option1 === selectedOption1;
                    });

                    if(selectedOption2){
                        var inputList = $(options[1]),
                            input = inputList.find('.product-form__radio'),
                            selectOption = inputList.find('.select__select option');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option1List.find((variant) => {
                                    return variant.option2 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            selectOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option1List.find((variant) => {
                                    return variant.option2 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    if(selectedOption3){
                        var inputList = $(options[2]),
                            input = inputList.find('.product-form__radio'),
                            selectOption = inputList.find('.select__select option');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option1List.find((variant) => {
                                    return variant.option3 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            electOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option1List.find((variant) => {
                                    return variant.option3 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    break;
                case 1:
                    $(element).find('[data-header-option]').text(selectedOption2);

                    if(type == 'set-select') {
                        var selectValue = $(element).find('.select__select').val(),
                            selectList = $(element).find('.select__select option');

                        selectList.each((idx, elt) => {
                            if(elt.value == selectValue){
                                $(elt).attr('selected', 'selected');
                            } else {
                                $(elt).removeAttr('selected');
                            }
                        });
                    }

                    var option2List = variantList.filter((variant) => {
                        return variant.option2 === selectedOption2;
                    });

                    if(selectedOption1){
                        var inputList = $(options[0]),
                            input = inputList.find('.product-form__radio'),
                            selectOption = inputList.find('.select__select option');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option2List.find((variant) => {
                                    return variant.option1 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            selectOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option2List.find((variant) => {
                                    return variant.option1 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    if(selectedOption3){
                        var inputList = $(options[2]),
                            input = inputList.find('.product-form__radio'),
                            selectOption = inputList.find('.select__select option');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option2List.find((variant) => {
                                    return variant.option3 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            electOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option2List.find((variant) => {
                                    return variant.option3 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    break;
                case 2:
                    $(element).find('[data-header-option]').text(selectedOption3);

                    if(type == 'set-select') {
                        var selectValue = $(element).find('.select__select').val(),
                            selectList = $(element).find('.select__select option');

                        selectList.each((idx, elt) => {
                            if(elt.value == selectValue){
                                $(elt).attr('selected', 'selected');
                            } else {
                                $(elt).removeAttr('selected');
                            }
                        });
                    }

                    var option3List = variantList.filter((variant) => {
                        return variant.option3 === selectedOption3;
                    });

                    if(selectedOption1){
                        var inputList = $(options[0]),
                            input = inputList.find('.product-form__radio'),
                            selectOption = inputList.find('.select__select option');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option3List.find((variant) => {
                                    return variant.option1 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            selectOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option3List.find((variant) => {
                                    return variant.option1 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    if(selectedOption2){
                        var inputList = $(options[1]),
                            input = inputList.find('.product-form__radio');

                        if(type == 'set-rectangle'){
                            input.each((idx, elt) => {
                                var $input = $(elt),
                                    $label = $input.next(),
                                    optionValue = $(elt).val();

                                var optionSoldout = option3List.find((variant) => {
                                    return variant.option2 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $label.removeClass('available').addClass('soldout');
                                } else {
                                    $label.removeClass('soldout').addClass('available');
                                }
                            });
                        } else {
                            selectOption.each((idx, elt) => {
                                var $option = $(elt),
                                    optionValue = $(elt).val();

                                var optionSoldout = option3List.find((variant) => {
                                    return variant.option2 == optionValue
                                });

                                if(optionSoldout == undefined){
                                    $option.attr('disabled', true);
                                } else {
                                    $option.removeAttr('disabled');
                                }
                            });
                        }
                    }

                    break;
            }
        });

        var inventory = this.currentVariant?.inventory_management;

        if(inventory != null) {
            var productId = this.item.data('cart-edit-id'),
                arrayInVarName = 'edit_cart_inven_array_' + productId,
                inven_array = window[arrayInVarName];

            if(inven_array != undefined) {
                var inven_num = inven_array[this.currentVariant.id],
                    inventoryQuantity = parseInt(inven_num);

                this.item.find('input[name="quantity"]').attr('data-inventory-quantity', inventoryQuantity);

                if(this.item.find('.product-edit-hotStock').length > 0){
                    var hotStock = this.item.find('.product-edit-hotStock'),
                        maxStock = hotStock.data('edit-cart-hot-stock');

                    if(inventoryQuantity > 0 && inventoryQuantity <= maxStock){
                        var textStock = window.inventory_text.hotStock.replace('[inventory]', inventoryQuantity);
                        hotStock.text(textStock).show();
                    } else {
                        hotStock.hide();
                    }
                }
            }
        }
    }

    updateAttribute(unavailable = true, disable = true){
        var alertBox = this.item.find('.alertBox'),
            quantityInput = this.item.find('input[name="quantity"]'),
            notifyMe = this.item.find('.product-edit-notifyMe'),
            hotStock = this.item.find('.productView-hotStock');

        if(unavailable){
            this.item.removeClass('isChecked');
            quantityInput.attr('disabled', true);
            alertBox.find('.alertBox-message').text(window.variantStrings.unavailable_message);
            alertBox.show();
            notifyMe.slideUp('slow');

            if(hotStock.length > 0){
                hotStock.hide();
            }
        } else {
            if (disable) {
                this.item.removeClass('isChecked');
                quantityInput.attr('disabled', true);
                alertBox.find('.alertBox-message').text(window.variantStrings.soldOut_message);
                alertBox.show();

                this.item.find('.quantity__message').empty().hide();

                if(notifyMe.length > 0){
                    notifyMe.find('input[name="halo-notify-product-variant"]').val(this.currentVariant.title);
                    notifyMe.find('.notifyMe-text').empty();
                    notifyMe.slideDown('slow');
                }
            } else{
                this.item.addClass('isChecked')
                quantityInput.attr('disabled', false);
                alertBox.find('.alertBox-message').text('');
                alertBox.hide();

                if(notifyMe.length > 0){
                    notifyMe.slideUp('slow');
                }
            }
        }
    }

    getVariantData() {
        this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
        return this.variantData;
    }
}

customElements.define('variant-edit-selects', VariantEditCartSelects);

class VariantEditCartRadios extends VariantEditCartSelects {
    constructor() {
        super();
    }

    updateOptions() {
        const fieldsets = Array.from(this.querySelectorAll('fieldset'));
        this.options = fieldsets.map((fieldset) => {
            return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
        });
    }
}

customElements.define('variant-edit-radios', VariantEditCartRadios);

class QuantityEditCartInput extends HTMLElement {
    constructor() {
        super();
        this.input = this.querySelector('input');
        this.item = $(this.input).closest('.product-edit-item');
        this.input.addEventListener('change', this.onInputChange.bind(this));
    }

    onInputChange(event) {
        event.preventDefault();
        var inputValue = this.input.value;
        var inventoryQuantity = this.input.dataset.quantity;

        if(inputValue < 1) {
            inputValue = 1;

            this.input.value =  inputValue;
        } else {
            if (inventoryQuantity < inputValue) {
                var message = window.inventory_text.warningQuantity.replace('[inventory]', inventoryQuantity);

                inputValue = inventoryQuantity;
                this.input.value =  inputValue;

                this.item.find('.quantity__message').text(message).show();
                this.item.removeClass('isChecked');
            } else {
                this.item.addClass('isChecked');
                this.item.find('.quantity__message').empty().hide();
            }
        }
    }
}

customElements.define('quantity-edit-cart-input', QuantityEditCartInput);