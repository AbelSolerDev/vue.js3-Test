const API = "https://api.github.com/users/";

const requestMaxTimeMs = 3200;

const app = Vue.createApp({
  // opciones de la aplicación
  data() {
    return {
      message: "Search GitHub users",
      search: null,
      result: null,
      error: null,
      favorites: new Map(),
    };
  },
  created() {
    const savedFavorites = JSON.parse(window.localStorage.getItem("favorites"));
    if (savedFavorites?.length) {
      const favorites = new Map(
        savedFavorites.map((favorite) => [favorite.login, favorite])
      );
      this.favorites = favorites;
    }
  },
  computed: {
    isFavorite() {
      return this.favorites.has(this.result.login);
    },
    allfavorites() {
      return Array.from(this.favorites.values());
    },
  },
  methods: {
    async doSearch() {
      this.result = this.error = null;
      const foundinFavorites = this.favorites.get(this.search);
      const shouldRequestAgain = (() => {
        if (!!foundinFavorites) {
          const { lastRequestTime } = foundinFavorites;
          const now = Date.now();
          return now - lastRequestTime > requestMaxTimeMs;
        }
        return false;
      })(); // IIFE
      if (!!foundinFavorites && !shouldRequestAgain) {
        // !! versión Pro para convertir algo en su versión booleana
        console.log("Found and we use the cached version");
        return (this.result = foundinFavorites);
      }
      try {
        console.log("Not found or cached version is too old");
        const response = await fetch(API + this.search);
        if (!response.ok) throw new Error("User not found");
        const data = await response.json();
        console.log(data);
        this.result = data;
        foundinFavorites.lastRequestTime = Date.now();
      } catch (error) {
        this.error = error;
      } finally {
        this.search = null;
      }
    },
    addFavorite() {
      this.result.lastRequestTime = Date.now();
      if (this.result && !this.favorites.has(this.result.login)) {
        this.favorites.set(this.result.login, this.result);
      }
      this.updateStorage();
    },
    removeFavorite() {
      this.favorites.delete(this.result.login);
      this.updateStorage();
    },
    showFavorite(favorite) {
      this.result = favorite;
    },
    checkFavorite(id) {
      return this.result?.login === id;
    },

    updateStorage() {
      window.localStorage.setItem(
        "favorites",
        JSON.stringify(this.allfavorites)
      );
    },
  },
});

// Asigna el valor de app.mount("#app") a la variable global
const mountedApp = app.mount("#app");
