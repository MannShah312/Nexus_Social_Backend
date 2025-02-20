const sequelize = require("./config/database");
const TestTable = require("./models/test");

async function testDatabase() {
  try {
    await sequelize.sync({ force: true }); // Creates the table
    console.log("✅ Database connection successful & TestTable created!");

    // Insert a sample record
    await TestTable.create({ name: "Test Entry" });
    console.log("✅ Sample data inserted into TestTable!");

    // Fetch all records
    const records = await TestTable.findAll();
    console.log("✅ Retrieved data:", records.map((rec) => rec.toJSON()));

    process.exit();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

testDatabase();