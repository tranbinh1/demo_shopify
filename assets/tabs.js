class ProductTabs extends HTMLElement {
	constructor() {
		super();

        this.tab = this.querySelectorAll('.tab-title');
        this.tabContent = this.querySelectorAll('.tab-content');
        this.link = this.querySelectorAll('.toggleLink');
        this.readMore = this.querySelectorAll('[data-description-toogle]');

        for (i = 0; i < this.tab.length; i++) {
            this.tab[i].addEventListener(
                'click',
                this.tabActive.bind(this)
            );
        }

        for (i = 0; i < this.link.length; i++) {
            this.link[i].addEventListener(
                'click',
                this.tabToggle.bind(this)
            );
        }

        for (i = 0; i < this.readMore.length; i++) {
            this.readMore[i].addEventListener(
                'click',
                this.readMoreReadLess.bind(this)
            );
        }
	}

    tabActive(event){
        event.preventDefault();
        event.stopPropagation();

        var $this = event.target,
            id = $this.getAttribute('href').replace('#', '');

        if(!$this.classList.contains('is-open')) {
            this.tab.forEach((element, index) => {
                element.classList.remove('is-open');
            });

            $this.classList.add('is-open');

            this.tabContent.forEach((element, index) => {
                if(element.getAttribute('id') == id){
                    element.classList.add('is-active');
                } else {
                    element.classList.remove('is-active');
                }
            });
        }
    }

    tabToggle(event){
        event.preventDefault();
        event.stopPropagation();

        var $this = event.target,
            $thisContent = $this.parentNode.nextElementSibling;

        if($this.classList.contains('is-open')){
            $this.classList.remove('is-open');
            // $thisContent.classList.remove('is-active');
            $($thisContent).slideUp('slow');
        } else {
            $this.classList.add('is-open');
            // $thisContent.classList.add('is-active');
            $($thisContent).slideDown('slow');
        }
    }

    readMoreReadLess(event){
        event.preventDefault();
        event.stopPropagation();

        var $this = event.target,
            id = $this.getAttribute('href').replace('#', ''),
            textShowMore = $this.getAttribute('data-show-more-text'),
            textShowLess = $this.getAttribute('data-show-less-text');

        if($this.classList.contains('is-less')) {
            $this.classList.remove('is-less');
            $this.classList.add('is-show');
            $this.innerText = textShowMore;
            document.getElementById(`${id}`).style.maxHeight = '300px';
        } else {
            $this.classList.remove('is-show');
            $this.classList.add('is-less');
            $this.innerText = textShowLess;
            document.getElementById(`${id}`).style.maxHeight = 'unset';
        }
    }
}

customElements.define('product-tab', ProductTabs);