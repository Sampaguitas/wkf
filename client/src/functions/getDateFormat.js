const locale = Intl.DateTimeFormat().resolvedOptions().locale;
const options = {'year': 'numeric', 'month': '2-digit', day: '2-digit', timeZone: 'GMT'};

export default function getDateFormat() {
	return Intl.DateTimeFormat(locale, options).formatToParts().reduce(function (acc, cur) {
  		switch(cur.type) {
    		case "day": return acc + "DD";
    		case "month": return acc + "MM";
    		case "year": return acc + "YYYY";
    		case "literal": return acc + cur.value;
    		default: return acc;
  		}
	}, "");
}