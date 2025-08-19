const DisasterRecoveryTraining = artifacts.require("DisasterRecoveryTraining");

contract("DisasterRecoveryTraining", (accounts) => {
  let instance;

  before(async () => {
    // Deploy the contract
    instance = await DisasterRecoveryTraining.new();
    console.log("Contract deployed at:", instance.address);

    // Register admins
    await instance.registerAdmin(1, "Admin1", 35, { from: accounts[0] });
    await instance.registerAdmin(2, "Admin2", 40, { from: accounts[1] });

    // Register trainers
    await instance.registerTrainer(1, "Trainer1", 40, "Male", { from: accounts[0] });
    await instance.registerTrainer(2, "Trainer2", 32, "Female", { from: accounts[1] });

    // Register participants
    await instance.registerParticipant(1, "Alice", 25, "Female", "Dhaka", 0, false, { from: accounts[0] });
    await instance.registerParticipant(2, "Bob", 30, "Male", "Dhaka", 1, false, { from: accounts[0] });
    await instance.registerParticipant(3, "Charlie", 28, "Male", "Chittagong", 2, false, { from: accounts[1] });
    await instance.registerParticipant(4, "Diana", 22, "Female", "Dhaka", 0, false, { from: accounts[1] });
  });

  it("should return participant data correctly", async () => {
    const p1 = await instance.viewParticipantData(1);
    console.log("Participant 1:", p1.name, p1.district, p1.balance.toString());
  });

  it("should search participants by district and return sorted IDs + names", async () => {
    const result = await instance.searchParticipantsByDistrict("Dhaka");
    const totalInDistrict = result.totalInDistrict.toNumber ? result.totalInDistrict.toNumber() : result.totalInDistrict;
    const ids = result.participantIdsSorted.map(id => id.toNumber ? id.toNumber() : id);
    const names = result.participantNamesSorted;

    console.log("Total participants in Dhaka:", totalInDistrict);
    console.log("Sorted IDs:", ids);
    console.log("Names:", names);
  });

  it("should book a training slot for a participant", async () => {
    const booked = await instance.bookTrainingSlot(1, 1, 0, { from: accounts[0] });
    console.log("Training slot booked:", booked);
  });

  it("should view trainer schedule with available slots", async () => {
    const schedule = await instance.viewTrainerSchedule(1);
    console.log("Available Slots:", schedule.availableSlots.map(s => s.toNumber()));
    console.log("Time Ranges:", schedule.timeRanges);
  });
});

