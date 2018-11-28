<template>
  <div class="container">
    <com-calendar
      :params="{chooseDayText: chooseDate?chooseDate:null}"
      :activity-data="dataForCalendar"
      @chooseDate="getChooseDate"
      @changeDate="tapChangeDate"
      @hideChooseDate="hideChooseDate"
      v-if="showCalendar"
    ></com-calendar>

    <div @click="toogleCalendar">{{!showCalendar?'显示': '隐藏'}}日历</div>
  </div>
</template>

<script>
import comCalendar from '@/components/calendar'

export default {
  name: 'HelloWorld',
  components: {
    comCalendar
  },
  data () {
    return {
      dataForCalendar: {
        '2018': {
          '11': [
            {day: '1', text: 'test1'},
            {day: '2', text: 'test2'},
            {day: '3', text: 'test3'},
            {day: '4', text: 'test4'},
            {day: '5', text: 'test5'}
          ]
        }
      },
      chooseDate: '',
      showCalendar: false
    }
  },
  methods: {
    getChooseDate (e) {
      this.chooseDate = e.data
    },

    tapChangeDate (e) {
      console.log('切换后的年月', e)
    },

    toogleCalendar () {
      this.showCalendar = !this.showCalendar
    },

    hideChooseDate () {
      this.showCalendar = !this.showCalendar
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
