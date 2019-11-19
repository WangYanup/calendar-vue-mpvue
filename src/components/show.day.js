import Calendar from '@/plugs/chinese-calendar'
import HolidayData from '@/plugs/holiday.data'

class ShowDayObjectList {
  constructor ({year, month, flagArr, limitMaxDate, limitMinDate}) {
    this.year = year
    this.month = month
    this.flagArr = flagArr
    this.limitMinDate = limitMinDate
    this.limitMaxDate = limitMaxDate
    this.dayData = []
    this.init()
  }

  setHaveFlag ({obj, monthDay}) {
    // 判断是否突出显示当天日期，例如当天有活动
    if (this.flagArr) {
      for (let i = 0; i < this.flagArr.length; i++) {
        if (parseInt(this.flagArr[i].day) === monthDay) {
          obj.haveFlag = true
          break
        }
      }
    }
  }

  setHoliday ({year, month, monthDay, obj}) {
    // 判断是否为假期
    if (HolidayData[year] && HolidayData[year][month]) {
      let holidayArr = HolidayData[year][month]
      if (holidayArr.length > 0) {
        for (let i = 0; i < holidayArr.length; i++) {
          if (holidayArr[i] === monthDay) {
            obj.holiday = true
            break
          }
        }
      }
    }
  }

  setLunarCalendar ({year, month, monthDay, obj}) {
    // 农历显示
    let calendarTextObj = Calendar.solar2lunar(year, month, monthDay)
    if (calendarTextObj.festival.length > 0) {
      obj.text = calendarTextObj.festival[0]
    } else
    if (calendarTextObj.IMonthCn && calendarTextObj.IDayCn) {
      if (calendarTextObj.IDayCn === '初一') {
        obj.text = calendarTextObj.IMonthCn
      } else {
        obj.text = calendarTextObj.IDayCn
      }
    }
  }

  setMinDate ({year, month, monthDay, obj}) {
    // 限制选取最小日期
    if (this.limitMinDate && (year < this.limitMinDate.y ||
      (year === this.limitMinDate.y && month < this.limitMinDate.m) ||
      (year === this.limitMinDate.y && month === this.limitMinDate.m && monthDay < this.limitMinDate.d))
    ) {
      obj.disabled = true
    }
  }

  setMaxDate ({year, month, monthDay, obj}) {
    // 限制选取最大日期
    if (this.limitMaxDate && (year > this.limitMaxDate.y ||
      (year === this.limitMaxDate.y && month > this.limitMaxDate.m) ||
      (year === this.limitMaxDate.y && month === this.limitMaxDate.m && monthDay > this.limitMaxDate.d))
    ) {
      obj.disabled = true
    }
  }

  init () {
    let row = []
    for (let i = 1; i < 42; i++) { // 7 * 5line
      let day = new Date(this.year, this.month - 1, i)
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
      this.setMinDate({year, month, monthDay, obj})
      this.setMaxDate({year, month, monthDay, obj})

      // 构造本月的日历数据
      if (month === this.month) {
        if (i === 1) {
          // 判断第一天的日期，
          // @d 用于控制第一天显示的星期 （d = 0 开头为星期日 / d = 1 开头为星期一）
          for (let d = 1; d < weekDay; d++) {
            row.push('')
          }

          obj.number = monthDay
          row.push(obj)
        } else {
          obj.number = monthDay
          row.push(obj)
        }
      } else {
        row.push('')
      }

      if (row.length % 7 === 0) {
        if (i > 35 && row[0] === '') {
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
export default ShowDayObjectList
