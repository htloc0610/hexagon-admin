const { DataTypes } = require('sequelize');
const db = require('../../configs/db');

const Review = db.define('review', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id',
        },
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },

    comment: {
        type: DataTypes.STRING,
    },

    rating: {
        type: DataTypes.INTEGER,
    },
}, {
  timestamps: true,
});

module.exports = Review;
