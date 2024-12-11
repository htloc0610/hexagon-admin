const User = require('./user.model'); 
const userService = {
    // Other service methods...

    async getAllUsers() {
        try {
            const users = await User.findAll(); // Retrieve all user records from the database
            return users;
        } catch (error) {
            throw new Error('Error retrieving users: ' + error.message);
        }
    },

    async getUserById(userId) {
        console.log('userId', userId);
        try {
            const user = await User.findByPk(userId); // Sử dụng primary key (id) để tìm người dùng
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error('Error fetching user: ' + error.message);
        }
    },
    async getPaginatedUsers(offset, limit) {
        try {
            const users = await User.findAll({ offset, limit }); // Retrieve paginated user records from the database
            return users;
        } catch (error) {
            throw new Error('Error retrieving paginated users: ' + error.message);
        }
    }
};

module.exports = userService;