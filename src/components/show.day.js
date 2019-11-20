import Calendar from '@/plugs/chinese-calendar'

let FlagArr = null
let LimitMinDate = null
let LimitMaxDate = null
let HolidayData = null

class ShowDayObjectList {
  constructor ({year, month, flagArr, limitMaxDate, limitMinDate, holidayData}) {
    this.year = year
    this.dayData = []

    // 构造每行的数据是用到的参数
    this.month = month
    this.setGlobalArgements({flagArr, limitMaxDate, limitMinDate, holidayData})
    this.init()
  }

  setGlobalArgements ({flagArr, limitMaxDate, limitMinDate, holidayData}) {
    FlagArr = flagArr
    LimitMinDate = limitMinDate
    LimitMaxDate = limitMaxDate
    HolidayData = holidayData
  }

  init () {
    let row = []
    for (let index = 1; index < 42; index++) { // 7 * 5line
      let day = new Date(this.year, this.month - 1, index)
      row = new ShowDayRow({
        day,
        index,
        row,
        inputMonth: this.month
      }).getResult()

      if (row.length % 7 === 0) {
        // 第六行如果第一个数据是空，则不添加到结果中
        if (index > 35 && row[0] === '') {
          row = []
          return
        }
        this.dayData.push(row)
        row = []
      }
    }
  }

  getVal () {
    return this.dayData
  }
}

class ShowDayRow {
  constructor ({day, index, row, inputMonth}) {
    this.result = row
    this.month = inputMonth

    let weekDay = day.getDay()
    let month = day.getMonth() + 1
    let monthDay = day.getDate()
    let year = day.getFullYear()
    let str = `${year}-${month}-${monthDay}`

    let obj = {
      text: null,
      id: str,
      timestamp: day.getTime(),
      number: null,
      disabled: false,
      haveFlag: false
    }
    this.setHaveFlag({obj, monthDay})
    this.setHoliday({year, month, monthDay, obj})
    this.setLunarCalendar({year, month, monthDay, obj})
    this.setMinDateStatus({year, month, monthDay, obj})
    this.setMaxDateStatus({year, month, monthDay, obj})
    this.constMonthData({weekDay, month, monthDay, obj, i: index})
  }

  setHaveFlag ({obj, monthDay}) {
    // 判断是否突出显示当天日期，例如当天有活动
    if (!FlagArr) {
      return
    }
    FlagArr.some(item => {
      if (parseInt(item.day) === monthDay) {
        obj.haveFlag = true
        return true
      }
    })
  }

  setHoliday ({year, month, monthDay, obj}) {
    // 判断是否为假期
    if (!HolidayData || !HolidayData[year] || !HolidayData[year][month]) {
      return
    }

    let holidayArr = HolidayData[year][month]
    if (holidayArr.length === 0) {
      return
    }

    if (holidayArr.indexOf(monthDay) > -1) {
      obj.holiday = true
    }
  }

  setLunarCalendar ({year, month, monthDay, obj}) {
    // 农历显示
    let calendarTextObj = Calendar.solar2lunar(year, month, monthDay)
    // 有节日
    if (calendarTextObj.festival.length > 0) {
      obj.text = calendarTextObj.festival[0]
      return
    }

    if (calendarTextObj.IDayCn === '初一') {
      obj.text = calendarTextObj.IMonthCn
      return
    }

    // 无节日
    obj.text = calendarTextObj.IDayCn
  }

  setMinDateStatus ({year, month, monthDay, obj}) {
    // 限制选取最小日期
    if (!LimitMinDate) {
      return
    }
    if (year > LimitMinDate.y) {
      return
    }
    if (year < LimitMinDate.y) {
      obj.disabled = true
      return
    }
    if (month > LimitMinDate.m) {
      return
    }
    if (month < LimitMinDate.m) {
      obj.disabled = true
      return
    }
    if (monthDay < LimitMinDate.d) {
      obj.disabled = true
    }
  }

  setMaxDateStatus ({year, month, monthDay, obj}) {
    // 限制选取最大日期
    if (!LimitMaxDate) {
      return
    }
    if (year > LimitMaxDate.y) {
      obj.disabled = true
      return
    }
    if (year < LimitMaxDate.y) {
      return
    }
    if (month > LimitMaxDate.m) {
      obj.disabled = true
      return
    }
    if (month < LimitMaxDate.m) {
      return
    }

    if (monthDay > LimitMaxDate.d) {
      obj.disabled = true
    }
  }

  constMonthData ({weekDay, month, monthDay, obj, i}) {
    // 构造本月的日历数据
    if (month !== this.month) {
      this.result.push('')
      return
    }

    if (i !== 1) {
      obj.number = monthDay
      this.result.push(obj)
      return
    }

    // 如果第一天的日期，
    // @d 用于控制第一天显示的星期 （d = 0 开头为星期日 / d = 1 开头为星期一）
    for (let d = 1; d < weekDay; d++) {
      this.result.push('')
    }

    obj.number = monthDay
    this.result.push(obj)
  }

  getResult () {
    return this.result
  }
}

export default ShowDayObjectList
