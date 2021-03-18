const locale = Intl.DateTimeFormat().resolvedOptions().locale;
const options = {'year': 'numeric', 'month': '2-digit', day: '2-digit', timeZone: 'GMT'};

export default function getDateFormat() {
    let tempDateFormat = ''
    Intl.DateTimeFormat(locale, options).formatToParts().map(function (element) {
        switch(element.type) {
            case 'month': 
                tempDateFormat = tempDateFormat + 'MM';
                break;
            case 'literal': 
                tempDateFormat = tempDateFormat + element.value;
                break;
            case 'day': 
                tempDateFormat = tempDateFormat + 'DD';
                break;
            case 'year': 
                tempDateFormat = tempDateFormat + 'YYYY';
                break;
        }
    });
    return tempDateFormat;
}