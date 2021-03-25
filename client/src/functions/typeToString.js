import moment from "moment";

export default function typeToString (fieldValue, fieldType, myDateFormat) {
    switch (fieldType) {
        case 'date': return !fieldValue ? "" : String(moment.utc(fieldValue).format(myDateFormat));
        case 'number': return !fieldValue ? 0 : String(new Intl.NumberFormat().format(Math.round((fieldValue + Number.EPSILON) * 100) / 100));
        default: return !fieldValue ? "" : fieldValue;
    }
}