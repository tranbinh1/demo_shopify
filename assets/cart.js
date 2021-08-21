class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      this.closest('cart-items').updateQuantity(this.dataset.index, 0);
      // console.log(event.target.);
      debugger;
      const id_item = event.target.dataset.id;
      const id_gift = document.getElementById('is-a-gift').dataset.id
      if (id_item == id_gift) {
        console.log(document.getElementById('is-a-gift'));
        document.getElementById('is-a-gift').style.display = 'block';
        document.getElementById('is-a-gift').querySelector('span').style.display = 'none';
      } 
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status');

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      }
    ];
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);
    debugger;
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        this.classList.toggle('is-empty', parsedState.item_count === 0);
        document.getElementById('main-cart-footer')?.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));

        this.updateLiveRegions(line, parsedState.item_count);
        document.getElementById(`CartItem-${line}`)?.querySelector(`[name="${name}"]`)?.focus();
        this.disableLoading();
      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        document.getElementById('cart-errors').textContent = window.cartStrings.error;
        this.disableLoading();
      });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      document.getElementById(`Line-item-error-${line}`)
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          document.getElementById(`Quantity-${line}`).value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    document.getElementById('main-cart-items').classList.add('cart__items--disabled');
    this.querySelectorAll('.loading-overlay')[line - 1].classList.remove('hidden');
    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    document.getElementById('main-cart-items').classList.remove('cart__items--disabled');
  }
}

customElements.define('cart-items', CartItems);

class CouponCode extends HTMLElement {
  constructor() {
    super();
    if (localStorage.getItem('storedDiscount')){  
      var discountStored = localStorage.getItem('storedDiscount');   
      document.querySelector('input[name="discount"]').value = localStorage.getItem('storedDiscount');  
    }
    this.addEventListener('change', debounce((event) => {
      fetch(`/discount/${event.target.value}`)
          .then((response) => response.text())
          .then((responseText) => {
      });
    }, 300))
  }
}

customElements.define('coupon-code', CouponCode);

class GiftCart extends HTMLElement {
  constructor() {
    super();
    Shopify.Cart = Shopify.Cart || {};
    Shopify.Cart.GiftWrap = {};
    Shopify.Cart.GiftWrap.set = function(id,url,event) {
      var headers = new Headers({ 'Content-Type': 'application/json' });
      var request = {
        method: 'POST',
        headers: headers,
        body: '{ "updates": { "'+id+'": "1" } }'
      };
      fetch('/cart/update.js', request)
      .then((responseText) => {
        // ella.loadAjaxCart();
      });
      setTimeout(() => {
        fetch(url)
        .then(response => response.text())
        .then((responseText) => {
          const html = responseText;
          if (html != '') {
            const innerHTML = new DOMParser()
            .parseFromString(html, 'text/html')
            .getElementById('main-cart-items').innerHTML;
            document.getElementById('main-cart-items').innerHTML = innerHTML;
            event.target.parentElement.style.display = 'none';
          }
        });
      },300)
      
    }
    document.querySelector('#gift-wrapping').addEventListener('click', (event) => {
      event.preventDefault();
      event.target.children[0].style.display = 'block';
      
      const section = document.getElementById('main-cart-items').dataset.id;
      const url = `${window.location.pathname}?section_id=${section}`;
      Shopify.Cart.GiftWrap.set(event.target.dataset.giftId, url, event); 
    });
  }
}

customElements.define('gift-card-cart', GiftCart);