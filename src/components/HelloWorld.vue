<template>
  <div class="container">
    <com-calendar
      :params="{
        chooseDayTextStart: chooseDate.startDate,
        chooseDayTextEnd: chooseDate.endDate,
        minDate: '2019-10-1',
        maxDate: '2020-1-1',
        id: 'aaaa'
      }"
      type="rangeDay"
      :activity-data="dataForCalendar"
      :holiday-data="holidayData"
      @chooseDate="getChooseDate"
      @changeDate="tapChangeDate"
      @hideChooseDate="hideChooseDate"
      v-if="showCalendar"
    ></com-calendar>

    <div @click="toogleCalendar">点击{{!showCalendar?'显示': '隐藏'}}日历</div>
    <div v-if="chooseDate">
      <span>{{chooseDate.startDate}}</span>
      <span v-if="chooseDate.endDate"> 至 {{chooseDate.endDate}}</span>
    </div>
  </div>
</template>

<script>
import comCalendar from '@/components/calendar'
import HolidayData from '@/plugs/holiday.data'

export default {
  name: 'HelloWorld',
  components: {
    comCalendar
  },
  data () {
    return {
      dataForCalendar: {},
      chooseDate: '',
      showCalendar: false,
      holidayData: HolidayData
    }
  },
  mounted () {
    let timestamp = new Date()
    this.dataForCalendar[timestamp.getFullYear()] = {}
    this.dataForCalendar[timestamp.getFullYear()][timestamp.getMonth() + 1] = [
      {day: '1', text: 'test1'},
      {day: '2', text: 'test2'},
      {day: '3', text: 'test3'},
      {day: '4', text: 'test4'},
      {day: '5', text: 'test5'}
    ]
  },
  methods: {
    getChooseDate (e) {
      console.log('选择日期结果：', e)
      this.chooseDate = e
    },

    tapChangeDate (e) {
      console.log('获取切换后的年月，使用此日期获取指定月份假日和特殊日期标记', e)
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
