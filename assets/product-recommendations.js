if (!customElements.get('heysoap-product-recommendations')) {
  class HeysoapProductRecommendations extends HTMLElement {
    connectedCallback() {
      if (this.dataset.loaded === 'true' || !this.dataset.url) return;
      if (this.dataset.loading === 'true') return;
      this.dataset.loading = 'true';

      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const documentFragment = new DOMParser().parseFromString(text, 'text/html');
          const replacement = documentFragment.querySelector('heysoap-product-recommendations');
          if (replacement) this.replaceWith(replacement);
        })
        .catch(() => {
          this.dataset.loading = 'false';
        });
    }
  }

  customElements.define('heysoap-product-recommendations', HeysoapProductRecommendations);
}
