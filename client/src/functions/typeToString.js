import moment from "moment";

export default function typeToString (fieldValue, fieldType, myDateFormat) {
    if (fieldValue) {
        switch (fieldType) {
            case 'date': return String(moment.utc(fieldValue).format(myDateFormat));
            case 'number': return String(new Intl.NumberFormat().format(Math.round((fieldValue + Number.EPSILON) * 100) / 100));
            default: return fieldValue;
        }
    } else {
        return '';
    }
}