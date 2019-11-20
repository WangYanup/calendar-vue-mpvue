<template>
  <div class="calendar-container" v-if="showCalendar">
    <div class="calendar-bg" @click="hideCalendar({emitStatus: true})"></div>
    <div class="calendar-body"
      @touchstart="bindTouchStart"
      @touchend="bindTouchEnd"
    >
      <div class="calendar-title">
        <span class="calendar-title-cancle" @click="hideCalendar({emitStatus: true})">取消</span>
        <div class="calendar-title-choose">
          <span class="calendar-title-icon calendar-title-icon-left" @click="preMonth"></span>
          <span class="calendar-title-show"><span>{{year}} - {{month}}</span></span>
          <span class="calendar-title-icon calendar-title-icon-right" @click="nextMonth"></span>
        </div>
        <span class="calendar-title-confirm" @click="resetCalendar">重置</span>
      </div>
      <div class="calendar-week">
        <span v-for="(item, index) in week" :key="index" class="calendar-week-item"
          :class="{'calendar-week-item-holiday': index === 5 || index === 6}"
        >{{item}}</span>
      </div>
      <div class="calendar-day">
        <div v-for="(item, index) in dayData" :key="index" class="calendar-day-row">
          <div v-for="(day, dindex) in item" :key="dindex" class="calendar-day-item"
            :class="{
              'week-7': day!== '' && (dindex === 5 || dindex === 6),
              'calendar-disabled': day.disabled,
              'calendar-choose-range': day.timestamp >= chooseDayStartTimeStamp && day.timestamp <= chooseDayEndTimeStamp && type === 'rangeDay'
            } "
            :id="day.id"
            @click="chooseDate(day)"
          >
          <span class="calendar-day-item-num"
            v-if="day !== ''"
            :class="{
              'calendar-checked-default':chooseToday === day.id,
              'calendar-checked-start': chooseDayStart === day.id,
              'calendar-checked-end': chooseDayEnd === day.id
            }"
          >{{day.number}}</span>
          <span class="calendar-day-item-holiday" v-if="day.holiday">休</span>
          <span class="calendar-day-item-text" v-if="day !== ''">{{day.text?day.text:''}}</span>
          <span class="calendar-day-item-flag" :class="{'calendar-day-item-flag-checked': day.haveFlag}" v-if="day !== ''"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import CalendarResult from './calendar.result';
import ShowDayObject from './show.day';

export default {
  /***
   * 说明：日历组件，适用于vue,mpvue
   * 需求：node-sass, sass-loader (配置方式请百度)
   * 参数说明：
   * :params.id  可以在同一个页面使用多个此组件，返回日期的时候会携带id
   * :params.chooseDayTextStart  选择的日期 '2018-1-2'
   * :params.chooseDayTextEnd  选择的日期 '2018-1-2'
   * :params.minDate  最小选择日期 '2018-10-11'
   * :params.maxDate  最大选择日期 '2019-2-10'
   * :holidayData 假日日期设置
   * :activityData  有活动的日期显示flag圆点 {year:{ month:[]}} 月和日小于10不可以有0，01 =》1
   *
   * 函数说明：
   * @chooseDate  选择日期之后执行的函数 { data: ‘2018-11-28’, y: '2018', m: '11', d: '28', id: this.params.id};
   * @hideChooseDate  日历隐藏时执行函数
   * @changeDate  切换月份的时候执行函数，返回切换后的年月日。 { year: ‘2018’, month: ‘11’, day: ‘28’ };
   *
   * 问题解决：
   * 1.chinese-calendar.js 样式报错。
   * 解决： build/webpack.base.conf.js   rule > eslint-loader > 添加 exclude: [resolve('src/plugs')]
   *
   * 2. 默认是px单位，可以修改 $rpx: 1rpx; 变量改为 rpx
   **/
  name: 'comCalendar',
  props: {
    params: {
      type: Object
    },
    activityData: Object,
    holidayData: Object,
    type: {
      type: String,
      default: 'rangeDay' // default, rangeDay
    }
  },
  data () {
    return {
      todayObj: {},
      chooseDayStart: '', // 选择的日期
      chooseDayEnd: '',
      chooseToday: '',
      year: '',
      month: '',
      day: '', // 今日
      week: ['一', '二', '三', '四', '五', '六', '日'],
      dayData: [],
      limitMinDate: null,
      limitMaxDate: null,
      showCalendar: true,
      flagArr: null,
      checkedMonthFlagArr: null,
      touchObj: {},
      touchLimit: 30, // px
      calendarResult: null,
      result: {}
    };
  },
  watch: {
    activityData: {
      immediate: true,
      handler () {
        if (this.year && this.month) {
          this.constFlagArr();
        }
      }
    }
  },
  computed: {
    chooseDayStartTimeStamp (val) {
      if (this.chooseDayStart) {
        return new Date(this.chooseDayStart.replace('-', '/')).getTime();
      }
    },
    chooseDayEndTimeStamp (val) {
      if (this.chooseDayEnd) {
        return new Date(this.chooseDayEnd.replace('-', '/')).getTime();
      }
    }
  },
  mounted () {
    this.calendarResult = new CalendarResult({id: this.params.id});

    this.todayObj = {
      y: new Date().getFullYear(),
      m: new Date().getMonth() + 1,
      d: new Date().getDate()
    };

    this.chooseToday = this.todayObj.y + '-' + this.todayObj.m + '-' + this.todayObj.d;

    if (this.params.minDate) {
      this.limitMinDate = this.getSplitDate(this.params.minDate);
    }

    if (this.params.maxDate) {
      this.limitMaxDate = this.getSplitDate(this.params.maxDate);
    }

    if (this.params.chooseDayTextStart) {
      this.setChooseDay({start: this.params.chooseDayTextStart});
      this.setDateParams(this.getSplitDate(this.params.chooseDayTextStart));
    } else {
      this.setDateParams(this.todayObj);
    }

    if (this.params.chooseDayTextEnd) {
      this.setChooseDay({end: this.params.chooseDayTextEnd});
    }
  },
  methods: {
    getSplitDate (target) {
      return {
        y: target.split('-')[0] * 1,
        m: target.split('-')[1] * 1,
        d: target.split('-')[2] * 1
      }
    },

    setDateParams (obj) {
      this.setGlobalDate(obj);
      this.constFlagArr();
    },

    setGlobalDate (obj) {
      this.year = obj.y;
      this.month = obj.m;
      this.day = obj.d;
    },

    constFlagArr () {
      // 判断是否有需要特殊显示的日期
      if (this.activityData) {
        let flagYear = this.activityData[parseInt(this.year)];
        if (flagYear && flagYear[parseInt(this.month)]) {
          this.flagArr = flagYear[parseInt(this.month)];
        }
      }

      this.constShowDayData();
    },

    constShowDayData () {
      this.dayData = new ShowDayObject({
        year: this.year, 
        month: this.month, 
        flagArr: this.flagArr, 
        limitMaxDate: this.limitMaxDate, 
        limitMinDate: this.limitMinDate,
        holidayData: this.holidayData
      }).getVal();
    },

    preMonth () {
      this.setMonth(parseInt(this.month) - 1);
    },

    nextMonth () {
      this.setMonth(parseInt(this.month + 1));
    },

    setMonth (month) {
      let setDate = new Date(this.year, month - 1, this.day);
      let result = {
        y: setDate.getFullYear(),
        m: setDate.getMonth() + 1,
        d: setDate.getDate()
      };

      this.flagArr = null;
      this.setDateParams(result);
      this.$emit('changeDate', result);
    },

    chooseDate (params) {
      if (params.disabled) {
        return;
      }
      
      // 没有选择任何时间的时候，重置日历显示
      if (!this.calendarResult.resultVal.startDate) {
        this.setChooseDay({start: null, end: null});
      }

      // 设置时间
      this.calendarResult.setForDate(params);
      
      // 获取开始时间
      if (this.calendarResult.resultVal.startDate) {
        this.setChooseDay({start: this.calendarResult.resultVal.startDate});
      }
      
      // 选择某一天时
      if (this.type === 'default') {
        this.doneChooseDate();
        return;
      }
      
      // 选择时间范围
      if (this.calendarResult.resultVal.endDate) {
        this.setChooseDay({end: this.calendarResult.resultVal.endDate});
        this.doneChooseDate();
      }
    },

    setChooseDay ({start, end}) {
      if (start !== undefined) {
        this.chooseDayStart = start;
      }

      if (end !== undefined) {
        this.chooseDayEnd = end;
      }
    },

    doneChooseDate () {
      this.$emit('chooseDate', this.calendarResult.resultVal);
      this.hideCalendar({emitStatus: false});
    },

    resetCalendar () {
      this.setChooseDay({start: null, end: null});
      this.$emit('chooseDate', this.calendarResult.resetResult);
      this.hideCalendar({emitStatus: false});
    },

    hideCalendar (e) {
      this.showCalendar = false;
      if (e.emitStatus) {
        this.emitGetActivityParams();
      }
      this.$emit('hideChooseDate');
    },
 
    emitGetActivityParams () {
      if (!this.params.chooseDayTextStart) {
        return
      } 

      this.$emit('changeDate', {startDate: this.getSplitDate(this.params.chooseDayTextStart), endDate: this.getSplitDate(this.params.chooseDayTextEnd)});
    },

    bindTouchStart (e) {
      if (e.mp) {
        this.touchObj['start'] = e.mp.changedTouches[0].clientX;
      } else {
        this.touchObj['start'] = e.changedTouches[0].clientX;
      }
    },

    bindTouchEnd (e) {
      if (e.mp) {
        this.touchObj['end'] = e.mp.changedTouches[0].clientX;
      } else {
        this.touchObj['end'] = e.changedTouches[0].clientX;
      }

      if (this.touchObj.end - this.touchObj.start > this.touchLimit) {
        this.preMonth();
      } else
      if (this.touchObj.end - this.touchObj.start < -this.touchLimit) {
        this.nextMonth();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
  $rpx: 0.5px;
  $topic-color: #32DA31;
  $orange-color: #FFB62E;
  $weekday-color: #fff3dd;

  .calendar-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    z-index: 999;

    .calendar-bg {
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .calendar-body {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 30*$rpx 0;
      background-color: #ffffff;

      .calendar-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-flow: row nowrap;
        margin: 0 5%;

        .calendar-title-confirm {
          color: $topic-color;
          flex-shrink: 0;
        }

        .calendar-title-cancle {
          color: #515151;
          flex-shrink: 0;
        }

        .calendar-title-choose {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-flow: row nowrap;

          .calendar-title-icon {
            height: 40*$rpx;
            width: 40*$rpx;
            padding: 0 50*$rpx;
            flex-shrink: 0;
          }

          .calendar-title-icon-left {
            background: url('../assets/calendar_arrow_left.png') no-repeat 50% 50%;
            background-size: contain;
          }

          .calendar-title-icon-right {
            background: url('../assets/calendar_arrow_right.png') no-repeat 50% 50%;
            background-size: contain;
          }


          .calendar-title-show {
            flex-shrink: 0;
            span {
              font-weight: bold;
              margin-right: 10*$rpx;
            }
          }
        }
      }

      .calendar-week {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-flow: row nowrap;

        margin-top: 30*$rpx;
        padding-top: 20*$rpx;
        border-top: 1*$rpx solid #dcdcdc;

        .calendar-week-item {
          text-align: center;
          flex-basis: calc(100% / 7);
          padding: 10*$rpx 0;
          font-weight: bold;
        }

        .calendar-week-item-holiday {
          color: #9d9d9d;
        }
      }

      .calendar-day {
        .calendar-day-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-flow: row nowrap;

          .calendar-day-item {
            position: relative;
            text-align: center;
            flex-basis: calc(100% / 7);
            padding: 16*$rpx 0;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-flow: column nowrap;

            .calendar-day-item-num {
              width: 48*$rpx;
              height: 48*$rpx;
              text-align: center;
              line-height: 48*$rpx;
              border-radius: 100%;
              font-weight: bold;
            }

            .calendar-day-item-holiday {
              position: absolute;
              right: 8*$rpx;
              top: 40%;
              transform: translateY(-40%);
              font-size: 10px;
              color: $orange-color;
            }

            .calendar-day-item-text  {
              font-size: 10px;
              line-height:normal;
              height: 30*$rpx;
            }

            .calendar-day-item-flag {
              width: 10*$rpx;
              height: 10*$rpx;
              border-radius: 100%;
            }

            .calendar-day-item-flag-checked {
              background-color: $orange-color;
            }
          }

          .week-7 {
            background-color: $weekday-color;
          }

          .calendar-choose-range {
            background-color: #eaecc1;
          }

          .calendar-checked-default {
            background-color: $topic-color;
            color: #ffffff;
          }

          .calendar-checked-start {
            background-color: $orange-color;
            color: #ffffff;
          }

          .calendar-checked-end {
            background-color: $orange-color;
            color: #ffffff;
          }

          .calendar-disabled {
            opacity: 0.7;
          }
        }
      }
    }
  }
</style>
