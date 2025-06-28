<template>
  <main>
    <section class="product-section container">
      <div class="product-content">
        <h2 id="product-title">{{ currentProduct.title }}</h2>

        <div class="product-model">
          <button class="arrow-btn left" @click="prevProduct">‹</button>

          <model-viewer
            id="model"
            :src="currentProduct.model"
            :alt="currentProduct.title"
            auto-rotate
            camera-controls
            ar
            @error="console.log('Gagal memuat model')"
            style="width: 100%; height: 550px; background-color: #eee; border-radius: 12px;">
          </model-viewer>

          <button class="arrow-btn right" @click="nextProduct">›</button>
        </div>

        <div class="product-info">
          <p id="product-main-description">{{ currentProduct.description }}</p>

          <div class="product-spec-list" v-if="currentProduct.specs && currentProduct.specs.length > 0">
            <h4>Spesifikasi:</h4>
            <ul>
              <li v-for="(spec, i) in currentProduct.specs" :key="i">{{ spec }}</li>
            </ul>
          </div>

          <div class="product-actions-and-thumbs">
            <div class="product-thumbnails">
              </div>
            <a href="https://wa.me/+6287801319313" class="btn-primary"><img src="/static/assets/icon/WA.png" alt="WhatsApp Icon" class="btn-icon-img"> hubungi kami</a>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats'; // Import the mixin

export default {
  name: 'ProdukPage',
  mixins: [visitorStats], // Use the mixin for visitor stats
  head() {
    return {
      script: [
        {
          src: "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js",
          type: "module",
          body: true // Or head: true depending on where you want it loaded
        }
      ]
    }
  },
  data() {
    return {
      products: [
        
      {
          title: "Adaptor Knalpot Motor",
          model: "/assets/Product/KomponenKnalpot3Lobang.glb",
          description: "Aksesoris pendukung knalpot motor, berfungsi sebagai sambungan atau penghubung antara bagian knalpot dengan komponen lainnya.",
          specs: [
            "Bahan: Plat baja",
            "Tebal Bahan: 3,5 mm",
            "Diameter: 8 cm",
            "Harga Satuan: Rp3.500,-"
          ],
        },
        {
          title: "Plendes Mii",
          model: "/assets/Product/ppp.glb",
          description: "Komponen perlengkapan knalpot motor, berfungsi sebagai sambungan atau dudukan knalpot agar terpasang dengan presisi.",
          specs: [
            "Bahan: Plat besi",
            "Tebal Bahan: 3,2 mm",
            "Ukuran: 8 cm x 4 cm",
            "Harga Satuan: Rp1.750,-"
          ],
        },
        {
          title: "Matahari",
          model: "/assets/Product/kb.glb",
          description: "Ornamen logam berbentuk matahari dengan desain gelombang elegan, cocok digunakan sebagai hiasan pada pagar, pintu gerbang, atau dekorasi eksterior lainnya.",
          specs: [
            "Bahan: Plat galvanis ",
            "Tebal Bahan: 0,6 mm",
            "Diameter: 6,5 cm",
            "Harga Satuan: Rp 1.000 / pcs "
          ],
        },
        {
          title: "Ring Bintang 8",
          model: "/assets/Product/bintang.glb",
          description: "Ornamen untuk pagar, teralis, atau dekorasi lainnya.",
          specs: [
            "Bahan: Plat besi galvanis",
            "Tebal Bahan:  0,6 mm",
            "Diameter: 10 cm",
            "Harga Satuan: Rp1.800,-"
          ],
        },
        {
          title: "Tombak Keraton",
          model: "/assets/Product/UjungPagar.glb",
          description: "Ornamen dekoratif berbentuk tombak untuk ujung pagar, memberikan tampilan yang elegan dan klasik. Cocok untuk memperindah desain pagar besi.",
          specs: [
            "Bahan: Plat besi",
            "Tebal Bahan: 0,6 mm",
            "Ukuran: 12 cm x 6 cm",
            "Harga Satuan: Rp1.100,-"
          ],
        },
        {
          title: "End Muffler Knalpot Variasi",
          model: "/assets/Product/KomponenKnalpotkykmangkok.glb",
          description: "Tingkatkan tampilan dan performa kendaraan Anda dengan End Muffler Knalpot Variasi berkualitas tinggi.",
          specs: [
            "Bahan: Plat Galvanis",
            "Tebal Bahan: 1 mm",
            "Diameter Luar: ±6 cm",
            "Diameter Lubang Dalam: ±3,5 cm",
            "Panjang (Depth): ±6 cm",
            "Warna: Abu-abu metalik",
            "Harga: Rp10.000 / pcs"
          ],
        },
        {
          title: "Nako Letter S",
          model: "/assets/Product/KomponenPagarS.glb",
          description: "Teralis Nako S adalah ornamen besi berbentuk spiral elegan yang digunakan untuk memperindah pagar, jendela, maupun pintu teralis.",
          specs: [
            "Bahan: Besi Nako",
            "Ketebalan: 9,3 mm",
            "Ukuran Tersedia: 15 x 11 cm, 20 x 11 cm, 25 x 11 cm",
            "Harga: Rp17.000 / kg"

          ],
        },
        {
          title: "Nako Letter C",
          model: "/assets/Product/kuda.glb",
          description: "Nako Letter C adalah ornamen besi berbentuk lengkungan menyerupai huruf C yang digunakan sebagai elemen dekoratif dan struktural pada pagar, jendela, maupun pintu teralis.",
          specs: [
            "Bahan: Besi Nako",
            "Ketebalan: 9,3 mm",
            "Ukuran Tersedia: 12 x 8 cm, 10 x 6,5 cm, 20 x 11 cm",
            "Harga: Rp17.000 / kg"

          ],
        },
        {
          title: "Tangki Oli Dump Truck",
          model: "/assets/Product/TangkiKotak.glb",
          description: "Tangki Oli Dump Truck ini dirancang khusus sebagai wadah oli hidrolik untuk kendaraan dump truck. ",
          specs: [
            "Bahan: Plat Besi",
            "Tebal Plat: 2 mm",
            "Kapasitas: 20 liter",
            "Tutup: Aluminium",
            "Pipa Keluar/Masuk: Pipa kecil: diameter 19 mm, Pipa besar: diameter 32 mm",
            "Ukuran Tangki: Panjang: 28 cm, Lebar: 30 cm, Tinggi: 25 cm",
            "Harga Satuan: Rp375.000"

          ],
        },
        {
          title: "Tangki Oli Bulat Dump Truck",
          model: "/assets/Product/TangkiBulat.glb",
          description: "Tangki Oli Bulat Dump Truck ini dirancang untuk menampung oli hidrolik pada kendaraan dump truck dalam skala kecil hingga menengah. ",
          specs: [
            "Bahan: Plat baja",
            "Tebal bahan: 2 mm",
            "Kapasitas: 5 – 6 liter",
            "Bentuk: Silinder (bulat)",
            "Perkiraan Ukuran Tangki:",
            "(Estimasi berdasarkan bentuk dan kapasitas umum)",
            "• Diameter: ± 15 – 20 cm",
            "• Tinggi: ± 15 – 25 cm",
            "Harga Satuan:  Rp. 275.000"

          ],
        }
      ],
      currentIndex: 0
    };
  },
  computed: {
    currentProduct() {
      return this.products[this.currentIndex];
    }
  },
  methods: {
    nextProduct() {
      this.currentIndex = (this.currentIndex + 1) % this.products.length;
    },
    prevProduct() {
      this.currentIndex = (this.currentIndex - 1 + this.products.length) % this.products.length;
    }
  },
  mounted() {
    this.updateStats(); // Call updateStats when the component is mounted
    this.intervalId = setInterval(this.updateStats, 30000); // Set up interval
  },
  beforeDestroy() {
    clearInterval(this.intervalId); // Clear interval when component is destroyed
  }
}
</script>

<style>
.lokasi-info .btn-primary {
  display: none;
}
</style>