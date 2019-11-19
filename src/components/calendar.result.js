class CalendarResultDate {
  /**

   * @param {String} params 2019-11-10

   */
  setForDate (params) {
    if (!this.startDate) {
      this.setStartTime(params)
      return
    }
    if (this.getLocalString(params.id) > this.getLocalString(this.startDate)) {
      this.endDate = params.id
    } else {
      this.setStartTime(params)
    }
  }

  setStartTime (params) {
    this.startDate = params.id
  }

  getLocalString (date) {
    return new Date(date).getTime()
  }

  get resetResult () {
    this.startDate = undefined
    this.endDate = undefined
    return this.resultVal
  }

  get resultVal () {
    return {
      startDate: this.startDate,
      endDate: this.endDate
    }
  }
}

export default CalendarResultDate
