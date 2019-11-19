// 可以自由设置假期日期，对应日期会显示“休”
const Holiday = {
  '2019': {
    '10': [29, 30]
  }
}

let constHolidayData = () => {
  let now = new Date()
  Holiday[now.getFullYear()][now.getMonth() + 1] = [1, 3, 5, 10, 15]
}
constHolidayData()

export default Holiday
