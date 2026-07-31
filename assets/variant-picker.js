if (!customElements.get('heysoap-variant-picker')) {
  class HeysoapVariantPicker extends HTMLElement {
    connectedCallback() {
      if (this.dataset.initialized === 'true') return;
      this.dataset.initialized = 'true';

      const dataElement = this.querySelector('script[type="application/json"]');
      if (!dataElement) return;

      try {
        this.variants = JSON.parse(dataElement.textContent);
      } catch (error) {
        return;
      }

      this.addEventListener('change', (event) => {
        const target = event.target;
        if (!target.matches('select, input[type="radio"]')) return;
        this.updateVariant(target.value);
      });
    }

    updateVariant(variantId) {
      const variant = this.variants.find((item) => String(item.id) === String(variantId));
      if (!variant) return;

      const context = this.closest('.featured-product-card') || this.closest('section') || document;
      const variantInput = context.querySelector('.buy-buttons-block input[name="id"]');
      const addButton = context.querySelector('.buy-buttons-block__add');

      if (variantInput) variantInput.value = variant.id;

      if (addButton) {
        addButton.disabled = !variant.available;
        addButton.textContent = variant.available
          ? addButton.dataset.availableLabel
          : addButton.dataset.soldOutLabel;
      }

      const currentPrice = context.querySelector('.product-price-block__current');
      const comparePrice = context.querySelector('.product-price-block__compare');
      const badge = context.querySelector('.product-price-block__badge');
      const skuBlock = context.querySelector('.product-sku-block');
      const skuValue = context.querySelector('.product-sku-block__value');
      const inventoryBlock = context.querySelector('.product-inventory-block');
      const inventoryText = context.querySelector('.product-inventory-block__text');
      const inventoryDot = context.querySelector('.product-inventory-block__dot');

      if (currentPrice) currentPrice.textContent = variant.price;

      if (comparePrice) {
        comparePrice.textContent = variant.comparePrice || '';
        comparePrice.hidden = !variant.comparePrice;
      }

      if (badge) {
        badge.hidden = !variant.discount;
        if (variant.discount && badge.dataset.content === 'percentage') {
          badge.textContent = `-${variant.discount}%`;
        }
      }

      if (skuBlock && skuValue) {
        skuValue.textContent = variant.sku || '';
        skuBlock.hidden = !variant.sku;
      }

      if (inventoryBlock && inventoryText && inventoryDot) {
        const threshold = Number(inventoryBlock.dataset.threshold || 10);
        const showQuantity = inventoryBlock.dataset.showQuantity === 'true';
        let status = 'in-stock';
        let label = inventoryBlock.dataset.inStockLabel;

        if (
          variant.inventoryManagement === 'shopify' &&
          variant.inventoryQuantity <= 0 &&
          variant.inventoryPolicy !== 'continue'
        ) {
          status = 'out-of-stock';
          label = inventoryBlock.dataset.outOfStockLabel;
        } else if (
          variant.inventoryManagement === 'shopify' &&
          variant.inventoryQuantity > 0 &&
          variant.inventoryQuantity <= threshold
        ) {
          status = 'low';
          label = showQuantity
            ? `${variant.inventoryQuantity} ${inventoryBlock.dataset.lowCountLabel}`
            : inventoryBlock.dataset.lowLabel;
        }

        inventoryText.textContent = label;
        inventoryDot.dataset.status = status;
      }

      this.dispatchEvent(
        new CustomEvent('variant:change', {
          bubbles: true,
          detail: { variant },
        }),
      );
    }
  }

  customElements.define('heysoap-variant-picker', HeysoapVariantPicker);
}
