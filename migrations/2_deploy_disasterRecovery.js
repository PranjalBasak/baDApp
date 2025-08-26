

const DisasterRecoveryTraining = artifacts.require("DisasterRecoveryTraining");

module.exports = async function (deployer, network, accounts) {
  try {
    console.log(`\nDeploying DisasterRecoveryTraining to network: ${network}...\n`);

    
    await deployer.deploy(DisasterRecoveryTraining);
    const instance = await DisasterRecoveryTraining.deployed();
    console.log(`Contract deployed at address: ${instance.address}\n`);

    

    
    
    const adminId = 1;
    const adminName = "Admin1";
    const adminAge = 35;

    await instance.registerAdmin(adminId, adminName, adminAge, { from: accounts[0] });
    console.log(`Admin registered: ID=${adminId}, Name=${adminName}, Age=${adminAge}`);

    
    const trainerId = 1;
    const trainerName = "Trainer1";
    const trainerAge = 40;
    const trainerGender = "Male";

    await instance.registerTrainer(trainerId, trainerName, trainerAge, trainerGender, { from: accounts[0] });
    console.log(`Trainer registered: ID=${trainerId}, Name=${trainerName}, Age=${trainerAge}, Gender=${trainerGender}`);

    
    const participantId = 1;
    const participantName = "Participant1";
    const participantAge = 25;
    const participantGender = "Female";
    const participantDistrict = "Dhaka";
    const trainingInterest = 0; 
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
    console.log("\nDisasterRecoveryTraining deployment and initialization completed.\n");

  } catch (error) {
    console.error(" Deployment failed:", error);
  }
};

