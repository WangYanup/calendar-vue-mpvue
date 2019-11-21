import Calendar from '@/plugs/chinese-calendar'

let showDayGolbal = {}
export const setCalendarGlobalParams = (objects) => {
  showDayGolbal = Object.assign(showDayGolbal, objects)
}

class ShowDayObjectList {
  constructor ({year, month}) {
    this.year = year
    this.month = month
    this.dayData = []
    this.row = []
    this.init()
  }

  init () {
    for (let index = 1; index < 42; index++) { // 7 * 5line
      let day = new Date(this.year, this.month - 1, index)
      this.row = new ShowDayRow({
        day,
        index,
        row: this.row,
        inputMonth: this.month
      }).getResult()

      this.setRowData({index})
    }
  }

  setRowData ({index}) {
    if (this.row.length % 7 !== 0) {
      return
    }
    // 第六行如果第一个数据是空，则不添加到结果中
    if (index > 35 && this.row[0] === '') {
      this.row = []
      return
    }

    this.dayData.push(this.row)
    this.row = []
  }

  getVal () {
    return this.dayData
  }
}

class ShowDayRow {
  constructor ({day, index, row, inputMonth}) {
    this.result = row
    this.monthDay = day.getDate()
    this.resultMonth = day.getMonth() + 1
    this.resultYear = day.getFullYear()
    this.obj = {
      text: null,
      id: `${this.resultYear}-${this.resultMonth}-${this.monthDay}`,
      timestamp: day.getTime(),
      number: null,
      disabled: false,
      haveFlag: false
    }

    this.setHaveFlag()
    this.setHoliday()
    this.setLunarCalendar()
    this.setMinDateStatus()
    this.setMaxDateStatus()
    this.constMonthData({weekDay: day.getDay(), index, inputMonth})
  }

  // 判断是否突出显示当天日期，例如当天有活动
  setHaveFlag () {
    if (!showDayGolbal.flagArr) {
      return
    }
    showDayGolbal.flagArr.some(item => {
      if (parseInt(item.day) === this.monthDay) {
        this.obj.haveFlag = true
        return true
      }
    })
  }

  // 判断是否为假期
  setHoliday () {
    if (!showDayGolbal.holidayData || !showDayGolbal.holidayData[this.resultYear] || !showDayGolbal.holidayData[this.resultYear][this.resultMonth]) {
      return
    }

    let holidayArr = showDayGolbal.holidayData[this.resultYear][this.resultMonth]
    if (holidayArr.length === 0) {
      return
    }

    if (holidayArr.indexOf(this.monthDay) > -1) {
      this.obj.holiday = true
    }
  }

  setLunarCalendar () {
    // 农历显示
    let calendarTextObj = Calendar.solar2lunar(this.resultYear, this.resultMonth, this.monthDay)
    // 有节日
    if (calendarTextObj.festival.length > 0) {
      this.obj.text = calendarTextObj.festival[0]
      return
    }

    if (calendarTextObj.IDayCn === '初一') {
      this.obj.text = calendarTextObj.IMonthCn
      return
    }

    // 无节日
    this.obj.text = calendarTextObj.IDayCn
  }

  setMinDateStatus () {
    // 限制选取最小日期
    if (!showDayGolbal.limitMinDate) {
      return
    }
    let targetDate = this.getTimestamp({y: this.resultYear, m: this.resultMonth, d: this.monthDay})
    let limitDate = this.getTimestamp({y: showDayGolbal.limitMinDate.y, m: showDayGolbal.limitMinDate.m, d: showDayGolbal.limitMinDate.d})
    if (targetDate < limitDate) {
      this.obj.disabled = true
    }
  }

  setMaxDateStatus () {
    // 限制选取最大日期
    if (!showDayGolbal.limitMaxDate) {
      return
    }
    let targetDate = this.getTimestamp({y: this.resultYear, m: this.resultMonth, d: this.monthDay})
    let limitDate = this.getTimestamp({y: showDayGolbal.limitMaxDate.y, m: showDayGolbal.limitMaxDate.m, d: showDayGolbal.limitMaxDate.d})
    if (targetDate > limitDate) {
      this.obj.disabled = true
    }
  }

  getTimestamp ({y, m, d}) {
    return new Date(y, m - 1, d).getTime()
  }

  constMonthData ({weekDay, index, inputMonth}) {
    // 构造本月的日历数据
    if (this.resultMonth !== inputMonth) {
      this.result.push('')
      return
    }

    if (index !== 1) {
      this.obj.number = this.monthDay
      this.result.push(this.obj)
      return
    }

    this.setMonthFirstDay(weekDay)
  }

  // 如果第一天的日期
  // @d 用于控制第一天显示的星期 （d = 0 开头为星期日 / d = 1 开头为星期一）
  setMonthFirstDay (weekDay) {
    for (let d = 1; d < weekDay; d++) {
      this.result.push('')
    }

    this.obj.number = this.monthDay
    this.result.push(this.obj)
  }

  getResult () {
    return this.result
  }
}

export default ShowDayObjectList
