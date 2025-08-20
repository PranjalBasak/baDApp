// migrations/2_deploy_disasterRecovery.js

const DisasterRecoveryTraining = artifacts.require("DisasterRecoveryTraining");

module.exports = async function (deployer, network, accounts) {
  try {
    console.log(`\nDeploying DisasterRecoveryTraining to network: ${network}...\n`);

    // 1️⃣ Deploy the contract
    await deployer.deploy(DisasterRecoveryTraining);
    const instance = await DisasterRecoveryTraining.deployed();
    console.log(`Contract deployed at address: ${instance.address}\n`);

    // 2️⃣ Optional: initialize some test data

    // Register an admin
    // Accounts[0] will be the deployer/admin
    const adminId = 1;
    const adminName = "Admin1";
    const adminAge = 35;

    await instance.registerAdmin(adminId, adminName, adminAge, { from: accounts[0] });
    console.log(`Admin registered: ID=${adminId}, Name=${adminName}, Age=${adminAge}`);

    // Register a trainer
    const trainerId = 1;
    const trainerName = "Trainer1";
    const trainerAge = 40;
    const trainerGender = "Male";

    await instance.registerTrainer(trainerId, trainerName, trainerAge, trainerGender, { from: accounts[0] });
    console.log(`Trainer registered: ID=${trainerId}, Name=${trainerName}, Age=${trainerAge}, Gender=${trainerGender}`);

    // Register a participant
    const participantId = 1;
    const participantName = "Participant1";
    const participantAge = 25;
    const participantGender = "Female";
    const participantDistrict = "Dhaka";
    const trainingInterest = 0; // first_aid
    const hasCompletedTraining = false;

    await instance.registerParticipant(
      participantId,
      participantName,
      participantAge,
      participantGender,
      participantDistrict,
      trainingInterest,
      hasCompletedTraining,
      { from: accounts[0] }
    );
    console.log(`Participant registered: ID=${participantId}, Name=${participantName}, District=${participantDistrict}`);
    
    console.log(`Used Address: ${accounts[0]}`);
    console.log("\n✅ DisasterRecoveryTraining deployment and initialization completed.\n");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
};

