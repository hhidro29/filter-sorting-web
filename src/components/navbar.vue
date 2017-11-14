<template lang="html">
  <div class="">
    <b-row class="container center">
      <b-col class="filter-section">
        <span class="filter-header">Filter</span>
        <li v-for="(active,n) in menus" @click="setMenu(n, active)" :class="{'filter-active':active}">{{n}}</li>
        <b-nav-item-dropdown text="Sorting" right class="dropdown-nav-b">
          <b-dropdown-item v-for="(status,item) in sort" @click="selectSort(item, status.status)" :class="{ 'sort-active': status.status}">{{status.name}}</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-col>
    </b-row>
    <b-row class="container center">
      <b-col>
        <menu v-for="(options, filter) in filters" class="tag-keys" :key="filter" v-show="menus[filter]" ref="">
          <template v-if="filter === 'rating'">
            <div class="rating-container">
              <p>Minimum Rating: {{ parseFloat(filters.rating).toFixed(1) }}</p>
              <input v-model="filters.rating" type="range" :min="rating.min" :max="rating.max" step="0.1" class="slider"/>
            </div>
          </template>
          <template v-else>
            <label v-for="(active, option) in options" class="tag-content" :class="{ 'tag-content-active': active }" @click="setFilter(filter, option)">
              {{ option }}
            </label>
          </template>
        </menu>
      </b-col>
    </b-row>
    <b-row class="container center">
      <b-col cols="4" v-for="n in list" class="cols-container">
      <card :companies="n"></card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Vue from 'vue'

Vue.component('card',{
  props:{
    companies: Object
  },
  template: `
      <b-card style="margin: 10px 10px" class="mb-2 card-container">
        <div class="headercard" slot="header">
          <img src="https://lorempixel.com/600/300/food/5/" alt="img" class="profile-photo">
          <h4>{{ companies.name }}</h4>
          <h6>{{ companies.slogan }}</h6>
          <label v-for="item in companies.keywords" class="keywords-container">{{ item }}</label>
        </div>
        <b-row>
          <b-col class="country-section">
            <label>Country</label>
            <h6>{{ companies.country }}</h6>
          </b-col>
          <b-col class="rate-section">
            <label>Rate</label>
            <p>{{ companies.rating }}/10</p>
          </b-col>
        </b-row>
      </b-card>
  `
})

export default {
  data() {
    return {
      companies:[],
      filters:{ countries: {}, categories: {}, rating: 0 },
      //sort:{acc:false, des:false, countries:false, rating: false},
      sort:{
        acc:{
          name:"Urutkan dari A-Z",
          status: false
        },
        des:{
          name:"Urutkan dari Z-A",
          status: false
        },
        countries:{
          name:"Urutkan Berdasarkan Negara",
          status: false
        },
        rating: {
          name:"Urutkan Berdasarkan Rating",
          status: false
        }
      },
      menus: { countries: false, categories: false, rating: false },
      rating: { max:0, min:10}
    }
  },
  computed:{
    activeMenu() {
      return Object.keys(this.menus).reduce(($$, set, i) => (this.menus[set]) ? i : $$, -1)
    },

    list(){
      let {countries, categories} = this.selectingFilter
      let company = this.sortList

      return company.filter(({country, keywords, rating}) => {
        if (rating < this.filters.rating) return false
        if (countries.length && !~countries.indexOf(country)) return false
        return !categories.length || categories.every(cat => ~keywords.indexOf(cat))
      })
    },

    selectingFilter(){
      let {countries, categories} = this.filters

      return{
        countries: Object.keys(countries).filter(i => countries[i]),
        categories: Object.keys(categories).filter(i => categories[i])
      }
    },

    sortList(){
      var comp = Object.create(this.companies)
      // this.companies.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)})
      if (this.sort.acc.status === true) {
        comp.sort((a,b) => {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)})
      }else if (this.sort.des.status === true) {
        comp.sort((a,b) => {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)})
        comp.reverse()
      }else if (this.sort.countries.status === true) {
        comp.sort((a,b) => {return (a.country > b.country) ? 1 : ((b.country > a.country) ? -1 : 0)})
      }else if (this.sort.rating.status === true) {
        comp.sort((a,b) => {return parseFloat(a.rating) - parseFloat(b.rating)})
        comp.reverse()
      }else {
        comp = this.companies
      }
      return comp
    }
  },

  methods: {
    setFilter(filter, option){
      if (filter === 'countries') {
        this.filters[filter][option] = !this.filters[filter][option]
      } else {
        this.clearFilter(filter, option, this.filters[filter][option])
      }
    },

    clearFilter(filter, except, active) {
      if (filter === 'rating') {
        this.filters[filter] = this.rating.min
      } else {
        Object.keys(this.filters[filter]).forEach(option => {
          this.filters[filter][option] = except === option && !active
        })
      }
    },

    setMenu(menu, active){
      Object.keys(this.menus).forEach(a => this.menus[a] =!active && a === menu)
    },

    selectSort(menu, active){
      Object.keys(this.sort).forEach(a => this.sort[a].status =!active && a === menu)
    }
  },
  beforeMount() {
    fetch('https://s3-us-west-2.amazonaws.com/s.cdpn.io/450744/mock-data.json')
      .then(response => response.json())
      .then(data => {
        this.companies = data

          data.forEach(({country, keywords, rating}) =>{
            this.$set(this.filters.countries, country, false)

            if (this.rating.max < rating) {
              this.rating.max = rating
            }
            if (this.rating.min > rating ) {
              this.rating.min = rating
              this.filters.rating = rating
            }

            keywords.forEach(category =>
              this.$set(this.filters.categories, category, false)
            )
        })
      })
  }
}
</script>

<style lang="css">
  li{
    list-style-type: none;
  }

  p{
    font-size: 14px;
    text-align: center;
  }

  .slider {
    vertical-align: middle;
    -webkit-appearance: none;
    width: 100%;
    height: 5px;
    background: rgba(0,0,0,0.1);
    outline: none;
    -webkit-transition: .2s;
    transition: opacity .2s;
}

.slider:hover,.slider:active {
    opacity: 1;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    background: rgba(43,186,145,1);
    cursor: pointer;
}

.slider::-moz-range-thumb {
    border-radius: 50%;
    width: 20px;
    height: 20px;
    background: rgba(43,186,145,1);
    cursor: pointer;
}

  .sort-active, .sort-active:hover, .sort-active:focus{
      color: rgba(43,186,145,1);
  }

  .rating-container{
    margin: auto;
    width: 50%;
  }

  .dropdown-nav-b{
    padding: 0;
    min-width: 200px;
    margin-left: auto;
  }

  .dropdown-toggle span{
    color: black;
  }

  .dropdown-toggle a{
    color: rgba(43,186,145,1);
  }

  .tag-content-active{
    color: white;
    background-color: rgba(43,186,145,1);
    transition: 0.3s;
  }

  .tag-content{
    margin-right: 0.4rem;
    border: 1px solid rgba(0,0,0,0.3);
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 1rem;
    cursor: pointer;
  }

  .tag-keys{
    text-align: left;
  }

  .cols-container{
    text-align: center;
  }

  .filter-section{
    margin: 0;
    display: flex;
    padding-left: 1rem;
    padding-bottom: 1rem;
    margin: 1rem 0;
    border-bottom: 1px solid rgba(0,0,0,0.3);
  }

  .filter-active{
    color: rgba(43,186,145,1);
  }

  .filter-section .filter-header{
    margin-right: 1rem;
    color: rgba(0, 0, 0, 0.2);
  }

  .filter-section li{
    margin-right: 1rem;
    vertical-align: middle;
    cursor: pointer;
  }

  .filter-section li:hover{
    color: rgba(43,186,145,1);
    transition: 0.3s;
  }

  .keywords-container{
    border: 1px solid black;
    font-size: 12px;
    margin: 2px 2px;
    padding: 1px 10px;
    border-radius: 10px;
  }
  .headercard{
    min-height: 300px;
  }

  .card-container{
    border-radius: 10px;
    transition: 0.3s ease-in;
  }
  .rate-section{
    display: inline;
  }

  .rate-section label{
    margin: 0;
  }

  .country-section{
    text-align: left;
  }

  .country-section label{
    margin: 0;
  }

  .country-section p{
    font-size: 16px;
    font-weight: bold;
  }

  .profile-photo{
    height: 100px;
    width: 100px;
    border-radius: 50%;
    margin: 10px auto;
  }
  .container{
    vertical-align: middle;
  }
  .center{
    margin: auto;
  }

  @media screen and (max-width: 1091px) {
    .cols-container{
      flex: 0 0 50%;
      max-width: 50%;
    }
  }

  @media screen and (max-width: 845px) {
    .cols-container{
      flex: 0 0 100%;
      max-width: 100%;
    }
  }
</style>
