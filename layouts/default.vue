<template>
  <div>
    <Header />
    <MobileNav />
    <slot /> <ContactSection /> <Footer /> </div>
</template>

<script>
import Header from '~/components/Header.vue'
import MobileNav from '~/components/MobileNav.vue'
import ContactSection from '~/components/ContactSection.vue'
import Footer from '~/components/Footer.vue'

export default {
  components: {
    Header,
    MobileNav,
    ContactSection,
    Footer
  },
}
</script>

<style>
/* You might want to move global styles here or in nuxt.config.js */
</style>