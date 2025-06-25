<template>
  <footer class="footer">
    <div class="footer-container container">
      <p>© Sumber Alam Raya {{ currentYear }}</p>
      <NuxtLink to="/faq" class="faq-link">
        FAQ <span style="font-weight: bold;">?</span>
      </NuxtLink>
    </div>
  </footer>
</template>

<script>
// Visitor statistics logic will be handled within the page components or a plugin for better Nuxt integration.
// For now, this component just provides the HTML structure.
</script>