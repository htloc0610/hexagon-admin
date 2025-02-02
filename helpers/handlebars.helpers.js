const moment = require('moment');

module.exports = {
    range: function (start, end, query, category, brand, min, max, rating) {
        let result = [];
        for (let i = start; i <= end; i++) {
            result.push({ i, query, category, brand, min, max, rating });
        }
        return result;
    },
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    eq: (a, b) => a == b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    getImage: (images, index) => {
        return images && images[index] ? images[index] : '';
    },
    times: (n, options) => {
        let result = "";
        for (let i = 0; i < n; i++) {
            result += options.fn(i);
        }
        return result;
    },
    formatDate: (date) => {
        return moment(date).format('DD/MM/YYYY, h:mm:ss a');
    },
    isActive: function (currentRoute, route, options) {
        return currentRoute === route ? options.fn(this) : options.inverse(this);
    },
    json: function (context) {
        return JSON.stringify(context);
    },
    formatPaymentMethod: function(paymentMethod) {
        if (!paymentMethod) return '';
        return paymentMethod
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },
    multiply: function(a, b) {
        return a * b;
    },
    timeAgo: function(date) {
        return moment(date).fromNow();
    }
};
