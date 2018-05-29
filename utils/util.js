function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatDay2(year, month ,day, sep){
  var tsep = sep || '/';
  return [year, month, day].map(formatNumber).join(tsep);
}

function formatDay(date, sep) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var tsep = sep || '/';

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join(tsep);
}

module.exports = {
  formatTime: formatTime,
  formatDay: formatDay,
  formatDay2: formatDay2
}
