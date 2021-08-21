class QuickSearch extends HTMLElement {
	constructor() {
		super();

        this.quickSearch = this;
        this.productToShow = this.getAttribute('data-product-to-show');
        this.headerInput = document.querySelector('input[name="q"]');
        this.searchResults = this.getElementsByClassName('quickSearchResultsContent')[0];
        this.searchResultsWidget = this.getElementsByClassName('quickSearchResultsWidget')[0];

        this.debouncedOnFocus = debounce((event) => {
            this.doQuickSearch();
        }, 200);

        this.headerInput.addEventListener('input', this.debouncedOnFocus.bind(this));
	}

    doQuickSearch(){
        if (this.headerInput.value.trim() === '') {
            this.searchResults.classList.remove('is-show');
            this.searchResults.classList.add('is-hidden');
            this.searchResultsWidget.classList.remove('is-hidden');
            this.searchResultsWidget.classList.add('is-show');
            return; 
        } else {
            if (this.headerInput.value.length > 2){
                this.quickSearch.classList.add('is-loading');

                var keyword = this.headerInput.value;
                var limit = this.productToShow;

                var url = `/search/suggest.json?q=${keyword}&resources[type]=product&resources[limit]=${limit}&resources[options][unavailable_products]=last`;

                this.renderQuickSearchFromFetch(url, keyword, limit);
            }
        }
    }

    renderQuickSearchFromFetch(url, keyword, limit){
        fetch(url)
            .then(response => response.json())
            .then((responseText) => {
                const products = responseText.resources.results.products;

                if(products.length > 0){
                    this.searchResults.getElementsByClassName('productEmpty')[0].style.display = 'none';

                    var list = []; 

                    products.forEach(product => {
                        list.push(product.handle);
                    });

                    var  quickSearch = this.quickSearch,
                        searchResults = this.searchResults,
                        searchResultsWidget = this.searchResultsWidget;

                    $.ajax({
                        type: 'get',
                        url: window.routes.root + '/collections/all',
                        cache: false,
                        data: {
                            view: 'ajax_product_card',
                            constraint: `limit=${limit}+sectionId=list-result+list_handle=` + encodeURIComponent(list)
                        },
                        beforeSend: function () {},
                        success: function (data) {
                            var searchQuery = `/search?q=${keyword}*&type=product`;

                            searchResults.getElementsByClassName('productGrid')[0].innerHTML = data;
                            searchResults.getElementsByClassName('productViewAll')[0].style.display = 'block';
                            searchResults.getElementsByClassName('button-view-all')[0].setAttribute('href', searchQuery);
                        },
                        complete: function () {
                            quickSearch.classList.remove('is-loading');
                            searchResultsWidget.classList.remove('is-show');
                            searchResultsWidget.classList.add('is-hidden');
                            searchResults.classList.remove('is-hidden');
                            searchResults.classList.add('is-show');
                        }
                    });
                } else {
                    this.searchResults.getElementsByClassName('productEmpty')[0].style.display = 'block';
                    this.searchResults.getElementsByClassName('keyword')[0].innerHTML = `<strong>${keyword}</strong>`;
                    this.quickSearch.classList.remove('is-loading');
                    this.searchResultsWidget.classList.remove('is-show');
                    this.searchResultsWidget.classList.add('is-hidden');
                    this.searchResults.classList.remove('is-hidden');
                    this.searchResults.classList.add('is-show');
                }
            });
    }
}

customElements.define('quick-search', QuickSearch);