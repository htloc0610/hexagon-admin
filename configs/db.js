const { Sequelize } = require("sequelize");

// Để sử dụng biến môi trường trong file .env
require("dotenv").config();

// Cấu hình kết nối
const sequelize = new Sequelize(
  process.env.DB_NAME, // Tên cơ sở dữ liệu
  process.env.DB_USER, // Tên người dùng
  process.env.DB_PASSWORD, // Mật khẩu
  {
    host: process.env.DB_HOST, // Địa chỉ host (ví dụ: localhost)
    dialect: process.env.DB_DIALECT, // Loại CSDL (ví dụ: mysql, postgres, sqlite, mssql)
    logging: false, // Tắt log SQL query trong console (tuỳ chọn)
    pool: {
      // Cấu hình connection pool (tuỳ chọn)
      max: 5, // Số lượng kết nối tối đa
      min: 0, // Số lượng kết nối tối thiểu
      acquire: 30000, // Thời gian tối đa (ms) để kết nối
      idle: 10000, // Thời gian tối đa (ms) kết nối không sử dụng sẽ bị đóng
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Đặt `false` nếu chứng chỉ không được xác thực
      }
      // ssl: false,
    },
  }
);

module.exports = sequelize;
