// mixins/visitorStats.js
export default {
  data() {
    return {
      intervalId: null,
    };
  },
  methods: {
    async updateStats() {
      const API_KEY = "$2a$10$0YJ5m64rPDKqjTMOPfThP.3asrzy64YvDlFyM/rZAghcghIG7VoBe";
      const BIN_ID = "684dde4b8960c979a5a9f79f";
      const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
      const todayKey = 'visited-' + new Date().toISOString().slice(0, 10);
      let visitorId = sessionStorage.getItem('visitor-id');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        sessionStorage.setItem('visitor-id', visitorId);
      }

      try {
        const res = await fetch(API_URL, {
          headers: { 'X-Master-Key': API_KEY }
        });
        const json = await res.json();
        const stats = json.record || {
          total_visits: 0,
          today_visits: 0,
          visitors: []
        };

        const now = new Date();
        const nowISO = now.toISOString();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

        if (!localStorage.getItem(todayKey)) {
          stats.total_visits += 1;
          stats.today_visits += 1;
          localStorage.setItem(todayKey, 'true');
        }

        stats.visitors = (stats.visitors || []).filter(v => v.timestamp > fiveMinutesAgo);
        const existing = stats.visitors.find(v => v.id === visitorId);
        if (existing) {
          existing.timestamp = nowISO;
        } else {
          stats.visitors.push({ id: visitorId, timestamp: nowISO });
        }

        if (process.client) { // Ensure DOM manipulation only happens on the client-side
          document.getElementById('total-visitor').innerText = stats.total_visits;
          document.getElementById('today-visitor').innerText = stats.today_visits;
          document.getElementById('online-user').innerText = stats.visitors.length;
        }


        await fetch(API_URL, {
          method: 'PUT',
          headers: {
            'X-Master-Key': API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(stats)
        });

      } catch (error) {
        console.error('Gagal update statistik:', error);
        if (process.client) {
          document.getElementById('total-visitor').innerText = 'Gagal';
          document.getElementById('today-visitor').innerText = 'Gagal';
          document.getElementById('online-user').innerText = 'Gagal';
        }
      }
    }
  },
  mounted() {
    // This is handled in each page component that uses this mixin
  },
  beforeDestroy() {
    // This is handled in each page component that uses this mixin
  }
};


const apiKey = import.meta.env.VITE_JSONBIN_API_KEY;

fetch('https://api.jsonbin.io/v3/b/684dde4...', {
  method: 'GET',
  headers: {
    'X-Master-Key': apiKey,
    'Content-Type': 'application/json'
  }
})
