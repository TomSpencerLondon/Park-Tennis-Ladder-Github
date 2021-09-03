export function formatDate(d: string) {
  if (!d) return
  const date = new Date(d)
  var h = date.getHours()
  var m = date.getMinutes()
  var ampm = h >= 12 ? 'pm' : 'am'
  h = h % 12
  const hours = h ? h : 12 // the hour '0' should be '12'
  const minutes = m < 10 ? '0'+ new String(m) : new String(m)
  var strTime = hours + ':' + minutes + ' ' + ampm
  return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};